import { NextResponse, NextRequest } from "next/server";
import { getSession } from "./lib/auth/session";

// Routes accessible without being authenticated
const publicRoutes = ["/", "/login", "/register"];

/**
 * Route guard, run for every request matched by `config.matcher` below.
 *
 * Logic: an unauthenticated request to a protected route is redirected to
 * `/login`; conversely, an authenticated request to a public route (home,
 * login, register) is redirected to `/articles`, so a signed-in user never
 * sees the login/register forms again. Every other case is let through
 * unchanged. This is a first line of defense — `requireAuth()` is still
 * called again inside each protected Server Action/Server Component as a
 * second, redundant check.
 *
 * @param request - The incoming request.
 * @returns A redirect response, or `NextResponse.next()` to continue.
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const userId = await getSession();

  // Redirect to /login if the route is protected
  // and the user has no valid session
  if (!isPublicRoute && !userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isPublicRoute && userId) {
    return NextResponse.redirect(new URL("/articles", request.url));
  }

  return NextResponse.next();
}

// Skip proxy for static assets, image optimization and API routes
// (avoids intercepting the JS chunks a public page like /login needs to hydrate)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
