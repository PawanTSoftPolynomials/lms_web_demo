import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSelfAssessmentQuiz } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

export default function useGenerateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, numQuestions }) =>
      generateSelfAssessmentQuiz(courseId, numQuestions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });
    },
  });
}
