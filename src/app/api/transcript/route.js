import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function extractCaptionTracks(html) {
  const match = html.match(/"captionTracks":(\[[^\]]*\])/);
  if (!match) return [];

  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function pickTrack(tracks, lang) {
  if (!tracks.length) return null;

  return (
    tracks.find((t) => t.languageCode === lang && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode === lang) ||
    tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ||
    tracks.find((t) => t.languageCode?.startsWith("en")) ||
    tracks[0]
  );
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const lang = searchParams.get("lang") || "en";

  if (!videoId) {
    return NextResponse.json(
      { message: "videoId is required." },
      { status: 400 }
    );
  }

  try {
    const pageResponse = await fetch(
      `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      { headers: { "Accept-Language": "en-US,en;q=0.9" } }
    );

    if (!pageResponse.ok) {
      return NextResponse.json(
        { message: "Unable to reach YouTube." },
        { status: 502 }
      );
    }

    const html = await pageResponse.text();
    const track = pickTrack(extractCaptionTracks(html), lang);

    if (!track?.baseUrl) {
      return NextResponse.json(
        { message: "No captions available for this video." },
        { status: 404 }
      );
    }

    const captionResponse = await fetch(`${track.baseUrl}&fmt=json3`);

    if (!captionResponse.ok) {
      return NextResponse.json(
        { message: "Failed to fetch captions." },
        { status: 502 }
      );
    }

    const captionData = await captionResponse.json();

    const segments = (captionData.events || [])
      .filter((event) => Array.isArray(event.segs) && event.tStartMs != null)
      .map((event) => ({
        start: event.tStartMs / 1000,
        duration: (event.dDurationMs || 0) / 1000,
        text: decodeHtmlEntities(
          event.segs.map((seg) => seg.utf8 || "").join("")
        ).trim(),
      }))
      .filter((segment) => segment.text.length > 0);

    if (segments.length === 0) {
      return NextResponse.json(
        { message: "No captions available for this video." },
        { status: 404 }
      );
    }

    return NextResponse.json({ videoId, segments });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch transcript." },
      { status: 500 }
    );
  }
}
