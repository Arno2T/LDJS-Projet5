import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { redirect } from "next/navigation";
import { vi } from "vitest";
import { cookieJar } from "@/tests/setup/cookies";
import { createTestUser, resetDb, testPrisma } from "@/tests/setup/db";
import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordVerified } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import {
  getCurrentUser,
  login,
  logout,
  registerUser,
} from "@/features/auth/actions";

// Here `@/lib/auth/session` is deliberately NOT mocked: the real JWT/cookie
// mechanism runs against the in-memory cookie jar (tests/setup/cookies.ts).

const PASSWORD = "Abcdef12";
const GENERIC_LOGIN_ERROR = "Email ou mot de passe non valide";

const toFormData = (fields: Record<string, string>): FormData => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

describe("auth actions", () => {
  // argon2 is intentionally slow: hash once, share across tests.
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await hashPassword(PASSWORD);
  });

  beforeEach(async () => {
    await resetDb();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(async () => {
    await resetDb();
  });

  describe("registerUser", () => {
    const validFields = {
      username: "bobby",
      email: "bobby@mdd-test.local",
      password: PASSWORD,
    };

    it("creates the user, stores a hashed password, sets the session cookie and redirects to /articles", async () => {
      const result = await registerUser(undefined, toFormData(validFields));

      // The mocked redirect does not interrupt the action, so it returns.
      expect(result).toBeUndefined();

      // `testPrisma` has no `omit`: we can read the stored password.
      const user = await testPrisma.user.findUniqueOrThrow({
        where: { email: validFields.email },
      });
      expect(user.username).toBe("bobby");
      expect(user.password).not.toBe(PASSWORD);
      expect(await isPasswordVerified(user.password, PASSWORD)).toBe(true);

      expect(await getSession()).toBe(user.id);
      expect(vi.mocked(redirect)).toHaveBeenCalledWith("/articles");
    });

    it.each([
      { case: "email", override: { username: "other-name" } },
      { case: "username", override: { email: "other@mdd-test.local" } },
    ])(
      "returns a dedicated message when the $case is already taken (no crash, no session)",
      async ({ override }) => {
        await createTestUser({
          email: validFields.email,
          username: validFields.username,
        });

        const result = await registerUser(
          undefined,
          toFormData({ ...validFields, ...override }),
        );

        expect(result).toEqual({
          message: "Cet e-mail ou ce nom d'utilisateur est déjà utilisé",
        });
        expect(await getSession()).toBeNull();
        expect(vi.mocked(redirect)).not.toHaveBeenCalled();
      },
    );

    it("returns field errors and creates nothing when the input is invalid", async () => {
      const result = await registerUser(
        undefined,
        toFormData({ ...validFields, password: "short" }),
      );

      expect(result?.errors?.password).toBeDefined();
      expect(await testPrisma.user.count()).toBe(0);
      expect(vi.mocked(redirect)).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await createTestUser({
        email: "bobby@mdd-test.local",
        username: "bobby",
        password: hashedPassword,
      });
    });

    it.each([
      { identifier: "an email", login: "bobby@mdd-test.local" },
      { identifier: "a username", login: "bobby" },
    ])(
      "succeeds with $identifier: sets the session cookie and redirects to /articles",
      async ({ login: identifier }) => {
        const result = await login(
          undefined,
          toFormData({ login: identifier, password: PASSWORD }),
        );

        expect(result).toBeUndefined();
        expect(await getSession()).not.toBeNull();
        expect(vi.mocked(redirect)).toHaveBeenCalledWith("/articles");
      },
    );

    it.each([
      { case: "a wrong password", login: "bobby", password: "Wrong1234" },
      { case: "an unknown login", login: "nobody", password: PASSWORD },
    ])(
      "returns the same generic message with $case, and creates no session",
      async ({ login: identifier, password }) => {
        const result = await login(
          undefined,
          toFormData({ login: identifier, password }),
        );

        expect(result).toEqual({ message: GENERIC_LOGIN_ERROR });
        expect(await getSession()).toBeNull();
        expect(vi.mocked(redirect)).not.toHaveBeenCalled();
      },
    );

    it("rejects an empty form before touching the database", async () => {
      const result = await login(
        undefined,
        toFormData({ login: "", password: "" }),
      );

      expect(result).toEqual({
        message: "Veuillez renseigner vos identifiants",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("returns null when there is no session", async () => {
      expect(await getCurrentUser()).toBeNull();
    });

    it("returns the current user WITHOUT the password field", async () => {
      const created = await createTestUser({ password: hashedPassword });
      await login(
        undefined,
        toFormData({ login: created.username, password: PASSWORD }),
      );

      const user = await getCurrentUser();

      expect(user?.id).toBe(created.id);
      // Global `omit` of lib/prisma.ts: the hash must never leave the DB layer.
      expect(user).not.toHaveProperty("password");
    });
  });

  describe("logout", () => {
    it("deletes the session cookie and redirects to /", async () => {
      const created = await createTestUser({ password: hashedPassword });
      await login(
        undefined,
        toFormData({ login: created.username, password: PASSWORD }),
      );
      expect(await getSession()).toBe(created.id);

      await logout();

      expect(await getSession()).toBeNull();
      expect(cookieJar.optionsOf("userSession")).toBeUndefined();
      expect(vi.mocked(redirect)).toHaveBeenCalledWith("/");
    });
  });

  describe("unexpected errors are not swallowed", () => {
    it("registerUser rethrows an error that is not a unique-constraint violation", async () => {
      vi.spyOn(prisma.user, "create").mockRejectedValueOnce(new Error("boom"));

      await expect(
        registerUser(
          undefined,
          toFormData({
            username: "bobby",
            email: "bobby@mdd-test.local",
            password: PASSWORD,
          }),
        ),
      ).rejects.toThrow("boom");
      expect(await getSession()).toBeNull();
    });
  });
});
