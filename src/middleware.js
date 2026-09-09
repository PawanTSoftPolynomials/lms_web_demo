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
    // Unauthenticated/wrong-role hits on a protected route go to the public
    // Landing Page, not straight to Login — Login is reached from there.
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
