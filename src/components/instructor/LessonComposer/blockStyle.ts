import { HEADING_MARKER_CLASS } from "./htmlCellVariant";

export type TextAlign = "left" | "center" | "right";

export interface HeadingDesign {
  tag: string;
  text: string;
  align?: TextAlign;
  color?: string;
  /** px */
  fontSize?: number;
}

const DEFAULT_TAG = "h2";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getStyleValue(styleAttr: string | null, prop: string): string | undefined {
  if (!styleAttr) return undefined;
  const match = styleAttr.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"));
  return match ? match[1].trim() : undefined;
}

/**
 * Reads tag/text/align/color/fontSize off a Heading cell's stored `htmlContent`.
 * Used both to preselect the Block Settings panel's Design fields, and by
 * HeadingCell's own (text-only) inline edit so it can preserve whatever
 * design was previously set instead of resetting it.
 */
export function parseHeadingDesign(htmlContent: string | null | undefined): HeadingDesign {
  if (!htmlContent || typeof window === "undefined") {
    return { tag: DEFAULT_TAG, text: "" };
  }

  const root = new DOMParser().parseFromString(htmlContent, "text/html").body.firstElementChild;
  if (!root) return { tag: DEFAULT_TAG, text: "" };

  const styleAttr = root.getAttribute("style");
  const align = getStyleValue(styleAttr, "text-align");
  const color = getStyleValue(styleAttr, "color");
  const fontSizeRaw = getStyleValue(styleAttr, "font-size");
  const fontSize = fontSizeRaw ? parseInt(fontSizeRaw, 10) : undefined;

  return {
    tag: root.tagName.toLowerCase(),
    text: root.textContent ?? "",
    align: align === "left" || align === "center" || align === "right" ? align : undefined,
    color: color || undefined,
    fontSize: fontSize && !Number.isNaN(fontSize) ? fontSize : undefined,
  };
}

/**
 * Serializes a Heading cell's `htmlContent` from its design fields. Both
 * HeadingCell (text-only edits, via `parseHeadingDesign` first to carry
 * forward the rest) and the Block Settings panel's Design tab (design-only
 * edits) build through this one function, so neither surface ever silently
 * drops the other's changes.
 */
export function buildHeadingHtml(design: HeadingDesign): string {
  const tag = design.tag || DEFAULT_TAG;
  const styleParts: string[] = [];
  if (design.align) styleParts.push(`text-align: ${design.align}`);
  if (design.color) styleParts.push(`color: ${design.color}`);
  if (design.fontSize) styleParts.push(`font-size: ${design.fontSize}px`);
  const styleAttr = styleParts.length ? ` style="${styleParts.join("; ")}"` : "";

  return `<${tag} class="${HEADING_MARKER_CLASS}"${styleAttr}>${escapeHtml(design.text)}</${tag}>`;
}
