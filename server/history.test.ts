import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createConversation: vi.fn(),
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  deleteConversation: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { ip: "history-test", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const user = {
  id: 42,
  openId: "history-user",
  email: "history@example.com",
  name: "History User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("history access control", () => {
  it("does not expose saved conversations to anonymous visitors", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.history.list()).rejects.toThrow("Please login");
    await expect(caller.history.get({ id: 1 })).rejects.toThrow("Please login");
    await expect(caller.history.remove({ id: 1 })).rejects.toThrow("Please login");
  });

  it("requires a positive integer when loading a conversation", async () => {
    const caller = appRouter.createCaller(createContext(user));
    await expect(caller.history.get({ id: 0 })).rejects.toThrow();
  });

  it("passes the authenticated user id to all persistence operations", async () => {
    dbMocks.createConversation.mockResolvedValue(7);
    dbMocks.listConversations.mockResolvedValue([{ id: 7, title: "Artikel 5", createdAt: new Date(), updatedAt: new Date() }]);
    dbMocks.getConversation.mockResolvedValue({ id: 7, userId: 42, title: "Artikel 5", messages: [] });
    dbMocks.deleteConversation.mockResolvedValue(true);
    const caller = appRouter.createCaller(createContext(user));
    const messages = [{ role: "user" as const, content: "Was schützt Artikel 5?" }];

    await expect(caller.history.save({ title: "Artikel 5", messages })).resolves.toEqual({ id: 7 });
    await expect(caller.history.list()).resolves.toHaveLength(1);
    await expect(caller.history.get({ id: 7 })).resolves.toMatchObject({ id: 7 });
    await expect(caller.history.remove({ id: 7 })).resolves.toEqual({ deleted: true });
    expect(dbMocks.createConversation).toHaveBeenCalledWith(42, "Artikel 5", messages);
    expect(dbMocks.listConversations).toHaveBeenCalledWith(42);
    expect(dbMocks.getConversation).toHaveBeenCalledWith(42, 7);
    expect(dbMocks.deleteConversation).toHaveBeenCalledWith(42, 7);
  });
});
