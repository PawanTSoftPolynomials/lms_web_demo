/**
 * Stub interface for a future News feed — no backend model/route exists yet.
 * Kept as a documented placeholder (not wired to any endpoint) so a real
 * implementation can drop in later without the page needing to change.
 * @returns {Promise<Array<{id: string, title: string, body: string, publishedAt: string}>>}
 */
export const getNews = async () => {
  throw new Error("News is not implemented yet — no backend exists for this feature.");
};
