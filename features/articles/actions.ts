"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Article } from "@prisma/client";
import { getSubscriptionsByUser } from "../subscriptions/actions";

const getArticles = async (): Promise<Article[]> => {
  await requireAuth();
  const subscriptions = await getSubscriptionsByUser();

  const themeIds = subscriptions.map((sub) => sub.themeId);

  return prisma.article.findMany({
    where: { themeId: { in: themeIds } },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export { getArticles };
