"use client";

import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import LessonForm from "@/components/instructor/lessons/LessonForm";

import {useLesson} from "@/hooks/queries/instructor/useLesson";
import {useUpdateLesson} from "@/hooks/queries/instructor/useUpdateLesson";

export default function EditLessonPage() {
    const {lessonId} = useParams();

    const router = useRouter();

    const {
        data: lesson,
        isLoading,
        isError,
    } = useLesson(lessonId);

    const updateLessonMutation =
        useUpdateLesson();

    const handleSubmit = async (
        values
    ) => {
        try {
            await updateLessonMutation.mutateAsync({
                lessonId,
                lessonData: {
                    ...values,
                    moduleId: lesson.moduleId,
                    order: lesson.order,
                },
            });

            router.push(
                `/instructor/lessons/${lessonId}`
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (isError || !lesson) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Lesson Not Found
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Unable to load lesson.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <LessonForm
            mode="edit"
            initialValues={lesson}
            loading={
                updateLessonMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}