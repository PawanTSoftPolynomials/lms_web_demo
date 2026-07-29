import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;
  const path = request.nextUrl.pathname;

  const roleGuards = [
    { prefix: "/admin", role: "ADMIN" },
    { prefix: "/instructor", role: "INSTRUCTOR" },
    { prefix: "/student", role: "STUDENT" },
  ];

  const guard = roleGuards.find((g) => path.startsWith(g.prefix));

  if (guard && (!token || role !== guard.role)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
