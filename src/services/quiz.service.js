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

export const getQuizzes = async (
    courseId
) => {
    const url = courseId
        ? `/quizzes?courseId=${courseId}`
        : "/quizzes";

    const response =
        await api.get(url);

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
/**
 * Submit Quiz
 */
export const submitQuiz = async (
    quizId,
    answers
) => {
    const {data} = await api.post(
        `/quizzes/${quizId}/submit`,
        {
            answers,
        }
    );

    return data.data ?? data;
};

/**
 * Get Quiz Result
 */
export const getQuizResult =
    async (quizId) => {
        const {data} =
            await api.get(
                `/quizzes/${quizId}/result`
            );

        return data.data ?? data;
};

/**
 * Self Generate Quiz
 */
export const generateSelfAssessmentQuiz = async (courseId, questionCount = 5) => {
    const { data } = await api.post("/quizzes/self-generate", {
        courseId,
        questionCount
    });
    return data.data ?? data;
};