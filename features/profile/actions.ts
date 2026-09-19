"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/schemas";
import { RegisterFormState } from "@/features/auth/actions";
import { hashPassword } from "@/lib/auth/password";

const getUserInformation = async (): Promise<{
  email: string;
  username: string;
} | null> => {
  const userId = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, username: true },
  });

  if (!user) {
    return null;
  }

  return { email: user.email, username: user.username };
};

const updateUserInformation = async (
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> => {
  const rawData = Object.fromEntries(formData);
  const validatedFields = registerSchema.safeParse(rawData);
  const userId = await requireAuth();

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "" };
  }

  const { email, username, password } = validatedFields.data;
  const hashedPassword = await hashPassword(password);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { email, username, password: hashedPassword },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { message: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé" };
    }
    throw error;
  }

  revalidatePath("/profile");
  return { message: "Profil mis à jour avec succès" };
};

export { getUserInformation, updateUserInformation };
