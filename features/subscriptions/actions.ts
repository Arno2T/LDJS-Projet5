"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Subscription } from "@prisma/client";

/**
 * get the subscriptions for current user
 */
const getSubscriptionsByUser = async (): Promise<Subscription[]> => {
  const userId = await requireAuth();

  return prisma.subscription.findMany({
    where: { userId },
  });
};

const subscribe = async () => {};

const unsubscribe = async () => {};

export { getSubscriptionsByUser };
