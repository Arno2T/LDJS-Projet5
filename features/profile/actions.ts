"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/schemas";
import { RegisterFormState } from "@/features/auth/actions";
import { hashPassword } from "@/lib/auth/password";
import { parseFormData } from "@/lib/forms";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

/**
 * Returns the current user's `email` and `username`, used to prefill the
 * profile form. Redirects (via `requireAuth`) if there is no valid session.
 *
 * @returns `{ email, username }` for the current user, or `null` if the
 * session is valid but the user row no longer exists.
 */
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

/**
 * Updates the current user's `email`, `username` and `password` from the
 * profile form.
 *
 * The new password is re-hashed with Argon2 (`hashPassword`) before being
 * stored, exactly like at registration. If the new email or username
 * collides with another account, the unique constraint violation (Prisma
 * `P2002`) is caught and turned into a user-facing message.
 *
 * @remarks
 * This reuses `registerSchema` (the registration schema) as-is, which makes
 * `password` a required field on every submission — so a valid password
 * must always be retyped, even to change only `username` or `email`. This
 * is an intentional security choice, not an oversight: it prevents someone
 * with momentary physical access to an already-unlocked device/session from
 * altering the account's identity information without knowing the password.
 *
 * @param _prevState - Previous form state (unused, required by `useActionState`).
 * @param formData - The submitted profile form (same shape as registration).
 * @returns The form state to display (validation errors, or a success/error message).
 */
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
