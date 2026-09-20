"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isUniqueConstraintError,
  isRecordNotFoundError,
} from "@/lib/prisma-errors";
import { Subscription } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * get the subscriptions for current user
 */
const getSubscriptionsByUser = async (): Promise<Subscription[]> => {
  const userId = await requireAuth();

  return prisma.subscription.findMany({
    where: { userId },
  });
};

const subscribe = async (
  themeId: string,
  _formData: FormData,
): Promise<void> => {
  const userId = await requireAuth();

  try {
    await prisma.subscription.create({
      data: { userId, themeId },
    });

    revalidatePath("/themes");
    revalidatePath("/profile");
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      console.error(error);
    } else {
      throw error;
    }
  }
};

const unsubscribe = async (
  themeId: string,
  _formData: FormData,
): Promise<void> => {
  const userId = await requireAuth();

  try {
    await prisma.subscription.delete({
      where: { userId_themeId: { userId, themeId } },
    });

    revalidatePath("/themes");
    revalidatePath("/profile");
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      console.error(error);
    } else {
      throw error;
    }
  }
};

export { getSubscriptionsByUser, subscribe, unsubscribe };
