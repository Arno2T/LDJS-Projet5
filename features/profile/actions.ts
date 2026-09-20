"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/schemas";
import { RegisterFormState } from "@/features/auth/actions";
import { hashPassword } from "@/lib/auth/password";
import { parseFormData } from "@/lib/forms";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

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
  const validatedFields = parseFormData(registerSchema, formData);
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
    if (isUniqueConstraintError(error)) {
      return { message: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé" };
    }
    throw error;
  }

  revalidatePath("/profile");
  return { message: "Profil mis à jour avec succès" };
};

export { getUserInformation, updateUserInformation };
