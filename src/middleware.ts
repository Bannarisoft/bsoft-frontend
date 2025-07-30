import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bsoft");
  const protectedPaths = [
    "/master",
    "/settings",
    "/fam",
    "/change-password",
    "/maintanence",
  ];
  const publicPaths = ["/login", "/forgot-password"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (token && publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/bsoft/maintanence/dashboard", request.url));
  }

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/bsoft/login", request.url));
  }

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/bsoft/login", request.url));
  }

  return NextResponse.next();
}
