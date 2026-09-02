/*
 * Public question endpoint: the browser only sees this typed procedure.
 * Manus Forge credentials stay inside invokeLLM on the server.
 */
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { invokeLLM } from "./_core/llm";
import { createConversation, deleteConversation, getConversation, listConversations } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getArticleSource, getArticleSourceUrl, officialGrundgesetzUrl } from "@shared/article-sources";

const recentRequests = new Map<string, number>();
const REQUEST_COOLDOWN_MS = 5_000;
const COMPARE_COOLDOWN_MS = 8_000;
const recentCompareRequests = new Map<string, number>();
const MAX_QUESTION_LENGTH = 1_200;
const MAX_STORED_MESSAGE_LENGTH = 8_000;

function minimizeStoredText(value: string) {
  return value
    .trim()
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[E-Mail redigiert]")
    .replace(/(?:\+49[0-9 ]{8,}|0[1-9][0-9 ]{7,})/g, "[Telefonnummer redigiert]")
    .replace(/\](?=[A-Za-zÄÖÜäöü])/g, "] ")
    .slice(0, MAX_STORED_MESSAGE_LENGTH);
}

const constitutionalSystemPrompt = `Du bist Grundgesetz Deutschland, ein vorsichtiges Recherchewerkzeug zum deutschen Grundgesetz.

Arbeitsweise:
- Antworte auf Deutsch, klar, ruhig und möglichst verständlich.
- Trenne ausdrücklich zwischen dem Wortlaut des Grundgesetzes, allgemeiner Einordnung und offenen Einzelfallfragen.
- Erfinde keine Artikel, Gerichtsentscheidungen, Quellen, Zitate oder Fundstellen.
- Wenn die Frage von aktueller Rechtsprechung, einem konkreten Fall oder nicht bereitgestellten Quellen abhängt, sage das offen.
- Gib keine individuelle Rechtsberatung, keine Handlungsanweisung und keine Einschätzung mit Gewissheit.
- Weise bei konkreten Rechtsfällen auf eine qualifizierte Rechtsberatung hin.
- Beende jede Antwort mit einem kurzen Abschnitt „Quelle und Grenze“ und nenne dort den einschlägigen Artikel nur, wenn du ihn sicher kennst.
- Wenn die Frage nicht zum deutschen Grundgesetz gehört, sage das höflich und erkläre kurz, wobei du helfen kannst.

Format:
## Einordnung
[Antwort in verständlicher Sprache]

## Quelle und Grenze
[Artikel oder Hinweis auf notwendige Prüfung; keine erfundenen Links]`;

function getClientKey(req: { ip?: string; headers: Record<string, unknown> }) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() || "forwarded-client";
  }
  return req.ip || "unknown-client";
}

function getTextContent(content: string | Array<{ type: string; text?: string }>) {
  if (typeof content === "string") return content.trim();
  return content
    .map(part => part.text || "")
    .join("\n")
    .trim();
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  ai: router({
    ask: publicProcedure
      .input(z.object({ question: z.string().trim().min(3).max(MAX_QUESTION_LENGTH) }))
      .mutation(async ({ ctx, input }) => {
        const clientKey = getClientKey(ctx.req);
        const now = Date.now();
        const lastRequest = recentRequests.get(clientKey) ?? 0;
        if (now - lastRequest < REQUEST_COOLDOWN_MS) {
          throw new Error("Bitte warte einen kurzen Moment, bevor du eine weitere Frage stellst.");
        }
        recentRequests.set(clientKey, now);

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: constitutionalSystemPrompt },
              { role: "user", content: input.question },
            ],
            maxTokens: 1_100,
          });
          const message = result.choices[0]?.message;
          const answer = message ? getTextContent(message.content) : "";
          if (!answer) throw new Error("The model returned an empty response");
          return {
            answer,
            question: input.question,
            generatedBy: "Manus LLM",
          };
        } catch (error) {
          console.error("[AI] Question failed:", error instanceof Error ? error.message : "unknown error");
          throw new Error("Die Antwort konnte gerade nicht erstellt werden. Bitte prüfe deine Frage und versuche es erneut.");
        }
      }),
  }),

  compare: router({
    articles: publicProcedure
      .input(z.object({
        left: z.object({ id: z.string().regex(/^\d{1,3}[a-z]?$/i), label: z.string().trim().min(1).max(80) }),
        right: z.object({ id: z.string().regex(/^\d{1,3}[a-z]?$/i), label: z.string().trim().min(1).max(80) }),
      }).refine(value => value.left.id !== value.right.id, { message: "Bitte zwei unterschiedliche Artikel auswählen." }))
      .mutation(async ({ ctx, input }) => {
        const clientKey = getClientKey(ctx.req);
        const now = Date.now();
        const lastRequest = recentCompareRequests.get(clientKey) ?? 0;
        if (now - lastRequest < COMPARE_COOLDOWN_MS) {
          throw new Error("Bitte warte kurz, bevor du einen weiteren Vergleich startest.");
        }
        recentCompareRequests.set(clientKey, now);
        const left = getArticleSource(input.left.id, input.left.label);
        const right = getArticleSource(input.right.id, input.right.label);
        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: `${constitutionalSystemPrompt}\n\nDu vergleichst genau zwei vorgegebene Grundgesetzartikel. Nutze nur die bereitgestellten Auszüge und erfinde keine fehlenden Wortlaute. Trenne Gemeinsamkeiten, Unterschiede, Schutzrichtung und Grenzen. Sage ausdrücklich, wenn für eine vollständige Prüfung der amtliche Wortlaut geöffnet werden muss.\n\nFormatiere mit den Überschriften ## Gemeinsamkeiten, ## Unterschiede, ## Quellen und Grenze.` },
              { role: "user", content: `Artikel A: ${left.label} (ID ${left.id})\nAuszug: ${left.text}\nAmtliche Quelle: ${officialGrundgesetzUrl}\n\nArtikel B: ${right.label} (ID ${right.id})\nAuszug: ${right.text}\nAmtliche Quelle: ${officialGrundgesetzUrl}` },
            ],
            maxTokens: 1_200,
          });
          const message = result.choices[0]?.message;
          const explanation = message ? getTextContent(message.content) : "";
          if (!explanation) throw new Error("The model returned an empty response");
          return {
            explanation,
            articles: [
              { ...left, url: getArticleSourceUrl(left.id) },
              { ...right, url: getArticleSourceUrl(right.id) },
            ],
          };
        } catch (error) {
          console.error("[AI] Comparison failed:", error instanceof Error ? error.message : "unknown error");
          throw new Error("Der Vergleich konnte gerade nicht erstellt werden. Bitte versuche es später erneut.");
        }
      }),
  }),

  history: router({
    save: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(1).max(180),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(20_000),
        })).min(1).max(40),
      }))
      .mutation(async ({ ctx, input }) => {
        const minimizedMessages = input.messages.map(message => ({
          role: message.role,
          content: minimizeStoredText(message.content),
        }));
        const id = await createConversation(ctx.user.id, minimizeStoredText(input.title).slice(0, 180), minimizedMessages);
        return { id };
      }),
    list: protectedProcedure.query(({ ctx }) => listConversations(ctx.user.id)),
    get: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(({ ctx, input }) => getConversation(ctx.user.id, input.id)),
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => ({ deleted: await deleteConversation(ctx.user.id, input.id) })),
  }),
});

export type AppRouter = typeof appRouter;
