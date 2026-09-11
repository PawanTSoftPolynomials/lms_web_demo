import { useQuery } from "@tanstack/react-query";

import { getMyQuizSubmissions } from "@/services/quiz.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { defaultQueryOptions } from "@/lib/queryOptions";

/** Every quiz the student has attempted, for the Submissions page. */
export default function useQuizSubmissions() {
  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_QUIZ_SUBMISSIONS],
    queryFn: getMyQuizSubmissions,
    ...defaultQueryOptions,
    // useSubmitQuiz invalidates this key; without refetching on mount a quiz
    // submitted moments ago wouldn't appear until the cache expired.
    refetchOnMount: true,
  });
}
