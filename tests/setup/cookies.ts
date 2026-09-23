/**
 * In-memory cookie jar standing in for the store returned by `cookies()`
 * from `next/headers`.
 *
 * The real `cookies()` only works inside a Next.js request. To test
 * `lib/auth/session.ts` for real (write a cookie, read it back, delete it),
 * the mock must be *stateful*: what `set()` writes must come out of `get()`,
 * and `delete()` must make it disappear. A fixed mock object
 * (`get: () => ({ value: "abc" })`) could not verify any of that.
 *
 * Mirrors the real API shape: `get(name)` returns `{ name, value }` or
 * `undefined` — never the raw string.
 */

type StoredCookie = { value: string; options?: Record<string, unknown> };

const jar = new Map<string, StoredCookie>();

export const cookieStoreMock = {
  get: (name: string) => {
    const cookie = jar.get(name);
    return cookie ? { name, value: cookie.value } : undefined;
  },
  set: (name: string, value: string, options?: Record<string, unknown>) => {
    jar.set(name, { value, options });
  },
  delete: (name: string) => {
    jar.delete(name);
  },
};

/** Test-side helpers (not part of the real `cookies()` API). */
export const cookieJar = {
  /** Empties the jar — called before every test by `tests/setup/mocks.ts`. */
  clear: () => jar.clear(),
  /** Options passed to `set()` (httpOnly, secure, maxAge...), for assertions. */
  optionsOf: (name: string) => jar.get(name)?.options,
  /** Writes a raw value, bypassing the app code (e.g. a corrupted token). */
  put: (name: string, value: string) => jar.set(name, { value }),
};
