const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/**
 * Resolves media URLs for browser display.
 * - If the URL points to a private Vercel Blob store (.private.blob.vercel-storage.com),
 *   it routes through the secure server proxy (/api/blob-proxy) using server credentials,
 *   allowing standard HTML elements (<img>, <video>, <iframe>) to render private files securely.
 * - If the URL is root-relative (e.g. "/uploads/thumbnails/x.png", returned by legacy/imported
 *   courses that were saved to the API's local disk instead of Blob storage), it is prefixed
 *   with the API origin. Otherwise a relative path resolves against the frontend's own origin
 *   (e.g. the Vercel deployment) and 404s, since that file only exists on the API server.
 */
export function getDisplayUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes(".private.blob.vercel-storage.com")) {
    return `/api/blob-proxy?url=${encodeURIComponent(url)}`;
  }
  if (url.startsWith("/") && API_ORIGIN) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
}
