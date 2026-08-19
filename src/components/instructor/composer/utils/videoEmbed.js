import { getYouTubeEmbedUrl, isYouTubeUrl } from "@/lib/youtube";

const VIMEO_ID_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

export function isVimeoUrl(url) {
  return Boolean(url && VIMEO_ID_PATTERN.test(url));
}

export function getVimeoEmbedUrl(url) {
  const match = url && url.match(VIMEO_ID_PATTERN);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

/**
 * Resolves a pasted/uploaded video URL to how it should render:
 * YouTube/Vimeo links embed via iframe (matches the source CourseComposer
 * tool's behavior), anything else (including our own uploaded file URLs)
 * plays as a native <video> tag.
 */
export function resolveVideoEmbed(url) {
  if (!url) return { kind: "none" };

  if (isYouTubeUrl(url)) {
    return { kind: "iframe", src: getYouTubeEmbedUrl(url) };
  }

  if (isVimeoUrl(url)) {
    return { kind: "iframe", src: getVimeoEmbedUrl(url) };
  }

  return { kind: "video", src: url };
}
