import { hash, verify } from "argon2";

/**
 * Hashes a plain-text password using argon2, so it can be safely stored in the database.
 *
 * @param password - The plain-text password to hash.
 * @returns The resulting argon2 hash string.
 */
export const hashPassword = async (password: string): Promise<string> =>
  await hash(password);

/**
 * Verifies a plain-text password against a previously stored argon2 hash.
 *
 * @param hashedPassword - The argon2 hash retrieved from the database.
 * @param password - The plain-text password to check.
 * @returns True if the password matches the hash, false otherwise.
 */
export const isPasswordVerified = async (
  hashedPassword: string,
  password: string,
): Promise<boolean> => await verify(hashedPassword, password);
