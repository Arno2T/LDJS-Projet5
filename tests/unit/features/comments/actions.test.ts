import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createTestArticle,
  createTestComment,
  createTestTheme,
  createTestUser,
  resetDb,
  testPrisma,
} from "@/tests/setup/db";

// `requireAuth` mocked, resolving to a
// real user created in `beforeEach` because comments have a foreign key on
// their author.
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn(),
}));

import { requireAuth } from "@/lib/auth/session";
import {
  createComment,
  getCommentsByArticle,
} from "@/features/comments/actions";

const toFormData = (fields: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

describe("comments actions", () => {
  let currentUser: Awaited<ReturnType<typeof createTestUser>>;
  let article: Awaited<ReturnType<typeof createTestArticle>>;

  beforeEach(async () => {
    await resetDb();
    currentUser = await createTestUser({ username: "current" });
    const theme = await createTestTheme();
    article = await createTestArticle({
      authorId: currentUser.id,
      themeId: theme.id,
    });
    vi.mocked(requireAuth).mockResolvedValue(currentUser.id);
  });

  afterEach(async () => {
    await resetDb();
  });

  describe("getCommentsByArticle", () => {
    it("returns only the comments of the requested article (regression: where filtered on the comment id)", async () => {
      const otherArticle = await createTestArticle({
        authorId: currentUser.id,
        themeId: article.themeId,
      });
      await createTestComment({
        authorId: currentUser.id,
        articleId: article.id,
        content: "on A",
      });
      await createTestComment({
        authorId: currentUser.id,
        articleId: otherArticle.id,
        content: "on B",
      });

      const commentsOfA = await getCommentsByArticle(article.id);
      const commentsOfB = await getCommentsByArticle(otherArticle.id);

      expect(commentsOfA.map((comment) => comment.content)).toEqual(["on A"]);
      expect(commentsOfB.map((comment) => comment.content)).toEqual(["on B"]);
    });

    it("returns the most recent first, with the author's username", async () => {
      const author = await createTestUser({ username: "commenter" });
      await createTestComment({
        authorId: author.id,
        articleId: article.id,
        content: "oldest",
        createdAt: new Date("2026-01-01"),
      });
      await createTestComment({
        authorId: author.id,
        articleId: article.id,
        content: "newest",
        createdAt: new Date("2026-03-01"),
      });
      await createTestComment({
        authorId: author.id,
        articleId: article.id,
        content: "middle",
        createdAt: new Date("2026-02-01"),
      });

      const comments = await getCommentsByArticle(article.id);

      expect(comments.map((comment) => comment.content)).toEqual([
        "newest",
        "middle",
        "oldest",
      ]);
      expect(comments[0].author).toEqual({ username: "commenter" });
    });

    it("returns an empty array for an article without comments", async () => {
      expect(await getCommentsByArticle(article.id)).toEqual([]);
    });

    it("requires authentication", async () => {
      await getCommentsByArticle(article.id);

      expect(vi.mocked(requireAuth)).toHaveBeenCalled();
    });
  });

  describe("createComment", () => {
    // Called exactly like the Client Component does through `useActionState`:
    // `articleId` bound ahead of time, React then passes (prevState, formData).
    const submit = (articleId: string, fields: Record<string, string>) =>
      createComment.bind(null, articleId)(undefined, toFormData(fields));

    it("creates the comment for the session user on the bound article and revalidates the article page", async () => {
      const result = await submit(article.id, { content: "  Nice article  " });

      expect(result).toBeUndefined();
      const comment = await testPrisma.comment.findFirstOrThrow();
      expect(comment.authorId).toBe(currentUser.id);
      expect(comment.articleId).toBe(article.id);
      // Zod's `trim()` is applied before saving.
      expect(comment.content).toBe("Nice article");
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
        `/articles/${article.id}`,
      );
    });

    it("ignores an authorId or articleId injected in the form: both come from the session / the binding", async () => {
      const victim = await createTestUser({ username: "victim" });
      const otherArticle = await createTestArticle({
        authorId: victim.id,
        themeId: article.themeId,
      });

      await submit(article.id, {
        content: "hello",
        authorId: victim.id,
        articleId: otherArticle.id,
      });

      const comment = await testPrisma.comment.findFirstOrThrow();
      expect(comment.authorId).toBe(currentUser.id);
      expect(comment.articleId).toBe(article.id);
    });

    it("returns the field error AND the submitted value on a validation error, and creates nothing", async () => {
      const result = await submit(article.id, { content: "   " });

      expect(result?.errors?.content).toBeDefined();
      expect(result?.values).toEqual({ content: "   " });
      expect(await testPrisma.comment.count()).toBe(0);
      expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
    });

    it("returns a dedicated message (no exception) when the article no longer exists", async () => {
      const result = await submit("deleted-article-id", { content: "hello" });

      expect(result).toEqual({
        message: "Cet article n'existe plus",
        values: { content: "hello" },
      });
      expect(await testPrisma.comment.count()).toBe(0);
      expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
    });
  });

  describe("createComment: edge cases", () => {
    it("rethrows an unexpected error (only a foreign-key violation is turned into a message)", async () => {
      vi.spyOn(prisma.comment, "create").mockRejectedValueOnce(
        new Error("boom"),
      );

      await expect(
        createComment.bind(null, article.id)(
          undefined,
          toFormData({ content: "hello" }),
        ),
      ).rejects.toThrow("boom");
    });

    it("returns an empty string as `values.content` when the field is missing", async () => {
      const result = await createComment.bind(null, article.id)(
        undefined,
        new FormData(),
      );

      expect(result?.values).toEqual({ content: "" });
      expect(result?.errors?.content).toBeDefined();
    });
  });
});
