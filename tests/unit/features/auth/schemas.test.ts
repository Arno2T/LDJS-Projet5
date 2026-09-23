import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";
import { failedFields } from "@/tests/setup/zod";

describe("registerSchema", () => {
  // Reference input: every test changes ONE field only, so a failure can
  // only come from the rule under test.
  const validInput = {
    username: "bobby",
    email: "bobby@mdd-test.local",
    password: "Abcdef12",
  };

  it("accepts a valid input", () => {
    expect(registerSchema.safeParse(validInput).success).toBe(true);
  });

  describe("username (3 to 20 characters)", () => {
    it.each([
      { length: 2, username: "ab", accepted: false },
      { length: 3, username: "abc", accepted: true },
      { length: 20, username: "a".repeat(20), accepted: true },
      { length: 21, username: "a".repeat(21), accepted: false },
    ])(
      "$length characters -> accepted: $accepted",
      ({ username, accepted }) => {
        const result = registerSchema.safeParse({ ...validInput, username });

        expect(result.success).toBe(accepted);
        if (!accepted) expect(failedFields(result)).toEqual(["username"]);
      },
    );
  });

  describe("email", () => {
    it.each(["not-an-email", "missing-at.com", "a@", "@domain.com", ""])(
      "rejects the malformed email %j",
      (email) => {
        const result = registerSchema.safeParse({ ...validInput, email });

        expect(failedFields(result)).toEqual(["email"]);
      },
    );
  });

  describe("password (8+ characters, 1 uppercase, 1 digit)", () => {
    it("accepts exactly 8 characters", () => {
      // "Abcdef12" is 8 characters: the minimum length boundary.
      const result = registerSchema.safeParse({
        ...validInput,
        password: "Abcdef12",
      });

      expect(result.success).toBe(true);
    });

    it("rejects 7 characters even with an uppercase and a digit", () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: "Abcde12",
      });

      expect(failedFields(result)).toEqual(["password"]);
    });

    it("rejects a long password without uppercase", () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: "abcdefgh12",
      });

      expect(failedFields(result)).toEqual(["password"]);
    });

    it("rejects a long password without digit", () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: "Abcdefghij",
      });

      expect(failedFields(result)).toEqual(["password"]);
    });
  });

  it("rejects missing fields", () => {
    const result = registerSchema.safeParse({});

    expect(failedFields(result).sort()).toEqual([
      "email",
      "password",
      "username",
    ]);
  });
});

describe("loginSchema", () => {
  const validInput = { login: "bobby@mdd-test.local", password: "x" };

  it("accepts an email or a username as login", () => {
    expect(loginSchema.safeParse(validInput).success).toBe(true);
    expect(
      loginSchema.safeParse({ ...validInput, login: "bobby" }).success,
    ).toBe(true);
  });

  it("rejects an empty login", () => {
    const result = loginSchema.safeParse({ ...validInput, login: "" });

    expect(failedFields(result)).toEqual(["login"]);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ ...validInput, password: "" });

    expect(failedFields(result)).toEqual(["password"]);
  });
});
