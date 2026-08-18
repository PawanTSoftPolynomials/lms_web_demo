/**
 * Groups a flat, ordered list of Lesson/Topic Content rows into render items
 * for the student content viewer.
 *
 * Imported courses store each markdown block (heading, paragraph, table, ...)
 * as its own `type: "HTML"` Content row, so a single written lecture can be
 * dozens of consecutive rows. Rendered one-per-card that's unreadable, so
 * consecutive HTML rows are merged here into one synthetic document item —
 * their existing `htmlContent` strings are concatenated as-is (nothing is
 * parsed, rewritten, or invented). Every other content type (VIDEO, FILE,
 * EXTERNAL, ...) passes through unchanged, in its original position.
 *
 * The merged item keeps the `id` of its first block, so callers that persist
 * a contentId (state sync, bookmarks) keep referencing a real Content row.
 * It only carries a `title` if one of its blocks actually had one.
 */
export function groupLessonContentForDocumentView(contents) {
  const items = Array.isArray(contents) ? contents : [];
  const grouped = [];

  for (const item of items) {
    const last = grouped[grouped.length - 1];

    if (item?.type === "HTML" && last?.type === "HTML" && last.__merged) {
      last.htmlContent = [last.htmlContent, item.htmlContent].filter(Boolean).join("\n");
      if (!last.title && item.title) last.title = item.title;
      continue;
    }

    grouped.push(item?.type === "HTML" ? { ...item, __merged: true } : item);
  }

  return grouped;
}
