"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyLearningPath } from "@/services/learningPath.service";
import { QUERY_KEYS } from "@/constants/queryKeys";

/**
 * @param {string|undefined} studentId - the StudentProfile id (e.g. `profile.studentProfile.id` from useProfile()), not the User id.
 */
export default function useLearningPath(studentId) {
    return useQuery({
        queryKey: [QUERY_KEYS.LEARNING_PATH, studentId],
        queryFn: () => getMyLearningPath(studentId),
        enabled: Boolean(studentId),
        retry: false,
    });
}
