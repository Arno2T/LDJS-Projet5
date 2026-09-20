"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Article, Prisma } from "@prisma/client";
import { getSubscriptionsByUser } from "../subscriptions/actions";

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } } };
}>;

export type ArticleWithAuthorAndTheme = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } }; theme: true };
}>;

const getArticles = async (): Promise<ArticleWithAuthor[]> => {
  await requireAuth();
  const subscriptions = await getSubscriptionsByUser();

  const themeIds = subscriptions.map((sub) => sub.themeId);

  return prisma.article.findMany({
    where: { themeId: { in: themeIds } },
    include: { author: { select: { username: true } } },
    orderBy: {
      createdAt: "desc",
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
