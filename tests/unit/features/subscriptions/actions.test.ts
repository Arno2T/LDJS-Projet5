import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import {
  createTestSubscription,
  createTestTheme,
  createTestUser,
  resetDb,
  testPrisma,
} from "@/tests/setup/db";

// `requireAuth` mocked (see .claude/tests/00-conventions.md), resolving to a
// real user created in `beforeEach` because subscriptions have a foreign key
// on their user. These actions never redirect (no `next/navigation` check).
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn(),
}));

import { requireAuth } from "@/lib/auth/session";
import {
  getSubscriptionsByUser,
  getSubscriptionsWithTheme,
  subscribe,
  unsubscribe,
} from "@/features/subscriptions/actions";

describe("subscriptions actions", () => {
  let currentUser: Awaited<ReturnType<typeof createTestUser>>;
  let otherUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await resetDb();
    currentUser = await createTestUser({ username: "current" });
    otherUser = await createTestUser({ username: "other" });
    vi.mocked(requireAuth).mockResolvedValue(currentUser.id);
    // `subscribe`/`unsubscribe` deliberately log the errors they swallow.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    await resetDb();
  });

  describe("getSubscriptionsByUser / getSubscriptionsWithTheme", () => {
    it("return only the current user's subscriptions, never another user's", async () => {
      const mine = await createTestTheme({ name: "Mine" });
      const theirs = await createTestTheme({ name: "Theirs" });
      const shared = await createTestTheme({ name: "Shared" });
      await createTestSubscription(currentUser.id, mine.id);
      await createTestSubscription(currentUser.id, shared.id);
      await createTestSubscription(otherUser.id, theirs.id);
      await createTestSubscription(otherUser.id, shared.id);

      const plain = await getSubscriptionsByUser();
      const withTheme = await getSubscriptionsWithTheme();

      expect(plain.map((sub) => sub.themeId).sort()).toEqual(
        [mine.id, shared.id].sort(),
      );
      expect(plain.every((sub) => sub.userId === currentUser.id)).toBe(true);
      expect(withTheme.map((sub) => sub.theme.name).sort()).toEqual([
        "Mine",
        "Shared",
      ]);
    });

    it("getSubscriptionsWithTheme includes the theme data, not only its id", async () => {
      const theme = await createTestTheme({
        name: "Rust",
        description: "Systems programming",
      });
      await createTestSubscription(currentUser.id, theme.id);

      const [subscription] = await getSubscriptionsWithTheme();

      expect(subscription.theme).toMatchObject({
        id: theme.id,
        name: "Rust",
        description: "Systems programming",
      });
    });

    it("return an empty array when the user has no subscription", async () => {
      expect(await getSubscriptionsByUser()).toEqual([]);
      expect(await getSubscriptionsWithTheme()).toEqual([]);
    });
  });

  describe("subscribe", () => {
    it("creates the subscription for the session user and revalidates /themes and /profile", async () => {
      const theme = await createTestTheme();

      await subscribe(theme.id, new FormData());

      const subscription = await testPrisma.subscription.findFirstOrThrow();
      expect(subscription.userId).toBe(currentUser.id);
      expect(subscription.themeId).toBe(theme.id);
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/themes");
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/profile");
    });

    it("ignores a userId injected in the form: the user is always the session user", async () => {
      const theme = await createTestTheme();
      const formData = new FormData();
      formData.set("userId", otherUser.id);

      await subscribe(theme.id, formData);

      const subscription = await testPrisma.subscription.findFirstOrThrow();
      expect(subscription.userId).toBe(currentUser.id);
    });

    it("does not throw nor create a duplicate when already subscribed (P2002 swallowed)", async () => {
      const theme = await createTestTheme();
      await createTestSubscription(currentUser.id, theme.id);

      await expect(
        subscribe(theme.id, new FormData()),
      ).resolves.toBeUndefined();

      expect(await testPrisma.subscription.count()).toBe(1);
      expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
    });

    it("still rethrows unexpected errors (only P2002 is swallowed): unknown theme", async () => {
      await expect(
        subscribe("unknown-theme-id", new FormData()),
      ).rejects.toThrow();
    });
  });

  describe("unsubscribe", () => {
    it("deletes the subscription and revalidates /themes and /profile", async () => {
      const theme = await createTestTheme();
      await createTestSubscription(currentUser.id, theme.id);

      await unsubscribe(theme.id, new FormData());

      expect(await testPrisma.subscription.count()).toBe(0);
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/themes");
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/profile");
    });

    it("never touches another user's subscription to the same theme", async () => {
      const theme = await createTestTheme();
      await createTestSubscription(currentUser.id, theme.id);
      await createTestSubscription(otherUser.id, theme.id);

      await unsubscribe(theme.id, new FormData());

      const remaining = await testPrisma.subscription.findMany();
      expect(remaining.map((sub) => sub.userId)).toEqual([otherUser.id]);
    });

    it("does not throw when the user is not subscribed (P2025 swallowed)", async () => {
      const theme = await createTestTheme();
      await createTestSubscription(otherUser.id, theme.id);

      await expect(
        unsubscribe(theme.id, new FormData()),
      ).resolves.toBeUndefined();

      // The other user's subscription is untouched.
      expect(await testPrisma.subscription.count()).toBe(1);
      expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
    });
  });
});
