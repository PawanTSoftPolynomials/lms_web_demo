import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Enforce Authorization Header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid Bearer token" },
        { status: 401 }
      );
    }

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
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      console.error("BLOB_READ_WRITE_TOKEN is missing in server environment");
      return NextResponse.json(
        { error: "Vercel Blob store token (BLOB_READ_WRITE_TOKEN) is not configured on the server." },
        { status: 500 }
      );
    }

    // 4. Stream File to Vercel Blob Store
    let blob;
    try {
      blob = await put(file.name, file, {
        access: "private",
        token: blobToken,
        addRandomSuffix: true,
      });
    } catch (privateErr) {
      console.warn("Private blob access not supported by token/store, falling back to default access:", privateErr?.message);
      blob = await put(file.name, file, {
        access: "public",
        token: blobToken,
        addRandomSuffix: true,
      });
    }

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : String(error) || "Failed to upload file to Vercel Blob",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
