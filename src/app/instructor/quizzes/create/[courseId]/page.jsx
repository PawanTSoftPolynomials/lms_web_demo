"use client";

import { useParams, useRouter } from "next/navigation";
import QuizForm from "@/components/instructor/quizzes/QuizForm";
import { useCreateQuiz } from "@/hooks/queries/instructor/useCreateQuiz";
import { useCreateCalendarEvent } from "@/hooks/queries/instructor/useCreateCalendarEvent";

export default function CreateQuizPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const createQuizMutation = useCreateQuiz();
    const createCalendarEventMutation = useCreateCalendarEvent();

    const handleSubmit = async (values, action) => {
        try {
            const payload = {
                ...values,
                courseId,
                status: action === "draft" ? "DRAFT" : "ACTIVE",
                isPublished: action !== "draft"
            };

            await createQuizMutation.mutateAsync(payload);

            // Sync to Calendar if startDate is provided
            if (payload.startDate) {
                try {
                    const dateObj = new Date(payload.startDate);
                    const dateStr = dateObj.toISOString().split("T")[0];
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    await createCalendarEventMutation.mutateAsync({
                        title: payload.title || "Scheduled Quiz",
                        type: "quiz",
                        date: dateStr,
                        startTime: timeStr,
                        description: payload.description || "Course Quiz",
                        courseName: "Course Quiz",
                    });
                } catch (e) {
                    console.warn("Unable to sync quiz to calendar:", e);
                }
            }

            router.push(`/instructor/quizzes`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <QuizForm
            mode="create"
            lockedCourseId={courseId}
            onSubmit={handleSubmit}
            loading={createQuizMutation.isPending}
        />
    );
}