export type HtmlCellVariant = "text" | "heading" | "image";

/** Marker classes written by the Heading/Image create & edit forms — kept distinct from any real design-system class. */
export const HEADING_MARKER_CLASS = "cc-heading-block";
export const IMAGE_MARKER_CLASS = "cc-image-block";

/**
 * Heading and Image cells are both persisted as `type: "HTML"` (see
 * cellTypes.ts) since that's the only rich-content type the backend allows
 * today. To tell them apart from plain Text after reloading, their forms
 * wrap the saved markup in an element carrying one of the marker classes
 * above — `class` survives the backend's HTML sanitizer (unlike e.g.
 * `data-*` attributes, which aren't in its allow-list), so the marker
 * round-trips reliably. Anything without a marker is rendered as Text.
 */
export function detectHtmlCellVariant(htmlContent: string | null | undefined): HtmlCellVariant {
  if (!htmlContent || typeof window === "undefined") return "text";

  const root = new DOMParser().parseFromString(htmlContent, "text/html").body.firstElementChild;
  if (!root) return "text";
  if (root.classList.contains(HEADING_MARKER_CLASS)) return "heading";
  if (root.classList.contains(IMAGE_MARKER_CLASS)) return "image";
  return "text";
}
