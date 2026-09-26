import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// `proxy` only needs to know whether there is a userId or not — it doesn't
// care how the session was established (cookie, JWT...). That mechanism is
// tested once, in depth, in tests/unit/lib/auth/session.test.ts.
vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "@/lib/auth/session";
import { proxy } from "@/proxy";

const requestFor = (path: string): NextRequest =>
  new NextRequest(new URL(path, "http://localhost:3000"));

describe("proxy", () => {
  it("lets the request through when the route is public and there is no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await proxy(requestFor("/login"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects to /articles when the route is public and there is a session", async () => {
    vi.mocked(getSession).mockResolvedValue("user-1");

    const response = await proxy(requestFor("/login"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/articles",
    );
  });

  it("redirects to /login when the route is protected and there is no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const response = await proxy(requestFor("/articles"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
  });

  it("lets the request through when the route is protected and there is a session", async () => {
    vi.mocked(getSession).mockResolvedValue("user-1");

    const response = await proxy(requestFor("/articles"));

    expect(response.headers.get("location")).toBeNull();
  });
});
