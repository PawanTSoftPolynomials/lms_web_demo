import api from "@/lib/axios";

export const getQuestions = async (
  quizId
) => {
  const url = quizId
    ? `/questions?quizId=${quizId}`
    : "/questions";

  const response =
    await api.get(url);

  return response.data.data;
};

export const getQuestionById =
  async (questionId) => {
    const response =
      await api.get(
        `/questions/${questionId}`
      );

    return response.data.data;
  };

export const createQuestion =
  async (data) => {
    const response =
      await api.post(
        "/questions",
        data
      );

    return response.data.data;
  };

export const updateQuestion =
  async (
    questionId,
    data
  ) => {
    const response =
      await api.put(
        `/questions/${questionId}`,
        data
      );

    return response.data.data;
  };

export const deleteQuestion =
  async (questionId) => {
    const response =
      await api.delete(
        `/questions/${questionId}`
      );

    return response.data;
  };

export const bulkCreateQuestions = async (quizId, questions) => {
  const response = await api.post("/questions/bulk", {
    quizId,
    questions,
  });
  return response.data;
};

export const importQuestions = async (quizId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("quizId", quizId);

  const response = await api.post("/questions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};