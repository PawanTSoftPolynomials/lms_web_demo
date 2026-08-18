import api from "@/lib/axios";

export const getTopics =
  async (lessonId) => {
    const response =
      await api.get(
        `/topics?lessonId=${lessonId}`
      );

    return response.data;
  };

export const getTopicById =
  async (topicId) => {
    const response =
      await api.get(
        `/topics/${topicId}`
      );

    return response.data;
  };

export const createTopic =
  async (data) => {
    const response =
      await api.post(
        "/topics",
        data
      );

    return response.data;
  };

export const updateTopic =
  async (
    topicId,
    data
  ) => {
    const response =
      await api.put(
        `/topics/${topicId}`,
        data
      );

    return response.data;
  };

export const deleteTopic =
  async (topicId) => {
    const response =
      await api.delete(
        `/topics/${topicId}`
      );

    return response.data;
  };

export const reorderTopics =
  async (lessonId, topics) => {
    const response =
      await api.patch(
        "/topics/reorder",
        { lessonId, topics }
      );

    return response.data;
  };
