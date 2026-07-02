"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/common/Loader";

import useCourse from "@/hooks/queries/students/useCourse";
import useEnrollCourse from "@/hooks/queries/students/useEnrollCourse";

export default function CourseDetails() {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useCourse(courseId);
  const enrollCourseMutation = useEnrollCourse();

  const course = data?.data || data;

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return <Card className="text-slate-300">Course not found.</Card>;
  }

  const handleEnroll = async () => {
    enrollCourseMutation.mutate(courseId);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={course.title} subtitle={course.description} />

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-400">{course.category || "General"}</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{course.level || "Beginner"}</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{course.modules?.length || 0} modules</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{course.quizzes?.length || 0} quizzes</span>
        </div>

        <p className="text-slate-300">{course.description || "More details will be available soon."}</p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEnroll} loading={enrollCourseMutation.isPending}>
            {course.enrolled || course.isEnrolled ? "Already Enrolled" : "Enroll Now"}
          </Button>
          <Link href={`/student/learn/${courseId}`} className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-700">
            Open Lessons
          </Link>
          <Link href={`/student/quizzes/${courseId}`} className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-700">
            View Quizzes
          </Link>
        </div>
      </Card>
    </div>
  );
}
