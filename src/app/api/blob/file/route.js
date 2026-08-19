import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * Streams a private blob back to the browser. Only `pathname` (never a raw
 * URL) is accepted from the client, so this can only ever resolve into our
 * own configured store — there's no way to point it at an arbitrary host.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pathname = searchParams.get("pathname");

  if (!pathname || !pathname.startsWith("course-composer/")) {
    return NextResponse.json({ message: "Missing or invalid pathname" }, { status: 400 });
  }

  const result = await get(pathname, { access: "private" });

  if (!result || result.statusCode !== 200) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
