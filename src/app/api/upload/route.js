import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDisplayUrl } from "@/lib/blob";

const ALLOWED_ROLES = ["INSTRUCTOR", "ADMIN"];

async function verifyAuth(request) {
  const cookieStore = await cookies();
  let token = cookieStore.get("accessToken")?.value;

  if (!token && request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    throw new Error("Unauthorized: Missing authentication token");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unauthorized: Invalid token session");
  }

  const { data } = await response.json();
  if (!ALLOWED_ROLES.includes(data?.role)) {
    throw new Error("Unauthorized: Role not permitted to upload files");
  }
}

export async function POST(request) {
  try {
    // 1. Verify Auth & Role
    await verifyAuth(request);

    // 2. Extract File
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file provided for upload" },
        { status: 400 }
      );
    }

    // 3. Verify Server Secret Token for Vercel Blob
    const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      console.error("BLOB_READ_WRITE_TOKEN is missing in server environment");
      return NextResponse.json(
        { error: "Vercel Blob store token (BLOB_READ_WRITE_TOKEN) is not configured on the server." },
        { status: 500 }
      );
    }

    // 4. Put file into Vercel Blob Store (supports both public and private stores)
    const pathname = `content-uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    let blob;
    try {
      blob = await put(pathname, file, {
        access: "public",
        token: blobToken,
        addRandomSuffix: true,
      });
    } catch (publicErr) {
      const msg = publicErr instanceof Error ? publicErr.message : String(publicErr);
      if (msg.includes("private store") || msg.includes("private access")) {
        console.log("Vercel Blob store is configured with private access. Using access: 'private'");
        blob = await put(pathname, file, {
          access: "private",
          token: blobToken,
          addRandomSuffix: true,
        });
      } else {
        throw publicErr;
      }
    }

    return NextResponse.json({
      url: blob.url,
      fileUrl: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      originalName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file to Vercel Blob",
      },
      { status: 400 }
    );
  }
}
