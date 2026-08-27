import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Un-nest double-encoded proxy URLs if present
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

    // SSRF & Domain Validation: Target must be a Vercel Blob store URL
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

    // Server-side secret token ONLY (Never use or expose NEXT_PUBLIC_* tokens)
    const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

    // Optional Range header for react-pdf / PDF.js streaming support
    const rangeHeader = request.headers.get("range");

    // Safe Server-side Diagnostic Logging (NEVER log secret token values, cookies, or authorization headers)
    console.log("[BLOB PROXY DIAGNOSTIC]", {
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
      hasServerToken: Boolean(blobToken),
      hasRangeHeader: Boolean(rangeHeader),
    });

    if (!blobToken) {
      console.error("[BLOB PROXY ERROR] Neither VERCEL_BLOB_READ_WRITE_TOKEN nor BLOB_READ_WRITE_TOKEN is configured in server environment.");
      return NextResponse.json(
        { error: "Server error: Vercel Blob token is missing in server environment variables." },
        { status: 500 }
      );
    }

    // 1. Primary Retrieval: Use @vercel/blob SDK get() method for private access
    try {
      const blobResult = await get(targetUrl, {
        access: "private",
        token: blobToken,
      });

      if (blobResult && blobResult.stream) {
        const contentType = blobResult.blob?.contentType || "application/pdf";
        const arrayBuffer = await new Response(blobResult.stream).arrayBuffer();

        const resHeaders = {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
        };

        if (blobResult.blob?.size) {
          resHeaders["Content-Length"] = String(blobResult.blob.size);
        }

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: resHeaders,
        });
      }
    } catch (sdkErr) {
      console.warn("[BLOB PROXY] @vercel/blob SDK get() note:", sdkErr?.message || sdkErr);
    }

    // 2. Secondary Retrieval: Direct authenticated fetch with Range header support
    const fetchHeaders = {
      Authorization: `Bearer ${blobToken}`,
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
      cache: "no-store",
    });

    console.log("[BLOB PROXY UPSTREAM RESPONSE]", {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "application/pdf";
      const contentLength = response.headers.get("content-length");
      const contentRange = response.headers.get("content-range");
      const arrayBuffer = await response.arrayBuffer();

      const resHeaders = {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      };

      if (contentLength) resHeaders["Content-Length"] = contentLength;
      if (contentRange) resHeaders["Content-Range"] = contentRange;

      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: resHeaders,
      });
    }

    // Return exact upstream status if fetch fails
    return new NextResponse(`Storage provider returned HTTP ${response.status}: ${response.statusText}`, {
      status: response.status,
    });
  } catch (error) {
    console.error("[BLOB PROXY UNHANDLED ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Proxy error" },
      { status: 500 }
    );
  }
}
