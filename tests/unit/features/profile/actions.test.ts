import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { revalidatePath } from "next/cache";
import { createTestUser, resetDb, testPrisma } from "@/tests/setup/db";
import { hashPassword, isPasswordVerified } from "@/lib/auth/password";

// `requireAuth` mocked (see .claude/tests/00-conventions.md), resolving to a
// real user created in `beforeEach`. These actions never redirect.
vi.mock("@/lib/auth/session", () => ({
  requireAuth: vi.fn(),
}));

import { requireAuth } from "@/lib/auth/session";
import {
  getUserInformation,
  updateUserInformation,
} from "@/features/profile/actions";

const OLD_PASSWORD = "OldPassw0rd";
const NEW_PASSWORD = "NewPassw0rd";
const SUCCESS_MESSAGE = "Profil mis à jour avec succès";
const CONFLICT_MESSAGE = "Cet e-mail ou ce nom d'utilisateur est déjà utilisé";

const toFormData = (fields: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

describe("profile actions", () => {
  // argon2 is intentionally slow: hash once, share across tests.
  let oldPasswordHash: string;
  let currentUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    oldPasswordHash = await hashPassword(OLD_PASSWORD);
  });

  beforeEach(async () => {
    await resetDb();
    currentUser = await createTestUser({
      username: "current",
      email: "current@mdd-test.local",
      password: oldPasswordHash,
    });
    vi.mocked(requireAuth).mockResolvedValue(currentUser.id);
  });

  afterEach(async () => {
    await resetDb();
  });

  describe("getUserInformation", () => {
    it("returns ONLY { email, username } of the current user (no password, not even hashed)", async () => {
      expect(await getUserInformation()).toEqual({
        email: "current@mdd-test.local",
        username: "current",
      });
    });

    it("returns null when the user no longer exists", async () => {
      vi.mocked(requireAuth).mockResolvedValue("deleted-user-id");

      expect(await getUserInformation()).toBeNull();
    });
  });

  describe("updateUserInformation", () => {
    const validFields = {
      username: "renamed",
      email: "renamed@mdd-test.local",
      password: NEW_PASSWORD,
    };

    it("updates the 3 fields, re-hashes the password, returns the success message and revalidates /profile", async () => {
      const result = await updateUserInformation(
        undefined,
        toFormData(validFields),
      );

      expect(result).toEqual({ message: SUCCESS_MESSAGE });
      const user = await testPrisma.user.findUniqueOrThrow({
        where: { id: currentUser.id },
      });
      expect(user.username).toBe("renamed");
      expect(user.email).toBe("renamed@mdd-test.local");
      // Never stored in clear, and really replaced (new password works, old does not).
      expect(user.password).not.toBe(NEW_PASSWORD);
      expect(await isPasswordVerified(user.password, NEW_PASSWORD)).toBe(true);
      expect(await isPasswordVerified(user.password, OLD_PASSWORD)).toBe(false);
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/profile");
    });

    it("only modifies the session user, and ignores an id / userId injected in the form", async () => {
      const victim = await createTestUser({
        username: "victim",
        email: "victim@mdd-test.local",
        password: oldPasswordHash,
      });

      await updateUserInformation(
        undefined,
        toFormData({ ...validFields, id: victim.id, userId: victim.id }),
      );

      const untouched = await testPrisma.user.findUniqueOrThrow({
        where: { id: victim.id },
      });
      expect(untouched.username).toBe("victim");
      expect(untouched.email).toBe("victim@mdd-test.local");
      expect(untouched.password).toBe(oldPasswordHash);
      const updated = await testPrisma.user.findUniqueOrThrow({
        where: { id: currentUser.id },
      });
      expect(updated.username).toBe("renamed");
    });

    it("does not treat the user's own unchanged email/username as a conflict", async () => {
      const result = await updateUserInformation(
        undefined,
        toFormData({
          username: "current",
          email: "current@mdd-test.local",
          password: NEW_PASSWORD,
        }),
      );

      expect(result).toEqual({ message: SUCCESS_MESSAGE });
    });

    it.each([
      { case: "empty", password: "" },
      { case: "too weak (no uppercase / digit)", password: "weakpassword" },
    ])(
      "KNOWN LIMITATION: a $case password is a validation error (password is mandatory at every save), and nothing is modified",
      async ({ password }) => {
        const result = await updateUserInformation(
          undefined,
          toFormData({ ...validFields, password }),
        );

        expect(result?.errors?.password).toBeDefined();
        const user = await testPrisma.user.findUniqueOrThrow({
          where: { id: currentUser.id },
        });
        // Even the valid username/email of the same submission are not saved.
        expect(user.username).toBe("current");
        expect(user.password).toBe(oldPasswordHash);
        expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
      },
    );

    it.each([
      { case: "email", override: { username: "free-name" } },
      { case: "username", override: { email: "free@mdd-test.local" } },
    ])(
      "returns a dedicated message (no exception) when the $case belongs to another user",
      async ({ override }) => {
        await createTestUser({
          username: "taken-name",
          email: "taken@mdd-test.local",
        });
        const fields = {
          username: "taken-name",
          email: "taken@mdd-test.local",
          password: NEW_PASSWORD,
          ...override,
        };

        const result = await updateUserInformation(
          undefined,
          toFormData(fields),
        );

        expect(result).toEqual({ message: CONFLICT_MESSAGE });
        const user = await testPrisma.user.findUniqueOrThrow({
          where: { id: currentUser.id },
        });
        expect(user.username).toBe("current");
        expect(vi.mocked(revalidatePath)).not.toHaveBeenCalled();
      },
    );
  });
});
