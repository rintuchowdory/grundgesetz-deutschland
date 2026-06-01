import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllArticles,
  getArticleById,
  getUserConversations,
  createConversation,
  getConversationById,
  getConversationMessages,
  addMessage,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== Articles Router =====
  articles: router({
    /**
     * Fetch all articles with optional category filter
     */
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const allArticles = await getAllArticles();
        if (input?.category) {
          return allArticles.filter(a => a.category === input.category);
        }
        return allArticles;
      }),

    /**
     * Fetch a single article by ID
     */
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const article = await getArticleById(input);
        if (!article) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }
        return article;
      }),
  }),

  // ===== Conversations Router =====
  conversations: router({
    /**
     * Fetch all conversations for the current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    /**
     * Create a new conversation
     */
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        articleId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await createConversation({
          userId: ctx.user.id,
          title: input.title,
          articleId: input.articleId,
        });
        return conversation;
      }),

    /**
     * Fetch messages for a specific conversation
     */
    getMessages: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input: conversationId }) => {
        const conversation = await getConversationById(conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return await getConversationMessages(conversationId);
      }),
  }),

  // ===== Chat Router =====
  chat: router({
    /**
     * Send a message and get AI response with article context
     * Handles the full conversation flow: store user message, call LLM, store AI response
     */
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string(),
        articleId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify conversation ownership
        const conversation = await getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Store user message
        await addMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });

        // Fetch conversation history for context
        const conversationHistory = await getConversationMessages(input.conversationId);

        // Build system prompt with article context if available
        let systemPrompt = `Du bist GrundgesetzGPT, ein präziser KI-Assistent für das Grundgesetz der Bundesrepublik Deutschland. Du beantwortest Fragen auf Deutsch und Englisch.

Richtlinien:
- Antworte präzise und juristisch korrekt
- Erkläre Fachbegriffe in einfacher Sprache
- Verweise auf BVerfG-Urteile wenn passend
- Nutze konkrete Beispiele aus dem deutschen Alltag
- Bei Fragen auf Englisch, antworte auf Englisch
- Halte Antworten prägnant (max. 4 Absätze)
- Weise auf Rechtsberatungsbedarf hin bei spezifischen Rechtsfragen`;

        // Add article context if available
        if (input.articleId) {
          const article = await getArticleById(input.articleId);
          if (article) {
            systemPrompt += `\n\nAktuell diskutierter Artikel: ${article.number} — ${article.title}\nKategorie: ${article.category}\nInhalt:\n${article.body}`;
          }
        }

        // Prepare messages for LLM (convert DB format to LLM format)
        const messages = conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Add current user message
        messages.push({
          role: "user" as const,
          content: input.message,
        });

        try {
          // Call LLM with server-side API key (system prompt as first message)
          const llmMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages,
          ];

          const response = await invokeLLM({
            messages: llmMessages,
          });

          const aiResponseContent = response.choices?.[0]?.message?.content;
          const aiResponse = typeof aiResponseContent === "string" 
            ? aiResponseContent 
            : "Entschuldigung, ich konnte keine Antwort generieren.";

          // Store AI response
          await addMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: aiResponse,
          });

          return {
            success: true,
            response: aiResponse,
          };
        } catch (error) {
          console.error("[Chat] LLM call failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate response. Please try again.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
