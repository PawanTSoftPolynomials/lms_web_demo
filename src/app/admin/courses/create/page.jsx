"use client";

import { useRouter } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import CourseForm from "@/components/admin/courses/CourseForm";

import { useCreateCourse } from "@/hooks/queries/admin/useCourses";

export default function CreateCoursePage() {
  const router = useRouter();

  const createCourseMutation =
      useCreateCourse();

  const handleSubmit = async (
      courseData
  ) => {
    try {
      await createCourseMutation.mutateAsync(
          courseData
      );

      router.push(
          "/admin/courses"
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (
      createCourseMutation.isPending
  ) {
    return (
        <div className="flex justify-center py-24">
          <Loader />
        </div>
    );
  }

  return (
      <div className="space-y-8">
        <PageHeader
            title="Create Course"
            subtitle="Create a new course."
        />

        <CourseForm
            onSubmit={handleSubmit}
            isSubmitting={
              createCourseMutation.isPending
            }
        />
      </div>
  );
}