"use server";

import { redirect } from "next/navigation";
import { hashPassword, isPasswordVerified } from "@/lib/auth/password";
import { registerSchema, loginSchema } from "./schemas";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { parseFormData } from "@/lib/forms";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import {
  getSession,
  createSession,
  setSessionCookie,
  deleteSessionCookie,
} from "@/lib/auth/session";

/** State returned by `login` to the login form (`useActionState`). Only
 * ever carries a generic `message` — on purpose, so the form never reveals
 * whether the identifier or the password was the wrong one. `undefined`
 * before the first submission. */
export type LoginFormState = { message?: string } | undefined;

/**
 * State returned by `registerUser` (and reused by `updateUserInformation`,
 * see `features/profile/actions.ts`) to the form that submitted it
 * (`useActionState`).
 *
 * - `errors`: validation messages per field.
 * - `message`: general error message (empty when there is none).
 *
 * `undefined` before the first submission.
 */
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

/**
 * Creates a new user account and immediately signs them in.
 *
 * Validates the form with `registerSchema`, hashes the password with Argon2
 * (`hashPassword`) before it ever reaches the database, then creates the
 * `User` row. On success, a JWT session is created and stored in the
 * `userSession` cookie, and the user is redirected to `/articles`. If the
 * email or username already exists, the unique constraint violation (Prisma
 * `P2002`) is caught and turned into a user-facing message instead of
 * propagating as an unhandled error.
 *
 * @param _prevState - Previous form state (unused, required by `useActionState`).
 * @param formData - The submitted registration form.
 * @returns The form state to display when the account was not created.
 */
export const registerUser = async (
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> => {
  const validatedFields = parseFormData(registerSchema, formData);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: "" };
  }

  const { email, username, password } = validatedFields.data;
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    const token = await createSession(user.id);
    await setSessionCookie(token);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { message: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé" };
    }
    throw error;
  }

  redirect("/articles");
};

/**
 * Signs an existing user in.
 *
 * The submitted `login` field is matched against either `email` or
 * `username` (`OR` clause), so a single input covers both identifiers. The
 * user row is fetched with `omit: { password: false }` because the global
 * Prisma client (`lib/prisma.ts`) otherwise always omits `password` from
 * every query — this is the one place that deliberately opts back in, to
 * verify it with `isPasswordVerified` (Argon2). On success, a JWT session
 * is created and stored in the `userSession` cookie and the user is
 * redirected to `/articles`.
 *
 * @remarks
 * Both the "unknown identifier" and "wrong password" cases return the same
 * generic message, so a failed attempt never discloses which of the two was
 * incorrect.
 *
 * @param _prevState - Previous form state (unused, required by `useActionState`).
 * @param formData - The submitted login form.
 * @returns The form state to display when the sign-in failed.
 */
export const login = async (
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> => {
  const validatedFields = parseFormData(loginSchema, formData);

  if (!validatedFields.success) {
    return { message: "Veuillez renseigner vos identifiants" };
  }

  const { login, password } = validatedFields.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: login }, { username: login }],
    },
    omit: { password: false },
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

  redirect("/articles");
};

/**
 * Returns the currently signed-in user, or `null` if there is no valid
 * session (no cookie, or a JWT that failed verification/expired — see
 * `getSession`). The `password` field is never present, since the global
 * Prisma client omits it from every `User` query.
 *
 * @returns The current `User` (without `password`), or `null`.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const userId = await getSession();

  if (!userId) {
    return null;
  }

  return await prisma.user.findUnique({ where: { id: userId } });
};

/**
 * Signs the current user out by deleting the `userSession` cookie, then
 * redirects to the home page (`/`).
 */
export const logout = async (): Promise<void> => {
  await deleteSessionCookie();

  redirect("/");
};
