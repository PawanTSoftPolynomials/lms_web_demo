import api from "@/lib/axios";

export const createQuiz =
  async (data) => {
    const response =
      await api.post(
        "/quizzes",
        data
      );

    return response.data.data;
  };

export const getQuizzes =
  async (courseId) => {
    const response =
      await api.get(
        `/quizzes?courseId=${courseId}`
      );

    return response.data.data;
  };

export const getQuizById =
  async (quizId) => {
    const response =
      await api.get(
        `/quizzes/${quizId}`
      );

    return response.data.data;
  };

export const updateQuiz =
  async (
    quizId,
    data
  ) => {
    const response =
      await api.put(
        `/quizzes/${quizId}`,
        data
      );

    return response.data.data;
  };

export const deleteQuiz =
  async (quizId) => {
    const response =
      await api.delete(
        `/quizzes/${quizId}`
      );

    return response.data;
  };