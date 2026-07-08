"use client";

import {useParams, useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import CourseForm from "@/components/courses/CourseForm";

import {useInstructorCourse} from "@/hooks/queries/instructor/useInstructorCourse";
import {useUpdateCourse} from "@/hooks/queries/instructor/useUpdateCourse";

export default function EditCoursePage() {
    const {courseId} = useParams();

    const router = useRouter();

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
        try {
            await updateCourseMutation.mutateAsync({
                courseId,
                courseData: {
                    ...values,
                    status: values.status,
                },
            });

            router.push(
                `/instructor/courses/${courseId}`
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

    if (isError || !course) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Course Not Found
                    </h2>

                    <p className="mt-2 text-slate-400">
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
        />
    );
}