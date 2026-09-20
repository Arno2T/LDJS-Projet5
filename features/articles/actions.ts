"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSubscriptionsByUser } from "../subscriptions/actions";

export type ArticleWithAuthor = Prisma.ArticleGetPayload<{
  include: { author: { select: { username: true } } };
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

export { getArticles };
