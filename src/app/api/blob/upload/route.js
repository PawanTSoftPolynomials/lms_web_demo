import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/** Union of every `accept` used by the composer's image/video/audio/document block editors. */
const ALLOWED_CONTENT_TYPES = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_ROLES = ["INSTRUCTOR", "ADMIN"];

/** Confirms the caller holds a valid session for an instructor/admin, using the same accessToken cookie + backend the rest of the app already trusts. */
async function requireInstructor(request) {
  const cookieStore = await cookies();
  let token = cookieStore.get("accessToken")?.value;

  if (!token && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  const { data } = await response.json();

  if (!ALLOWED_ROLES.includes(data?.role)) {
    throw new Error("Not authorized to upload course content");
  }
}

export async function POST(request) {
  const body = await request.json();

  const tokenSecret = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      ...(tokenSecret ? { token: tokenSecret } : {}),
      onBeforeGenerateToken: async (pathname) => {
        await requireInstructor(request);

        if (!pathname.startsWith("course-composer/") && !pathname.startsWith("content-uploads/")) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
