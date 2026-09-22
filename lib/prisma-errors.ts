import { Prisma } from "@prisma/client";

/**
 * Checks whether a caught error is a Prisma "unique constraint violation"
 * (error code `P2002`) — e.g. raised when creating or updating a `User`
 * with an `email` or `username` that already exists in the database.
 *
 * @param error - The error caught from a Prisma Client operation.
 * @returns `true` if `error` is a P2002 unique constraint violation.
 */
export function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function isRecordNotFoundError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * Checks whether a caught error is a Prisma "foreign key constraint failed"
 * (error code `P2003`) — e.g. raised when creating an `Article` with a
 * `themeId` that does not exist.
 *
 * @param error - The error caught from a Prisma Client operation.
 * @returns `true` if `error` is a P2003 foreign key violation.
 */
export function isForeignKeyError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}
