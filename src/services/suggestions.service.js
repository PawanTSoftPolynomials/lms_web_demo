/**
 * Stub interface for a future Suggestions feature — no backend model/route
 * exists yet. Kept as a documented placeholder so a real implementation can
 * drop in later without the page needing to change.
 * @returns {Promise<Array<{id: string, title: string, description: string}>>}
 */
export const getSuggestions = async () => {
  throw new Error("Suggestions is not implemented yet — no backend exists for this feature.");
};
