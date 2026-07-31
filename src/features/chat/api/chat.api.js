import api from "@/lib/axios";

/* Conversations */

export const getConversations = async () => {
  const { data } = await api.get("/conversations");
  return data;
};

export const getConversation = async (conversationId) => {
  const { data } = await api.get(`/conversations/${conversationId}`);
  return data;
};

export const createConversation = async (payload) => {
  const type = payload.type || (payload.isGroup ? "GROUP" : "DIRECT");
  const backendPayload = {
    type,
    participantIds: payload.participantIds || payload.participants || [],
  };

  if (type === "GROUP") {
    backendPayload.name = payload.name;
  }

  const { data } = await api.post("/conversations", backendPayload);
  return data;
};

export const updateConversation = async (conversationId, payload) => {
  const { data } = await api.patch(`/conversations/${conversationId}`, payload);
  return data;
};

export const deleteConversation = async (conversationId) => {
  const { data } = await api.delete(`/conversations/${conversationId}`);
  return data;
};

/* Participants */

export const addParticipants = async (conversationId, payload) => {
  const { data } = await api.post(`/conversations/${conversationId}/participants`, payload);
  return data;
};

export const removeParticipant = async (conversationId, userId) => {
  const { data } = await api.delete(`/conversations/${conversationId}/participants/${userId}`);
  return data;
};

/* Messages */

export const getMessages = async (conversationId, page = 1, limit = 20) => {
  const { data } = await api.get(
    `/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`
  );
  return data;
};

export const sendMessage = async (conversationId, payload) => {
  const dataPayload = {
    conversationId,
    text: payload.text,
    content: payload.text,
    attachments: payload.attachments || [],
  };
  const { data } = await api.post("/messages", dataPayload);
  return data;
};

export const markAsRead = async (conversationId) => {
  const { data } = await api.patch(`/messages/read/${conversationId}`);
  return data;
};

export const deleteMessage = async (messageId) => {
  const { data } = await api.delete(`/messages/${messageId}`);
  return data;
};

export const updateMessage = async (messageId, payload) => {
  const dataPayload = {
    text: payload.text,
    content: payload.text,
  };
  const { data } = await api.patch(`/messages/${messageId}`, dataPayload);
  return data;
};

export const toggleStarMessage = async (messageId) => {
  const { data } = await api.patch(`/messages/${messageId}/star`);
  return data;
};

export const uploadAttachment = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/messages/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
