"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import CourseForm from "@/components/courses/CourseForm";

import {useInstructorCourse} from "@/hooks/queries/instructor/useInstructorCourse";
import {useUpdateCourse} from "@/hooks/queries/instructor/useUpdateCourse";

export default function EditCoursePage() {
    const {courseId} = useParams();

    const router = useRouter();
    const [submitError, setSubmitError] = useState("");

    const {
        data: course,
        isLoading,
        isError,
    } = useInstructorCourse(courseId);

    const updateCourseMutation =
        useUpdateCourse();

    const handleSubmit = async (
        values
    ) => {
        setSubmitError("");
        try {
            await updateCourseMutation.mutateAsync({
                courseId,
                courseData: values,
            });

            router.push(
                `/instructor/courses/${courseId}`
            );
        } catch (error) {
            setSubmitError(
                error.response?.data?.message || "Failed to update course. Please try again."
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (isError || !course) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Course Not Found
                    </h2>

                    <p className="mt-2 text-muted-foreground">
                        Unable to load the course.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <CourseForm
            mode="edit"
            initialValues={{
                ...course,
                status:
                    course.status || "DRAFT",
            }}
            loading={
                updateCourseMutation.isPending
            }
            onSubmit={handleSubmit}
            submitError={submitError}
        />
    );
}