import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";

// `server-only` makes bundling this module from a Client Component fail at
// build time — the JWT secret must never reach the browser.

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Signs a new session JWT for a given user.
 *
 * Uses `jose` (Web Crypto API) rather than a Node-specific JWT library.
 * The token only carries the user's id (`{ userId }`) as payload, is signed
 * with HS256 using `JWT_SECRET`, and expires 10 hours after issuance
 * (`setExpirationTime("10h")`) — kept in sync with the cookie's `maxAge` set
 * in `setSessionCookie`. There is no refresh mechanism: once issued, a
 * token cannot be revoked before it expires.
 *
 * @param userId - Id of the user to create a session for.
 * @returns The signed JWT string, ready to be stored in a cookie.
 */
export const createSession = async (userId: string): Promise<string> => {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10h")
    .sign(secret);

  return jwt;
};

/**
 * Stores a signed session token in the `userSession` cookie.
 *
 * The cookie is `httpOnly` (not readable from client-side JavaScript),
 * `secure` (HTTPS only) and `sameSite: "lax"` (sent on top-level navigation,
 * not on cross-site subrequests — this is what makes Server Actions safe
 * against CSRF without a dedicated token, alongside Next.js's own
 * Origin/Host check). `maxAge` (10 hours) matches the JWT's own expiration.
 *
 * @param token - The JWT produced by `createSession`.
 */
export const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("userSession", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 10, // 10heures -
  });
};

/**
 * Reads and verifies the current session.
 *
 * Returns `null` whenever there is no usable session — no `userSession`
 * cookie at all, or a token that fails `jwtVerify` (wrong signature,
 * malformed, or expired). Both cases are only logged with `console.warn`
 * (no user-facing error), since having no session is an expected state
 * (e.g. a first-time visitor), not a failure condition on its own.
 *
 * @returns The `userId` carried by the token's payload, or `null`.
 */
export const getSession = async () => {
  const cookieStore = await cookies();

  const session = cookieStore.get("userSession");

  if (!session) {
    console.warn("Session :: no user session");
    return null;
  }

  try {
    const { payload } = await jwtVerify(session.value, secret);

    return payload.userId as string;
  } catch (error) {
    console.warn("Session :: no user session", error);
    return null;
  }
};

/**
 * Deletes the `userSession` cookie, effectively ending the current session
 * client-side. Used by `logout`. Since sessions are stateless JWTs, this
 * does not invalidate the token itself — a copy of it saved elsewhere would
 * still verify successfully until it naturally expires.
 */
export const deleteSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("userSession");
};

/**
 * Guards a Server Component or Server Action: returns the current
 * `userId`, or redirects to the home page (`/`) if there is no valid
 * session (`getSession` returned `null`). Used at the top of every
 * protected feature action (under `features/`) as a second, server-side
 * check in addition to `proxy.ts`.
 *
 * @returns The current user's id. Never returns without one — `redirect`
 * throws internally, so the function does not resolve past that point.
 */
export const requireAuth = async (): Promise<string> => {
  const userId = await getSession();

  if (!userId) {
    redirect("/");
  }

  return userId;
};
