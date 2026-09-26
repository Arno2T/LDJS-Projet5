import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestTheme, resetDb } from "@/tests/setup/db";

// `getThemes` is guarded by `requireAuth()` (lib/auth/session.ts). This
// feature isn't what's under test here, so it's mocked to resolve to a
// fixed user id .
// why: the session mechanism itself (cookies, JWT) is tested once, in
// depth.
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn().mockResolvedValue("test-user-id"),
}));

import { requireAuth } from "@/lib/auth/session";
import { getThemes } from "@/features/themes/actions";

describe("getThemes", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterEach(async () => {
    await resetDb();
  });

  it("returns themes sorted alphabetically by name, regardless of insertion order", async () => {
    await createTestTheme({ name: "TypeScript" });
    await createTestTheme({ name: "JavaScript" });
    await createTestTheme({ name: "Python" });

    const themes = await getThemes();

    expect(themes.map((theme) => theme.name)).toEqual([
      "JavaScript",
      "Python",
      "TypeScript",
    ]);
  });

  it("returns an empty array when there are no themes", async () => {
    const themes = await getThemes();

    expect(themes).toEqual([]);
  });

  it("requires authentication", async () => {
    await getThemes();

    // `vi.mocked()` gives back the mock's own type (`.toHaveBeenCalled*`
    // assertions), instead of `requireAuth`'s plain `() => Promise<string>`
    // signature — needed here purely for TypeScript, the runtime check
    // works either way.
    expect(vi.mocked(requireAuth)).toHaveBeenCalledOnce();
  });
});
