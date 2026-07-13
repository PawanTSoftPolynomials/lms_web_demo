import api from "@/lib/axios";

/* Local storage fallback DB helper */
const LOCAL_CONVS_KEY = "lms_mock_conversations";
const LOCAL_MSGS_KEY = "lms_mock_messages";

export const getLocalConvs = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_CONVS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalConvs = (convs) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_CONVS_KEY, JSON.stringify(convs));
  }
};

export const getLocalMsgs = (convId) => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`${LOCAL_MSGS_KEY}_${convId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalMsgs = (convId, msgs) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${LOCAL_MSGS_KEY}_${convId}`, JSON.stringify(msgs));
  }
};

/* Conversations */

export const getConversations = async () => {
  try {
    const { data } = await api.get("/conversations");
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn("Backend /conversations endpoint not found. Using localStorage fallback.");
      return { data: getLocalConvs() };
    }
    throw error;
  }
};

export const getConversation = async (conversationId) => {
  try {
    const { data } = await api.get(
      `/conversations/${conversationId}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const convs = getLocalConvs();
      const match = convs.find((c) => c.id === conversationId);
      return { data: match || null };
    }
    throw error;
  }
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

  try {
    const { data } = await api.post(
      "/conversations",
      backendPayload
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const convs = getLocalConvs();
      const newConv = {
        id: `mock_conv_${Date.now()}`,
        name: payload.name || "Private Chat",
        isGroup: payload.isGroup || false,
        courseId: payload.courseId || null,
        participants: payload.participantIds?.map(id => ({ id })) || [],
        unread: 0,
        lastSeen: "Just now",
        online: true
      };
      convs.unshift(newConv);
      saveLocalConvs(convs);
      return { data: newConv };
    }
    throw error;
  }
};

export const updateConversation = async (
  conversationId,
  payload
) => {
  try {
    const { data } = await api.patch(
      `/conversations/${conversationId}`,
      payload
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const convs = getLocalConvs();
      const idx = convs.findIndex((c) => c.id === conversationId);
      if (idx !== -1) {
        convs[idx] = { ...convs[idx], ...payload };
        saveLocalConvs(convs);
      }
      return { data: convs[idx] };
    }
    throw error;
  }
};

export const deleteConversation = async (
  conversationId
) => {
  try {
    const { data } = await api.delete(
      `/conversations/${conversationId}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const convs = getLocalConvs();
      const filtered = convs.filter((c) => c.id !== conversationId);
      saveLocalConvs(filtered);
      return { data: { success: true } };
    }
    throw error;
  }
};

/* Participants */

export const addParticipants = async (
  conversationId,
  payload
) => {
  try {
    const { data } = await api.post(
      `/conversations/${conversationId}/participants`,
      payload
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
};

export const removeParticipant = async (
  conversationId,
  userId
) => {
  try {
    const { data } = await api.delete(
      `/conversations/${conversationId}/participants/${userId}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
};

/* Messages */

export const getMessages = async (
  conversationId,
  page = 1,
  limit = 20
) => {
  // Bypassing database call if it is a mock conversation
  if (conversationId?.toString().startsWith("mock_")) {
    return { data: getLocalMsgs(conversationId) };
  }

  try {
    const { data } = await api.get(
      `/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 500) {
      return { data: getLocalMsgs(conversationId) };
    }
    throw error;
  }
};

export const sendMessage = async (
  conversationId,
  payload
) => {
  // Bypassing database call if it is a mock conversation
  if (conversationId?.toString().startsWith("mock_")) {
    const msgs = getLocalMsgs(conversationId);
    const newMsg = {
      id: `mock_msg_${Date.now()}`,
      text: payload.text,
      senderId: "me",
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      read: false
    };
    msgs.push(newMsg);
    saveLocalMsgs(conversationId, msgs);

    // Update conversation last message in local cache list
    const convs = getLocalConvs();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].lastMessage = payload.text;
      convs[idx].lastSeen = "Just now";
      saveLocalConvs(convs);
    } else {
      // Create fallback mock conversation in local storage if not present
      const newConv = {
        id: conversationId,
        name: "Mock User",
        isGroup: false,
        lastMessage: payload.text,
        lastSeen: "Just now",
        unread: 0
      };
      saveLocalConvs([newConv, ...convs]);
    }
    return { data: newMsg };
  }

  try {
    // Construct payload with conversationId and both 'text' and 'content' for compatibility
    const dataPayload = {
      conversationId,
      text: payload.text,
      content: payload.text,
      attachments: payload.attachments || [],
    };
    const { data } = await api.post(
      `/messages`,
      dataPayload
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 500) {
      const msgs = getLocalMsgs(conversationId);
      const newMsg = {
        id: `mock_msg_${Date.now()}`,
        text: payload.text,
        senderId: "me",
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        read: false
      };
      msgs.push(newMsg);
      saveLocalMsgs(conversationId, msgs);

      // Update conversation last message
      const convs = getLocalConvs();
      const idx = convs.findIndex((c) => c.id === conversationId);
      if (idx !== -1) {
        convs[idx].lastMessage = payload.text;
        convs[idx].lastSeen = "Just now";
        saveLocalConvs(convs);
      }
      return { data: newMsg };
    }
    throw error;
  }
};

export const markAsRead = async (
  conversationId
) => {
  try {
    const { data } = await api.patch(
      `/conversations/${conversationId}/read`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
};

export const deleteMessage = async (
  messageId
) => {
  try {
    const { data } = await api.delete(
      `/messages/${messageId}`
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
};

export const updateMessage = async (
  messageId,
  payload
) => {
  try {
    const dataPayload = {
      text: payload.text,
      content: payload.text,
    };
    const { data } = await api.patch(
      `/messages/${messageId}`,
      dataPayload
    );
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
};

export const toggleStarMessage = async (messageId) => {
  try {
    const { data } = await api.patch(`/messages/${messageId}/star`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { data: { success: true } };
    }
    throw error;
  }
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