import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  // Quick check only: does a session cookie exist? Real validation happens on the server.
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sales/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
