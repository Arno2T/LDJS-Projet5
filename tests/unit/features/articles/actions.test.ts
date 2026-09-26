import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createTestArticle,
  createTestSubscription,
  createTestTheme,
  createTestUser,
  resetDb,
  testPrisma,
} from "@/tests/setup/db";

// Here `requireAuth` is mocked. It resolves to the id of a
// real user created in `beforeEach`, because articles have a foreign key on
// their author. `getSubscriptionsByUser` is NOT mocked: real `Subscription`
// rows in the test database exercise the real join.
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn(),
}));

import { requireAuth } from "@/lib/auth/session";
import {
  createArticle,
  getArticleById,
  getArticles,
} from "@/features/articles/actions";

const LONG_CONTENT = "x".repeat(300);

const toFormData = (fields: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

describe("articles actions", () => {
  let currentUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await resetDb();
    currentUser = await createTestUser({ username: "current" });
    vi.mocked(requireAuth).mockResolvedValue(currentUser.id);
  });

  afterEach(async () => {
    await resetDb();
  });

  describe("getArticles", () => {
    it("returns only the articles of the themes the user is subscribed to", async () => {
      const author = await createTestUser({ username: "author" });
      const followedA = await createTestTheme({ name: "A-followed" });
      const followedB = await createTestTheme({ name: "B-followed" });
      const notFollowed = await createTestTheme({ name: "C-not-followed" });
      await createTestSubscription(currentUser.id, followedA.id);
      await createTestSubscription(currentUser.id, followedB.id);

      await createTestArticle({
        authorId: author.id,
        themeId: followedA.id,
        title: "in A",
      });
      await createTestArticle({
        authorId: author.id,
        themeId: followedB.id,
        title: "in B",
      });
      await createTestArticle({
        authorId: author.id,
        themeId: notFollowed.id,
        title: "in C",
      });

      const articles = await getArticles();

      expect(articles.map((article) => article.title).sort()).toEqual([
        "in A",
        "in B",
      ]);
      expect(articles[0].author.username).toBe("author");
    });

    it("ignores the subscriptions of other users", async () => {
      const other = await createTestUser({ username: "other" });
      const theme = await createTestTheme();
      await createTestSubscription(other.id, theme.id);
      await createTestArticle({ authorId: other.id, themeId: theme.id });

      expect(await getArticles()).toEqual([]);
    });

    it("returns an empty array when the user follows no theme", async () => {
      const theme = await createTestTheme();
      await createTestArticle({ authorId: currentUser.id, themeId: theme.id });

      expect(await getArticles()).toEqual([]);
    });

    describe("sorting on createdAt", () => {
      beforeEach(async () => {
        const theme = await createTestTheme();
        await createTestSubscription(currentUser.id, theme.id);
        await createTestArticle({
          authorId: currentUser.id,
          themeId: theme.id,
          title: "middle",
          createdAt: new Date("2026-02-01"),
        });
        await createTestArticle({
          authorId: currentUser.id,
          themeId: theme.id,
          title: "oldest",
          createdAt: new Date("2026-01-01"),
        });
        await createTestArticle({
          authorId: currentUser.id,
          themeId: theme.id,
          title: "newest",
          createdAt: new Date("2026-03-01"),
        });
      });

      const titles = (articles: { title: string }[]) =>
        articles.map((article) => article.title);

      it('"asc" returns the oldest first', async () => {
        expect(titles(await getArticles("asc"))).toEqual([
          "oldest",
          "middle",
          "newest",
        ]);
      });

      it.each([
        { case: "no parameter", param: undefined },
        { case: '"desc"', param: "desc" },
        { case: 'an unknown value ("foo")', param: "foo" },
      ])("$case returns the newest first", async ({ param }) => {
        expect(titles(await getArticles(param))).toEqual([
          "newest",
          "middle",
          "oldest",
        ]);
      });
    });

    it("requires authentication", async () => {
      await getArticles();

      expect(vi.mocked(requireAuth)).toHaveBeenCalled();
    });
  });

  describe("getArticleById", () => {
    it("returns the article with its author's username and its theme", async () => {
      const theme = await createTestTheme({ name: "TypeScript" });
      const article = await createTestArticle({
        authorId: currentUser.id,
        themeId: theme.id,
      });

      const found = await getArticleById(article.id);

      expect(found?.id).toBe(article.id);
      expect(found?.author).toEqual({ username: "current" });
      expect(found?.theme.name).toBe("TypeScript");
    });

    it("returns null (no exception) for an unknown id", async () => {
      expect(await getArticleById("does-not-exist")).toBeNull();
    });
  });

  describe("createArticle", () => {
    it("creates the article for the session user, revalidates the feed and redirects to it", async () => {
      const theme = await createTestTheme();

      await createArticle(
        undefined,
        toFormData({
          themeId: theme.id,
          title: "  A valid article title  ",
          content: LONG_CONTENT,
        }),
      );

      const article = await testPrisma.article.findFirstOrThrow();
      expect(article.authorId).toBe(currentUser.id);
      expect(article.themeId).toBe(theme.id);
      // Zod's `trim()` is applied before saving.
      expect(article.title).toBe("A valid article title");
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/articles");
      expect(vi.mocked(redirect)).toHaveBeenCalledWith(
        `/articles/${article.id}`,
      );
    });

    it("ignores an authorId injected in the form: the author is always the session user", async () => {
      const theme = await createTestTheme();
      const victim = await createTestUser({ username: "victim" });

      await createArticle(
        undefined,
        toFormData({
          themeId: theme.id,
          title: "A valid article title",
          content: LONG_CONTENT,
          authorId: victim.id,
        }),
      );

      const article = await testPrisma.article.findFirstOrThrow();
      expect(article.authorId).toBe(currentUser.id);
      expect(article.authorId).not.toBe(victim.id);
    });

    it("returns field errors AND the submitted values on a validation error, and creates nothing", async () => {
      const theme = await createTestTheme();
      const submitted = {
        themeId: theme.id,
        title: "short",
        content: "too short",
      };

      const result = await createArticle(undefined, toFormData(submitted));

      expect(result?.errors?.title).toBeDefined();
      expect(result?.errors?.content).toBeDefined();
      expect(result?.errors?.themeId).toBeUndefined();
      expect(result?.values).toEqual(submitted);
      expect(await testPrisma.article.count()).toBe(0);
      expect(vi.mocked(redirect)).not.toHaveBeenCalled();
    });

    it("returns a dedicated message (no exception) when the theme does not exist", async () => {
      const values = {
        themeId: "unknown-theme-id",
        title: "A valid article title",
        content: LONG_CONTENT,
      };

      const result = await createArticle(undefined, toFormData(values));

      expect(result).toEqual({ message: "Ce thème n'existe pas", values });
      expect(await testPrisma.article.count()).toBe(0);
      expect(vi.mocked(redirect)).not.toHaveBeenCalled();
    });
  });

  describe("createArticle: edge cases on the submitted form", () => {
    it("rethrows an unexpected error (only a foreign-key violation is turned into a message)", async () => {
      const theme = await createTestTheme();
      vi.spyOn(prisma.article, "create").mockRejectedValueOnce(
        new Error("boom"),
      );

      await expect(
        createArticle(
          undefined,
          toFormData({
            themeId: theme.id,
            title: "A valid article title",
            content: LONG_CONTENT,
          }),
        ),
      ).rejects.toThrow("boom");
    });

    it("returns empty strings as `values` when fields are missing from the form", async () => {
      const result = await createArticle(undefined, new FormData());

      expect(result?.values).toEqual({ themeId: "", title: "", content: "" });
      expect(result?.errors).toBeDefined();
    });
  });
});
