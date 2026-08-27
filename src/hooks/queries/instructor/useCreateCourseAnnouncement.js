import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCourseAnnouncement } from "@/services/announcement.service";

export function useCreateCourseAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        /** @param {{ courseId: string, title: string, message: string }} variables */
        mutationFn: ({ courseId, title, message }) =>
            createCourseAnnouncement(courseId, { title, message }),

        onSuccess: () => {
            // The instructor dashboard's Announcements widget is the only
            // place course announcements are currently listed for instructors.
            queryClient.invalidateQueries({ queryKey: ["instructor-home", "announcements"] });
        },
    });
}
