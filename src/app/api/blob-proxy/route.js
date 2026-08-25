import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { cookies } from "next/headers";

async function verifyAuth(request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("accessToken")?.value;

    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (token && process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        console.warn("[BLOB PROXY] Session auth profile returned non-200:", res.status);
      }
    }
  } catch (err) {
    console.warn("[BLOB PROXY] Session verification check note:", err.message);
  }
}

export async function GET(request) {
  try {
    // 1. Verify User Session (if session tokens exist)
    await verifyAuth(request);

    // 2. Extract & Unwrap URL Parameter
    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Recursively unwrap double-encoded or nested proxy URLs
    while (targetUrl && (targetUrl.includes("/api/blob-proxy") || targetUrl.includes("url="))) {
      try {
        const decoded = decodeURIComponent(targetUrl);
        const match = decoded.match(/url=([^&]+)/);
        if (match && match[1]) {
          targetUrl = match[1];
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    // 3. SSRF & Domain Validation (Security check: Must be a Vercel Blob store URL)
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid target URL format" }, { status: 400 });
    }

    const isVercelBlobDomain =
      parsedUrl.hostname.endsWith(".blob.vercel-storage.com") ||
      parsedUrl.hostname.endsWith("vercel.com");

    if (!isVercelBlobDomain) {
      return NextResponse.json(
        { error: "Forbidden: Target URL does not belong to Vercel Blob storage." },
        { status: 400 }
      );
    }

    // 4. Token Resolution (Server-side secret token only)
    const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      console.error("[BLOB PROXY] Server secret token (VERCEL_BLOB_READ_WRITE_TOKEN / BLOB_READ_WRITE_TOKEN) is not configured.");
      return NextResponse.json(
        { error: "Vercel Blob read/write token is missing on server environment." },
        { status: 500 }
      );
    }

    // 5. Retrieve File from Vercel Blob using @vercel/blob SDK get() with authenticated fetch fallback
    let blobResult = null;

    try {
      // Attempt 1: @vercel/blob SDK get() for private store
      blobResult = await get(targetUrl, {
        access: "private",
        token: blobToken,
      });
    } catch (privateErr) {
      try {
        // Attempt 2: @vercel/blob SDK get() for public store
        blobResult = await get(targetUrl, {
          access: "public",
          token: blobToken,
        });
      } catch (publicErr) {
        // Attempt 3: Direct authenticated fetch fallback
        const fetchRes = await fetch(targetUrl, {
          headers: {
            Authorization: `Bearer ${blobToken}`,
          },
        });

        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get("content-type") || "application/pdf";
          const arrayBuffer = await fetchRes.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
              "Accept-Ranges": "bytes",
            },
          });
        }

        console.error(`[BLOB PROXY] Blob fetch failed with status ${fetchRes.status} for hostname: ${parsedUrl.hostname}`);
        return new NextResponse("Failed to retrieve private Blob file from storage provider", { status: fetchRes.status });
      }
    }

    if (!blobResult || !blobResult.stream) {
      return new NextResponse("File not found in Vercel Blob store", { status: 404 });
    }

    const contentType = blobResult.blob?.contentType || "application/pdf";
    const arrayBuffer = await new Response(blobResult.stream).arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("[BLOB PROXY] Unhandled proxy error:", error);
    return NextResponse.json({ error: error.message || "Internal server proxy error" }, { status: 500 });
  }
}
