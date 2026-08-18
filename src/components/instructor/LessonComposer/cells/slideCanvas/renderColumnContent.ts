import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

import type { SlideColumn } from "./slideElementTypes";

marked.setOptions({ breaks: true, gfm: true });

/**
 * The reference Composer renders column markdown via `marked.parse()` with
 * no sanitization step anywhere in that codebase — raw HTML embedded in the
 * markdown source (or typed directly, since marked passes inline HTML
 * through untouched) reaches the DOM unsanitized. We don't replicate that:
 * every column — markdown or HTML — is funneled through DOMPurify before
 * render, the same sanitize-before-dangerouslySetInnerHTML pattern already
 * used by TextCell.tsx for HTML content blocks.
 */
export function renderColumnContent(column: SlideColumn): string {
  if (!column.content) return "";
  const rawHtml = column.contentType === "markdown" ? (marked.parse(column.content) as string) : column.content;
  return DOMPurify.sanitize(rawHtml);
}
