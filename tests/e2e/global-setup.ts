import { createTestTheme, resetDb, testPrisma } from "../setup/db";

/**
 * Runs once before the e2e suite: empties the TEST database (the guard in
 * `playwright.config.ts` has already refused to start if `DATABASE_URL` is
 * not the test database) and creates the theme the critical path subscribes
 * to.
 */
export default async function globalSetup(): Promise<void> {
  if (!process.env.DATABASE_URL?.includes("mdd_db_test")) {
    throw new Error("global-setup: DATABASE_URL is not the test database.");
  }

  await resetDb();
  await createTestTheme({
    name: "TypeScript",
    description: "Typed superset of JavaScript",
  });
  await testPrisma.$disconnect();
}
