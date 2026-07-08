"use client";

import { useRouter } from "next/navigation";

import CourseForm from "@/components/courses/CourseForm";
import { useCreateCourse } from "@/hooks/queries/instructor/useCreateCourse";

export default function CreateCoursePage() {
    const router = useRouter();

    const createCourseMutation =
        useCreateCourse();

    const handleSubmit = async (
        values
    ) => {
        try {
            await createCourseMutation.mutateAsync(
                values
            );

            router.push(
                "/instructor/courses"
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <CourseForm
            mode="create"
            loading={
                createCourseMutation.isPending
            }
            onSubmit={handleSubmit}
        />
    );
}