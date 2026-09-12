"use server";

import { hashPassword, isPasswordVerified } from "@/lib/auth/password";
import { registerSchema, loginSchema } from "./schemas";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import z from "zod";
import {
  getSession,
  createSession,
  setSessionCookie,
  deleteSessionCookie,
} from "@/lib/auth/session";

export const registerUser = async (
  data: z.infer<typeof registerSchema>,
): Promise<{ user: User; token: string }> => {
  registerSchema.parse(data);

  const { email, username, password } = data;
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return { user, token };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Cet e-mail ou ce nom d'utilisateur est déjà utilisé");
    }
    throw error;
  }
};

export const login = async (
  data: z.infer<typeof loginSchema>,
): Promise<{ user: User; token: string }> => {
  loginSchema.parse(data);

  const { login, password } = data;
  const invalidCredentialsError = new Error("Email ou mot de passe non valide");

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login }],
    },
  });

  if (!user) {
    throw invalidCredentialsError;
  }

  const isPasswordValid = await isPasswordVerified(user.password, password);
  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return { user, token };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userId = await getSession();

  if (!userId) {
    return null;
  }

  return await prisma.user.findUnique({ where: { id: userId } });
};

export const logout = async () => await deleteSessionCookie();
