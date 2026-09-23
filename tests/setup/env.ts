import { config } from "dotenv";
import path from "node:path";

/**
 * Loads `.env.test` before anything else in the "unit" test project.
 *
 * This must run — and finish running — before any test file imports a
 * module that creates a Prisma Client (e.g. `@/lib/prisma`, `tests/setup/db`),
 * since Prisma reads `DATABASE_URL` from `process.env` at that point. Vitest
 * guarantees this ordering by running `setupFiles` entries as separate
 * modules, fully evaluated in order, before the test file itself is
 * imported — see `vitest.config.ts` (`env.ts` is listed first).
 */
config({ path: path.resolve(process.cwd(), ".env.test") });

// `lib/auth/session.ts` reads `JWT_SECRET` when the module is loaded, so it
// must exist before any test imports it. `.env.test` normally provides it;
// this fallback keeps the suite runnable if the file lacks the variable.
process.env.JWT_SECRET ??= "test-secret-key";

/**
 * Safety guard: refuses to run if `DATABASE_URL` does not look like the
 * dedicated test database. `tests/setup/db.ts` exposes `resetDb()`, which
 * truncates tables — this must never run against the development database.
 */
if (!process.env.DATABASE_URL?.includes("mdd_db_test")) {
  throw new Error(
    "Refus de lancer les tests : DATABASE_URL ne pointe pas vers la base de " +
      "test (attendu : un nom de base contenant 'mdd_db_test'). " +
      "Vérifie le fichier .env.test à la racine du projet.",
  );
}
