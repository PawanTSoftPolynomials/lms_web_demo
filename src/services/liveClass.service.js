import api from "../lib/axios";

const BASE = "/live-classes";

export const getLiveClasses = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data.data;
};

export const getLiveClassById = async (liveClassId) => {
  const { data } = await api.get(`${BASE}/${liveClassId}`);
  return data.data;
};

export const createLiveClass = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data.data;
};

export const updateLiveClass = async (liveClassId, payload) => {
  const { data } = await api.put(`${BASE}/${liveClassId}`, payload);
  return data.data;
};

export const updateLiveClassStatus = async (liveClassId, status) => {
  const { data } = await api.patch(`${BASE}/${liveClassId}/status`, { status });
  return data.data;
};

export const deleteLiveClass = async (liveClassId) => {
  const { data } = await api.delete(`${BASE}/${liveClassId}`);
  return data;
};
