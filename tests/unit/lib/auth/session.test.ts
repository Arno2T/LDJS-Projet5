import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { redirect } from "next/navigation";
import { cookieJar } from "@/tests/setup/cookies";
import {
  createSession,
  deleteSessionCookie,
  getSession,
  requireAuth,
  setSessionCookie,
} from "@/lib/auth/session";

const COOKIE_NAME = "userSession";

/** Signs a JWT the way `createSession` does, but with custom secret/expiry. */
const signToken = (secret: string, expiration: string | number) =>
  new SignJWT({ userId: "user-1" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(new TextEncoder().encode(secret));

describe("session (JWT + cookie)", () => {
  beforeEach(() => {
    // `getSession` logs a warning on purpose when there is no valid session.
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("createSession + setSessionCookie + getSession", () => {
    it("round-trips: the userId put in the token comes back from getSession", async () => {
      const token = await createSession("user-42");
      await setSessionCookie(token);

      expect(await getSession()).toBe("user-42");
    });

    it("sets the cookie with the expected security attributes", async () => {
      await setSessionCookie(await createSession("user-42"));

      expect(cookieJar.optionsOf(COOKIE_NAME)).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 10,
      });
    });
  });

  describe("getSession returns null (never throws) when the session is not valid", () => {
    it("has no cookie", async () => {
      expect(await getSession()).toBeNull();
    });

    it("has a corrupted token", async () => {
      cookieJar.put(COOKIE_NAME, "not-a-jwt");

      expect(await getSession()).toBeNull();
    });

    it("has a token signed with another secret (forged)", async () => {
      cookieJar.put(COOKIE_NAME, await signToken("another-secret", "10h"));

      expect(await getSession()).toBeNull();
    });

    it("has an expired token", async () => {
      // Correct secret, but expiration already in the past.
      const expired = await signToken(
        process.env.JWT_SECRET as string,
        Math.floor(Date.now() / 1000) - 60,
      );
      cookieJar.put(COOKIE_NAME, expired);

      expect(await getSession()).toBeNull();
    });
  });

  describe("deleteSessionCookie", () => {
    it("removes the cookie, so getSession no longer finds a session", async () => {
      await setSessionCookie(await createSession("user-42"));
      expect(await getSession()).toBe("user-42");

      await deleteSessionCookie();

      expect(await getSession()).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("redirects to / when there is no session", async () => {
      await requireAuth();

      expect(vi.mocked(redirect)).toHaveBeenCalledWith("/");
    });

    it("returns the userId and does not redirect when the session is valid", async () => {
      await setSessionCookie(await createSession("user-42"));

      expect(await requireAuth()).toBe("user-42");
      expect(vi.mocked(redirect)).not.toHaveBeenCalled();
    });
  });
});
