import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Composer block type -> backend ContentType enum. The Content row's typed
 * columns (videoUrl/fileUrl/htmlContent/externalUrl) are populated per-type
 * so the rest of the LMS (student lesson player, old instructor forms) keeps
 * working unmodified; the full-fidelity block is additionally stored in the
 * `data` JSON column for lossless round-trip editing here in the composer.
 */
export const TYPE_TO_CONTENT_TYPE = {
  text: "HTML",
  image: "IMAGE",
  video: "VIDEO",
  slideshow: "PRESENTATION",
  chart: "EMBED",
  interactive: "INTERACTIVE_LAB",
  quiz: "EMBED",
  audio: "AUDIO",
  document: "DOCUMENT",
  link: "LINK",
  code: "CODE",
  unknown: "FILE",
};

function renderMarkdownHtml(markdown) {
  if (!markdown) return "";
  return DOMPurify.sanitize(marked.parse(markdown));
}

/** Converts a local composer block into a Content create/update body. */
export function toContentPayload(block, { lessonId, order, parentContentId }) {
  const payload = {
    lessonId,
    order,
    type: TYPE_TO_CONTENT_TYPE[block.blockType] || "EMBED",
    title: block.title || null,
    data: block,
  };

  // Only set when the caller explicitly passes it, so a routine save of an
  // already-nested (or already-top-level) block never accidentally resets
  // its parent.
  if (parentContentId !== undefined) {
    payload.parentContentId = parentContentId;
  }

  switch (block.blockType) {
    case "text":
      payload.htmlContent = renderMarkdownHtml(block.markdown);
      break;
    case "image":
      payload.fileUrl = block.url || null;
      payload.htmlContent = renderMarkdownHtml(block.caption);
      break;
    case "video":
      payload.videoUrl = block.url || null;
      payload.htmlContent = renderMarkdownHtml(block.caption);
      break;
    case "slideshow":
      payload.htmlContent = renderMarkdownHtml(block.markdown);
      break;
    case "chart":
      payload.htmlContent = JSON.stringify(block.rows || []);
      break;
    case "interactive":
      payload.externalUrl = block.url || null;
      break;
    case "quiz":
      payload.htmlContent = renderMarkdownHtml(block.question);
      break;
    case "audio":
      payload.fileUrl = block.url || null;
      payload.htmlContent = renderMarkdownHtml(block.caption);
      break;
    case "document":
      payload.fileUrl = block.url || null;
      break;
    case "link":
      payload.externalUrl = block.url || null;
      break;
    case "code":
      payload.htmlContent = block.code || "";
      break;
    default:
      break;
  }

  return payload;
}

/**
 * Converts a Content row back into a local composer block. Rows created via
 * the older full-page Module/Lesson/Content forms have `data: null` — those
 * render read-only with a fallback link into the classic edit form rather
 * than crashing on missing block fields.
 */
export function fromContentRow(row) {
  if (row?.data && row.data.blockType) {
    return { ...row.data, id: row.id, order: row.order, parentContentId: row.parentContentId ?? null };
  }

  return {
    id: row.id,
    order: row.order,
    parentContentId: row.parentContentId ?? null,
    blockType: "legacy",
    legacyType: row.type,
    title: row.title,
    row,
  };
}
