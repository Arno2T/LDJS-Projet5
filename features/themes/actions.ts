"use server";

import { prisma } from "@/lib/prisma";
import { Theme } from "@prisma/client";

/**
 * Get the list of available themes sorted by name
 *
 * @returns Theme list, sorted by name (A → Z).
 */
const getThemes = async (): Promise<Theme[]> => {
  return await prisma.theme.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export { getThemes };
