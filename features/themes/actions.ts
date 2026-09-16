"use server";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Theme } from "@prisma/client";

/**
 * Get the list of available themes sorted by name
 *
 * @returns Theme list, sorted by name (A → Z).
 */
const getThemes = async (): Promise<Theme[]> => {
  await requireAuth();
  return await prisma.theme.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export { getThemes };
