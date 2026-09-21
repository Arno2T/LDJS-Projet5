"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSubscriptionsByUser } from "../subscriptions/actions";

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } } };
}>;

export type ArticleWithAuthorAndTheme = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } }; theme: true };
}>;

/**
 * Returns the articles of the themes the current user is subscribed to.
 *
 * @param sortParam - Order on `createdAt`. `"asc"` = oldest first. Any other
 * value (or none) falls back to `"desc"` (newest first).
 */
const getArticles = async (
  sortParam?: string,
): Promise<ArticleWithAuthor[]> => {
  await requireAuth();
  const subscriptions = await getSubscriptionsByUser();

  const themeIds = subscriptions.map((sub) => sub.themeId);
  const order: Prisma.SortOrder = sortParam === "asc" ? "asc" : "desc";

  return prisma.article.findMany({
    where: { themeId: { in: themeIds } },
    include: { author: { select: { username: true } } },
    orderBy: {
      createdAt: order,
    },
  });
};

const getArticleById = async (
  id: string,
): Promise<ArticleWithAuthorAndTheme | null> => {
  await requireAuth();

  return await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { username: true } }, theme: true },
  });
};

export { getArticles, getArticleById };
