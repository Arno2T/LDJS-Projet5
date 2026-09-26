import { config as loadEnv } from "dotenv";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Local usage only for now (no CI configured) — see
// .claude/tests/07-e2e-critical-path.md.
//
// SAFETY: the e2e suite writes (register, articles, comments...) and wipes
// tables (`resetDb()` in global-setup.ts). It must NEVER run against the
// development database. Everything below points at the dedicated test
// database from `.env.test`, and refuses to start otherwise.
loadEnv({ path: path.resolve(process.cwd(), ".env.test") });

const testDatabaseUrl = process.env.DATABASE_URL ?? "";
if (!testDatabaseUrl.includes("mdd_db_test")) {
  throw new Error(
    "Refus de lancer les tests e2e : DATABASE_URL ne pointe pas vers la base " +
      "de test (attendu : un nom de base contenant 'mdd_db_test'). " +
      "Vérifie le fichier .env.test à la racine du projet.",
  );
}

// Dedicated port, never the 3000 used by `npm run dev`: combined with
// `reuseExistingServer: false`, Playwright can never drive (and write into)
// a development server that happens to be running.
const E2E_PORT = 3100;
const E2E_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // The tests share a single real database: one at a time, in order.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: E2E_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- -p ${E2E_PORT}`,
    url: E2E_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    // Explicit env: `process.env` values take precedence over `.env` in
    // Next.js, so the dev database of `.env` is never used by this server.
    env: {
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: process.env.JWT_SECRET ?? "test-secret-key",
    },
  },
});
