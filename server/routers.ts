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

const recentRequests = new Map<string, number>();
const REQUEST_COOLDOWN_MS = 5_000;
const MAX_QUESTION_LENGTH = 1_200;

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
        const id = await createConversation(ctx.user.id, input.title, input.messages);
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
