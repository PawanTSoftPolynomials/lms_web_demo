import api from "@/lib/axios";

export const getResults = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const { data } = await api.get(`/results?${params.toString()}`);
  return data.data ?? data;
};
