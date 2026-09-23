import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client dedicated to the test suite. Separate from `@/lib/prisma`'s
 * singleton on purpose: it must always target the test database
 * (`DATABASE_URL` loaded from `.env.test` by `tests/setup/env.ts`, which
 * runs before this module is ever imported), never the dev/prod one.
 */
export const testPrisma = new PrismaClient();

/**
 * Empties every table used by the app, in an order that respects foreign
 * key constraints (children before parents).
 *
 * Only ever call this against the test database — `tests/setup/env.ts`
 * refuses to run the suite if `DATABASE_URL` does not look like the test
 * database, as a safety net.
 */
export async function resetDb(): Promise<void> {
  await testPrisma.comment.deleteMany();
  await testPrisma.article.deleteMany();
  await testPrisma.subscription.deleteMany();
  await testPrisma.theme.deleteMany();
  await testPrisma.user.deleteMany();
}

/**
 * Creates a `Theme` fixture for tests. `name` must be unique (schema
 * constraint) — a random suffix is used by default so tests never collide
 * with each other.
 */
export async function createTestTheme(overrides?: {
  name?: string;
  description?: string;
}) {
  const suffix = Math.random().toString(36).slice(2, 8);

  return testPrisma.theme.create({
    data: {
      name: overrides?.name ?? `Theme-${suffix}`,
      description: overrides?.description ?? "Test theme",
    },
  });
}

/**
 * Creates a `User` fixture for tests. `email`/`username` must be unique
 * (schema constraints) — random suffixes by default. `password` is stored
 * as-is (not hashed) unless a caller passes an already-hashed value: most
 * tests never verify this password, so hashing it for nothing would only
 * slow the suite down (argon2 is intentionally slow).
 */
export async function createTestUser(overrides?: {
  email?: string;
  username?: string;
  password?: string;
}) {
  const suffix = Math.random().toString(36).slice(2, 8);

  return testPrisma.user.create({
    data: {
      email: overrides?.email ?? `user-${suffix}@mdd-test.local`,
      username: overrides?.username ?? `user-${suffix}`,
      password: overrides?.password ?? "unused-hash",
    },
  });
}

/**
 * Creates an `Article` fixture. `authorId` and `themeId` must reference
 * existing rows (foreign keys). `createdAt` can be forced to test sorting.
 */
export async function createTestArticle(overrides: {
  authorId: string;
  themeId: string;
  title?: string;
  content?: string;
  createdAt?: Date;
}) {
  const suffix = Math.random().toString(36).slice(2, 8);

  return testPrisma.article.create({
    data: {
      title: overrides.title ?? `Article ${suffix}`,
      content: overrides.content ?? "Test content",
      authorId: overrides.authorId,
      themeId: overrides.themeId,
      ...(overrides.createdAt && { createdAt: overrides.createdAt }),
    },
  });
}

/** Subscribes `userId` to `themeId` (real `Subscription` row). */
export async function createTestSubscription(userId: string, themeId: string) {
  return testPrisma.subscription.create({ data: { userId, themeId } });
}
