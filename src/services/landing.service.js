import api from "@/lib/axios";

/**
 * Get Landing Page Data (Public stats and recently published courses)
 */
export const getLandingData = async () => {
  // Longer timeout than the global default: the free-tier backend host
  // can take 20-30s to wake up from a cold start after being idle.
  const { data } = await api.get("/public/landing-data", { timeout: 40000 });
  return data.data;
};
