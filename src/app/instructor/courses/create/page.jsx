"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CourseForm from "@/components/courses/CourseForm";
import { useCreateCourse } from "@/hooks/queries/instructor/useCreateCourse";

export default function CreateCoursePage() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState("");

    const createCourseMutation =
        useCreateCourse();

    const handleSubmit = async (
        values
    ) => {
        setSubmitError("");
        try {
            await createCourseMutation.mutateAsync(
                values
            );

            router.push(
                "/instructor/courses"
            );
        } catch (error) {
            setSubmitError(
                error.response?.data?.message || "Failed to create course. Please try again."
            );
        }
    };

    return (
        <CourseForm
            mode="create"
            loading={
                createCourseMutation.isPending
            }
            onSubmit={handleSubmit}
            submitError={submitError}
        />
    );
}