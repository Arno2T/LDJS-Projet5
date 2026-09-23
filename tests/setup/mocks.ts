import { vi } from "vitest";

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
