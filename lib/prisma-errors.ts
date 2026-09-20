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
