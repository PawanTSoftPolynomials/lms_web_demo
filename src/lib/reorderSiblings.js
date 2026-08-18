/**
 * Computes a minimal reorder payload that swaps `targetId`'s position with
 * its immediate neighbor in `direction`, within an already order-sorted
 * `items` list. Returns null when there's no neighbor to swap with (already
 * at that edge of the list).
 */
export function swapSiblingOrder(items, targetId, direction) {
  const index = items.findIndex((item) => item.id === targetId);
  if (index === -1) return null;

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= items.length) return null;

  const target = items[index];
  const neighbor = items[neighborIndex];

  return [
    { id: target.id, order: neighbor.order },
    { id: neighbor.id, order: target.order },
  ];
}
