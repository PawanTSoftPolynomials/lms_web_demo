import api from "../lib/axios";

const BASE = "/bookmarks";

export const getBookmarks = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data.data;
};

export const createBookmark = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data.data;
};

export const deleteBookmark = async (bookmarkId) => {
  const { data } = await api.delete(`${BASE}/${bookmarkId}`);
  return data;
};
