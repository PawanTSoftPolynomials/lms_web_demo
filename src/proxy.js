import { NextResponse } from "next/server";

export function proxy(request) {
  const token =
    request.cookies.get(
      "accessToken"
    );

  const role =
    request.cookies.get(
      "role"
    )?.value;

  const path =
    request.nextUrl.pathname;

  if (
    path.startsWith("/admin")
  ) {
    if (!token || role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }
  }

  if (
    path.startsWith(
      "/instructor"
    )
  ) {
    if (
      !token ||
      role !== "INSTRUCTOR"
    ) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }
  }

  if (
    path.startsWith(
      "/student"
    )
  ) {
    if (
      !token ||
      role !== "STUDENT"
    ) {
      return NextResponse.redirect(
        new URL(
          "/login",
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
  ],
};