import { beforeEach, vi } from "vitest";
import { cookieJar, cookieStoreMock } from "./cookies";

/**
 * `redirect` (Server Actions call it on success, e.g. `registerUser`,
 * `createArticle`) only works inside a real Next.js request — calling the
 * real implementation here would throw. Mocked as a no-op so Server Actions
 * can be called directly in tests; assert on it with
 * `expect(redirect).toHaveBeenCalledWith(...)`.
 *
 * See .claude/tests/00-conventions.md for the reasoning.
 */
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

/**
 * Same reasoning as `redirect` above, for `revalidatePath`
 * (`createArticle`, `createComment`, `subscribe`, `unsubscribe`).
 */
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

/**
 * `cookies()` (used by `lib/auth/session.ts`) only works inside a real Next.js
 * request. Replaced by a stateful in-memory cookie jar (see
 * `tests/setup/cookies.ts`). Only the Auth story exercises it for real: the
 * other features mock `@/lib/auth/session` itself.
 */
vi.mock("next/headers", () => ({
  cookies: async () => cookieStoreMock,
}));

/**
 * `server-only` throws when imported outside a React Server environment
 * (its whole purpose is to break client bundles) and isn't installed as a
 * standalone package here — Next.js ships its own copy. Stubbed so that
 * server modules (`lib/auth/session.ts`) can be imported in tests.
 */
vi.mock("server-only", () => ({}));

// Isolation between tests: fresh cookie jar, no leftover mock call history
// (e.g. `redirect` calls). `clearAllMocks` keeps implementations intact.
beforeEach(() => {
  cookieJar.clear();
  vi.clearAllMocks();
});
