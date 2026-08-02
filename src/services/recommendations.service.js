/**
 * Stub interface for a future Recommendations feature — no backend
 * model/route exists yet. Kept as a documented placeholder so a real
 * implementation can drop in later without the page needing to change.
 * @returns {Promise<Array<{id: string, title: string, reason: string}>>}
 */
export const getRecommendations = async () => {
  throw new Error("Recommendations is not implemented yet — no backend exists for this feature.");
};
