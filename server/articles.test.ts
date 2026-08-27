import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  deleteConversation: vi.fn(),
}));

const { invokeLLM } = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/llm", () => ({ invokeLLM }));

import { appRouter } from "./routers";

const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user: TrpcContext["user"] = mockUser, ip = "legacy-test"): TrpcContext {
  return {
    user,
    req: { ip, headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("Grundgesetz-KI Router", () => {
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

  it("erklärt eine konkrete Artikel-Frage über den serverseitigen KI-Endpunkt", async () => {
    const caller = appRouter.createCaller(createMockContext(null, "legacy-ai-success"));

    const result = await caller.ai.ask({ question: "Was schützt Artikel 5 GG?" });

    expect(result).toMatchObject({
      question: "Was schützt Artikel 5 GG?",
      generatedBy: "Manus LLM",
    });
    expect(result.answer).toContain("Artikel 5 schützt");
    expect(invokeLLM).toHaveBeenCalledOnce();
    expect(invokeLLM.mock.calls[0]?.[0].messages[1]).toEqual({
      role: "user",
      content: "Was schützt Artikel 5 GG?",
    });
  });
});

describe("History Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verlangt Anmeldung für persönliche Verläufe", async () => {
    const caller = appRouter.createCaller(createMockContext(null, "legacy-history-anonymous"));

    await expect(caller.history.list()).rejects.toThrow("Please login");
    await expect(caller.history.get({ id: 1 })).rejects.toThrow("Please login");
    await expect(caller.history.remove({ id: 1 })).rejects.toThrow("Please login");
  });

  it("speichert, listet, lädt und löscht nur den Verlauf des angemeldeten Nutzers", async () => {
    const createdAt = new Date("2026-08-27T00:00:00.000Z");
    const messages = [
      { role: "user" as const, content: "Was schützt Artikel 5 GG?" },
      { role: "assistant" as const, content: "Artikel 5 schützt die Meinungsfreiheit." },
    ];
    dbMocks.createConversation.mockResolvedValue(7);
    dbMocks.listConversations.mockResolvedValue([{ id: 7, title: "Artikel 5", createdAt, updatedAt: createdAt }]);
    dbMocks.getConversation.mockResolvedValue({ id: 7, userId: mockUser.id, title: "Artikel 5", messages });
    dbMocks.deleteConversation.mockResolvedValue(true);

    const caller = appRouter.createCaller(createMockContext(mockUser, "legacy-history-user"));

    await expect(caller.history.save({ title: "Artikel 5", messages })).resolves.toEqual({ id: 7 });
    await expect(caller.history.list()).resolves.toHaveLength(1);
    await expect(caller.history.get({ id: 7 })).resolves.toMatchObject({ id: 7, userId: mockUser.id });
    await expect(caller.history.remove({ id: 7 })).resolves.toEqual({ deleted: true });

    expect(dbMocks.createConversation).toHaveBeenCalledWith(mockUser.id, "Artikel 5", messages);
    expect(dbMocks.listConversations).toHaveBeenCalledWith(mockUser.id);
    expect(dbMocks.getConversation).toHaveBeenCalledWith(mockUser.id, 7);
    expect(dbMocks.deleteConversation).toHaveBeenCalledWith(mockUser.id, 7);
  });

  it("validiert positive IDs beim Laden und Löschen", async () => {
    const caller = appRouter.createCaller(createMockContext(mockUser, "legacy-history-validation"));

    await expect(caller.history.get({ id: 0 })).rejects.toThrow();
    await expect(caller.history.remove({ id: 0 })).rejects.toThrow();
    expect(dbMocks.getConversation).not.toHaveBeenCalled();
    expect(dbMocks.deleteConversation).not.toHaveBeenCalled();
  });
});

describe("Auth Router", () => {
  it("liefert den aktuellen Nutzer", async () => {
    const caller = appRouter.createCaller(createMockContext(mockUser, "legacy-auth-user"));

    await expect(caller.auth.me()).resolves.toEqual(mockUser);
  });

  it("liefert null ohne Anmeldung", async () => {
    const caller = appRouter.createCaller(createMockContext(null, "legacy-auth-anonymous"));

    await expect(caller.auth.me()).resolves.toBeNull();
  });
});
