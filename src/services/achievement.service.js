import api from "../lib/axios";

const BASE = "/achievements";

export const getAchievements = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data.data;
};

export const getMyAchievements = async () => {
  const { data } = await api.get(`${BASE}/me`);
  return data.data;
};

export const createAchievement = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data.data;
};

export const checkAndAwardAchievements = async () => {
  const { data } = await api.post(`${BASE}/check`);
  return data.data;
};
