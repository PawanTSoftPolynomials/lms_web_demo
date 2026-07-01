"use client";

import {useRouter, useParams} from "next/navigation";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import CourseForm from "@/components/admin/courses/CourseForm";

import {
    useCourse,
    useUpdateCourse,
} from "@/hooks/queries/admin/useCourses";

export default function EditCoursePage() {
    const router = useRouter();
    const {courseId} = useParams();

    const {
        data: course,
        isLoading,
        isError,
    } = useCourse(courseId);

    const updateCourseMutation =
        useUpdateCourse();

    const handleSubmit = async (
        courseData
    ) => {
        try {
            await updateCourseMutation.mutateAsync({
                courseId,
                courseData,
            });

            router.push(
                "/admin/courses"
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-24">
                <Loader/>
            </div>
        );
    }

    if (isError || !course) {
        return (
            <div className="py-24 text-center text-red-500">
                Failed to load course.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Edit Course"
                subtitle="Update course information."
            />

            <CourseForm
                initialValues={course}
                onSubmit={handleSubmit}
                isSubmitting={
                    updateCourseMutation.isPending
                }
            />
        </div>
    );
}