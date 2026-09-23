import { describe, expect, it } from "vitest";
import { hashPassword, isPasswordVerified } from "@/lib/auth/password";

describe("password hashing", () => {
  const password = "Abc123@";

  it("should verifed password", async () => {
    const passwordHashed = await hashPassword(password);

    expect(await isPasswordVerified(passwordHashed, password)).toBe(true);
  });

  it("should refused password", async () => {
    const passwordHashed = await hashPassword("Def456:");

    expect(await isPasswordVerified(passwordHashed, password)).toBe(false);
  });
});
