import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context for testing
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

function createMockContext(user: typeof mockUser | null = mockUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Articles Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext());
  });

  it("should fetch all articles", async () => {
    const articles = await caller.articles.list();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]).toHaveProperty("number");
    expect(articles[0]).toHaveProperty("title");
    expect(articles[0]).toHaveProperty("category");
    expect(articles[0]).toHaveProperty("body");
  });

  it("should fetch article by ID", async () => {
    const articles = await caller.articles.list();
    if (articles.length === 0) {
      console.warn("No articles in database, skipping getById test");
      return;
    }
    const firstArticle = articles[0];
    const article = await caller.articles.getById(firstArticle.id);
    expect(article).toBeDefined();
    expect(article.id).toBe(firstArticle.id);
    expect(article.number).toBe(firstArticle.number);
  });

  it("should throw error for non-existent article", async () => {
    try {
      await caller.articles.getById(99999);
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should filter articles by category", async () => {
    const allArticles = await caller.articles.list();
    if (allArticles.length === 0) {
      console.warn("No articles in database, skipping category filter test");
      return;
    }

    const firstCategory = allArticles[0].category;
    const filtered = await caller.articles.list({ category: firstCategory });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(a => a.category === firstCategory)).toBe(true);
  });
});

describe("Conversations Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext());
  });

  it("should create a conversation", async () => {
    const conversation = await caller.conversations.create({
      title: "Test Conversation",
    });
    expect(conversation).toBeDefined();
    expect(conversation.id).toBeDefined();
    expect(conversation.title).toBe("Test Conversation");
    expect(conversation.userId).toBe(mockUser.id);
  });

  it("should list user conversations", async () => {
    // Create a conversation first
    await caller.conversations.create({
      title: "Test Conversation 1",
    });

    const conversations = await caller.conversations.list();
    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThan(0);
    expect(conversations[0]).toHaveProperty("id");
    expect(conversations[0]).toHaveProperty("title");
    expect(conversations[0]).toHaveProperty("userId");
  });

  it("should prevent access to other users' conversations", async () => {
    // Create conversation with first user
    const conv = await caller.conversations.create({
      title: "Private Conversation",
    });

    // Try to access with different user context
    const otherUserContext = createMockContext({
      ...mockUser,
      id: 2,
      openId: "other-user",
    });
    const otherCaller = appRouter.createCaller(otherUserContext);

    try {
      await otherCaller.conversations.getMessages(conv.id);
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("Auth Router", () => {
  it("should return current user with me query", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toEqual(mockUser);
  });

  it("should return null for unauthenticated me query", async () => {
    const ctx = createMockContext(null);
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});
