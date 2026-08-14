import { marked } from "marked";

/**
 * Tokenizes markdown into block-level tokens (marked.lexer) so nested
 * children can anchor to a token index instead of a raw character offset —
 * a fenced code block or a loose list stays one anchor point even though it
 * contains internal blank lines, unlike naive blank-line-delimited
 * paragraph splitting. "space" tokens (blank-line separators) are dropped;
 * they render nothing and would just create meaningless anchor slots.
 */
export function tokenizeMarkdown(markdown) {
  if (!markdown) return [];
  return marked.lexer(markdown).filter((token) => token.type !== "space");
}

/** Renders a single block-level token back to (unsanitized) HTML. */
export function renderTokenHtml(token) {
  return marked.parser([token]);
}

/**
 * Groups children by the token index they were inserted after, clamped
 * into [0, tokenCount-1] (or 0 when there are no tokens yet) — a child
 * created when the text was longer, then anchored past the end after an
 * edit shrank it, still renders instead of disappearing.
 */
export function groupChildrenByAnchor(children, tokenCount) {
  const maxIndex = Math.max(tokenCount - 1, 0);
  const groups = new Map();

  for (const child of children) {
    const raw = child?.data?.afterAnchor;
    const anchor = Number.isInteger(raw) ? Math.min(Math.max(raw, 0), maxIndex) : maxIndex;
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor).push(child);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return groups;
}
