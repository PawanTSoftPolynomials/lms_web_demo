/**
 * Resolves media URLs for browser display.
 * If the URL points to a private Vercel Blob store (.private.blob.vercel-storage.com),
 * it routes through the secure server proxy (/api/blob-proxy) using server credentials,
 * allowing standard HTML elements (<img>, <video>, <iframe>) to render private files securely.
 */
export function getDisplayUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes(".private.blob.vercel-storage.com")) {
    return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
