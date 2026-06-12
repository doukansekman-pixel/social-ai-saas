import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("social_ai_token")?.value;
  const path = request.nextUrl.pathname;

  if (path === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dealers/:path*",
    "/instagram/:path*",
    "/ai-post/:path*",
    "/schedule/:path*",
    "/settings/:path*",
  ],
};
