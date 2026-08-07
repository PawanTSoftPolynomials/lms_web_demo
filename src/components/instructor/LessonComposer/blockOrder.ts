import type { ContentRow } from "./types";

/** Ascending by `order` — the Composer relies on this both to render blocks in sequence and to position new inserts against their neighbors. */
export function sortByOrder(contents: ContentRow[]): ContentRow[] {
  return [...contents].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export interface InsertPlan {
  /** The integer `order` the new block should be created with. */
  insertOrder: number;
  /**
   * Existing rows that must be moved to `newOrder` first, in this exact
   * order — highest original `order` first. `Content` has a
   * `@@unique([lessonId, order])` constraint, so shifting low-to-high would
   * transiently collide with the row already sitting at the target value;
   * highest-first never does, because each row only ever moves into a slot
   * its higher neighbor has already vacated.
   */
  shifts: { contentId: string; newOrder: number }[];
}

/**
 * Plans how to insert a new block immediately above/below `anchorId`. The
 * backend's `order` column is a plain required integer (`Joi.number()
 * .integer()` — see content.validation.js), so — unlike a scheme that
 * splits the midpoint between two neighbors — landing on a specific integer
 * slot means bumping every block from that slot onward up by one first.
 * `updateContent` (PUT /contents/:id) does persist an `order` change, so
 * this is a plain sequence of existing, already-supported calls: N shifts
 * (awaited one at a time, in `shifts` order) then one `createContent` at
 * `insertOrder` — no new endpoint, no bulk/transactional call needed.
 *
 * Inserting below the last block needs no shifting at all: it resolves to
 * a clean append (anchor + 1), the same value the toolbar's "Add Block"
 * already uses.
 */
export function planInsert(
  contents: ContentRow[],
  anchorId: string,
  position: "above" | "below"
): InsertPlan {
  const sorted = sortByOrder(contents);
  const index = sorted.findIndex((c) => c.id === anchorId);

  if (index === -1) {
    const max = sorted.length ? Math.max(...sorted.map((c) => c.order ?? 0)) : 0;
    return { insertOrder: max + 1, shifts: [] };
  }

  // "below anchor" and "above the next block" are the same insertion point.
  const targetIndex = position === "above" ? index : index + 1;

  if (targetIndex >= sorted.length) {
    const anchorOrder = sorted[index].order ?? index + 1;
    return { insertOrder: anchorOrder + 1, shifts: [] };
  }

  const insertOrder = sorted[targetIndex].order ?? targetIndex + 1;
  const shifts = sorted
    .slice(targetIndex)
    .map((c) => ({ contentId: c.id, newOrder: (c.order ?? 0) + 1 }))
    .reverse();

  return { insertOrder, shifts };
}
