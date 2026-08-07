import type { ContentRow } from "./types";

/** Ascending by `order` — the Composer relies on this both to render blocks in sequence and to position new inserts against their neighbors. */
export function sortByOrder(contents: ContentRow[]): ContentRow[] {
  return [...contents].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * The `order` value for a new block inserted immediately above/below
 * `anchorId`, computed as the midpoint between the anchor and its neighbor
 * on that side. This is what lets "Add Above"/"Add Below" reuse the same
 * single `createContent` call as every other insertion (see AddCellModal) —
 * it never touches an existing row's `order`, which matters because
 * PATCH-ing one isn't supported by the backend today (see CellShell).
 *
 * Inserting below the last block has no "next" neighbor, so it resolves to
 * a clean integer append (anchor + 1) — the same value the toolbar's
 * "Add Block" already uses. Every other case lands on a fractional value
 * (e.g. 1.5 between blocks ordered 1 and 2); if the backend's `order`
 * column turns out to reject non-integers, creation will fail with a clear
 * toast rather than silently misplacing or corrupting a sibling's order.
 */
export function computeInsertOrder(
  contents: ContentRow[],
  anchorId: string,
  position: "above" | "below"
): number {
  const sorted = sortByOrder(contents);
  const index = sorted.findIndex((c) => c.id === anchorId);

  if (index === -1) {
    const max = sorted.length ? Math.max(...sorted.map((c) => c.order ?? 0)) : 0;
    return max + 1;
  }

  const anchorOrder = sorted[index].order ?? index + 1;

  if (position === "above") {
    const prevOrder = index > 0 ? (sorted[index - 1].order ?? 0) : 0;
    return (prevOrder + anchorOrder) / 2;
  }

  const nextOrder = index < sorted.length - 1 ? (sorted[index + 1].order ?? anchorOrder + 2) : anchorOrder + 2;
  return (anchorOrder + nextOrder) / 2;
}
