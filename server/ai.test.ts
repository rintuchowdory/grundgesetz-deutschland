import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { invokeLLM } = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM,
}));

import { appRouter } from "./routers";

function createContext(ip: string): TrpcContext {
  return {
    user: null,
    req: {
      ip,
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ai.ask", () => {
  beforeEach(() => {
    invokeLLM.mockReset();
    invokeLLM.mockResolvedValue({
      choices: [
        {
          message: {
            role: "assistant",
            content: "## Einordnung\nArtikel 5 schützt die freie Meinungsäußerung.\n\n## Quelle und Grenze\nPrüfe den aktuellen Wortlaut.",
          },
        },
      ],
    });
  });

  it("sends a validated question to the server-side LLM and returns only safe answer data", async () => {
    const caller = appRouter.createCaller(createContext("test-ai-success"));
    const result = await caller.ai.ask({ question: "Was schützt Artikel 5 GG?" });

    expect(result.answer).toContain("Artikel 5 schützt");
    expect(result.question).toBe("Was schützt Artikel 5 GG?");
    expect(result.generatedBy).toBe("Manus LLM");
    expect(invokeLLM).toHaveBeenCalledOnce();
    expect(invokeLLM.mock.calls[0][0].messages[0].role).toBe("system");
    expect(invokeLLM.mock.calls[0][0].messages[0].content).toContain("Erfinde keine Artikel");
    expect(invokeLLM.mock.calls[0][0].messages[1]).toEqual({
      role: "user",
      content: "Was schützt Artikel 5 GG?",
    });
  });

  it("rejects questions that are too short", async () => {
    const caller = appRouter.createCaller(createContext("test-ai-validation"));

    await expect(caller.ai.ask({ question: "hi" })).rejects.toThrow();
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("slows repeated requests from the same client", async () => {
    const caller = appRouter.createCaller(createContext("test-ai-rate-limit"));

    await caller.ai.ask({ question: "Was bedeutet Artikel 3 GG?" });
    await expect(caller.ai.ask({ question: "Was bedeutet Artikel 20 GG?" })).rejects.toThrow(
      "warte einen kurzen Moment"
    );
    expect(invokeLLM).toHaveBeenCalledOnce();
  });
});
