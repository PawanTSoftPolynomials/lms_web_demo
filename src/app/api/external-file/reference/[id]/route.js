import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * Server-side API route to retrieve stored external document URL reference metadata.
 *
 * GET /api/external-file/reference/[id]?url=<blob-reference-url>
 *
 * Security:
 * - Ensures target URL belongs to Vercel Blob storage & ends with .json / external-references/.
 * - Never returns Blob read/write tokens or internal secrets to the client.
 */
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const refId = resolvedParams?.id;
    let referenceUrl = searchParams.get("url");

    if (!referenceUrl && refId) {
      // If full reference URL wasn't provided in query param, construct default pathname search
      if (refId.startsWith("http://") || refId.startsWith("https://")) {
        referenceUrl = refId;
      }
    }

    if (!referenceUrl) {
      return NextResponse.json(
        { error: "Missing required reference URL parameter." },
        { status: 400 }
      );
    }

    // SSRF & Domain Validation: Target must be a Vercel Blob JSON metadata reference
    let parsedUrl;
    try {
      parsedUrl = new URL(referenceUrl);
    } catch {
      return NextResponse.json({ error: "Invalid reference URL format." }, { status: 400 });
    }

    const isVercelBlobDomain =
      parsedUrl.hostname.endsWith(".blob.vercel-storage.com") ||
      parsedUrl.hostname.endsWith("vercel.com");

    const isJsonReference =
      parsedUrl.pathname.includes("external-references/") ||
      parsedUrl.pathname.endsWith(".json");

    if (!isVercelBlobDomain || !isJsonReference) {
      return NextResponse.json(
        { error: "Forbidden: Target URL is not a valid external reference JSON object." },
        { status: 400 }
      );
    }

    const blobToken =
      process.env.VERCEL_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

    // 1. Try SDK get() for private access
    let metadataJson = null;
    if (blobToken) {
      try {
        const blobResult = await get(referenceUrl, {
          access: "private",
          token: blobToken,
        });

        if (blobResult && blobResult.stream) {
          const text = await new Response(blobResult.stream).text();
          metadataJson = JSON.parse(text);
        }
      } catch (sdkErr) {
        console.warn("[EXTERNAL REF API] SDK get() note:", sdkErr?.message || sdkErr);
      }
    }

    // 2. Direct authenticated fetch fallback
    if (!metadataJson) {
      const headers = blobToken ? { Authorization: `Bearer ${blobToken}` } : {};
      const res = await fetch(referenceUrl, { headers, cache: "no-store" });
      if (res.ok) {
        metadataJson = await res.json();
      }
    }

    if (!metadataJson || metadataJson.sourceType !== "EXTERNAL_URL") {
      return NextResponse.json(
        { error: "Failed to retrieve valid external reference metadata." },
        { status: 404 }
      );
    }

    // Return safe metadata JSON to frontend
    return NextResponse.json({
      success: true,
      metadata: {
        version: metadataJson.version || 1,
        sourceType: "EXTERNAL_URL",
        provider: metadataJson.provider || "UNKNOWN",
        fileType: metadataJson.fileType || "UNKNOWN",
        sourceUrl: metadataJson.sourceUrl || "",
        viewerUrl: metadataJson.viewerUrl || "",
        fileId: metadataJson.fileId || null,
        createdAt: metadataJson.createdAt || null,
      },
    });
  } catch (error) {
    console.error("[EXTERNAL REF RETRIEVAL API ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to retrieve external reference" },
      { status: 500 }
    );
  }
}
