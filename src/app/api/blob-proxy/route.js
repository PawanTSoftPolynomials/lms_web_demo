import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured on the server" }, { status: 500 });
    }

    // Authenticates and fetches private Vercel Blob file using server secret token
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${blobToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Blob proxy fetch failed with status ${response.status} for ${targetUrl}`);
      return new NextResponse("Failed to fetch private blob file", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Blob proxy error:", error);
    return NextResponse.json({ error: error.message || "Proxy error" }, { status: 500 });
  }
}
