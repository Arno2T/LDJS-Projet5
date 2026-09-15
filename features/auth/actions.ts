"use server";

import { redirect } from "next/navigation";
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

export type LoginFormState = { message?: string } | undefined;
export type RegisterFormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message: string;
    }
  | undefined;

export const registerUser = async (
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> => {
  const rawData = Object.fromEntries(formData);
  const validatedFileds = registerSchema.safeParse(rawData);

  if (!validatedFileds.success) {
    return { errors: validatedFileds.error.flatten().fieldErrors, message: "" };
  }

  const { email, username, password } = validatedFileds.data;
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { message: "Cet e-mail ou ce nom d'utlisateur est déjà utilisé" };
    }
    throw error;
  }

  redirect("/themes");
};

export const login = async (
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> => {
  const rawData = Object.fromEntries(formData);
  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { message: "Veuillez renseigner vos identifiants" };
  }

  const { login, password } = validatedFields.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login }],
    },
  });

  if (!user) {
    return { message: "Email ou mot de passe non valide" };
  }

  const isPasswordValid = await isPasswordVerified(user.password, password);
  if (!isPasswordValid) {
    return { message: "Email ou mot de passe non valide" };
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  // TODO: redirect to articles
  redirect("/themes");
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userId = await getSession();

  if (!userId) {
    return null;
  }

  return await prisma.user.findUnique({ where: { id: userId } });
};

export const logout = async () => await deleteSessionCookie();
