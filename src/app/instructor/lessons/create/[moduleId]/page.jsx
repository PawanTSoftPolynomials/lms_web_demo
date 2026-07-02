"use client";

import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import LessonForm from "@/components/instructor/lessons/LessonForm";

import {useLessons} from "@/hooks/queries/instructor/useLessons";
import {useCreateLesson} from "@/hooks/queries/instructor/useCreateLesson";

export default function CreateLessonPage() {
    const {moduleId} = useParams();
    const router = useRouter();

    const createLessonMutation = useCreateLesson();

    const {
        data: lessons = [],
        isLoading,
    } = useLessons(moduleId);

    const handleSubmit = async (values) => {
        const nextOrder =
            lessons.length > 0
                ? Math.max(...lessons.map((lesson) => lesson.order), 0) + 1
                : 1;

        try {
            await createLessonMutation.mutateAsync({
                ...values,
                moduleId,
                order: nextOrder,
            });

            router.push(
                `/instructor/modules/${moduleId}`
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

    return (
        <LessonForm
            mode="create"
            loading={createLessonMutation.isPending}
            onSubmit={handleSubmit}
        />
    );
}