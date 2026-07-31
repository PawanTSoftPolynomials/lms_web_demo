import api from "@/lib/axios";

export const getDiscussions = async (courseId) => {
  const { data } = await api.get(`/discussions?courseId=${courseId}`);
  return data.data;
};

export const createDiscussion = async (payload) => {
  const { data } = await api.post("/discussions", payload);
  return data.data;
};

export const replyToDiscussion = async (discussionId, content) => {
  const { data } = await api.post(`/discussions/${discussionId}/replies`, { content });
  return data.data;
};

export const updateDiscussion = async (discussionId, payload) => {
  const { data } = await api.patch(`/discussions/${discussionId}`, payload);
  return data.data;
};

export const deleteDiscussion = async (discussionId) => {
  const { data } = await api.delete(`/discussions/${discussionId}`);
  return data.data;
};

export const deleteDiscussionReply = async (replyId) => {
  const { data } = await api.delete(`/discussions/replies/${replyId}`);
  return data.data;
};
