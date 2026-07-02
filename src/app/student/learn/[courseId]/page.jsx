"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loader from "@/components/common/Loader";
import LessonSidebar from "@/components/student/LessonSidebar";

import useCourse from "@/hooks/queries/student/useCourse";
import useCompleteLesson from "@/hooks/queries/student/useCompleteLesson";

export default function LearnPage() {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useCourse(courseId);
  const completeLessonMutation = useCompleteLesson();

  const course = data?.data || data;

  const lessons = useMemo(() => {
    const modules = course?.modules || [];

    return modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration || "N/A",
      }))
    );
  }, [course]);

  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    if (!selectedLesson && lessons.length > 0) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons, selectedLesson]);

  const markComplete = async () => {
    if (!selectedLesson?.id) return;
    completeLessonMutation.mutate(selectedLesson.id);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return <Card className="text-slate-300">Course not found.</Card>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={course.title} subtitle={course.description} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="flex min-h-96 items-center justify-center">
            <p className="text-lg text-slate-400">Video Player Placeholder</p>
          </Card>

          {selectedLesson && (
            <Card>
              <h2 className="text-xl font-semibold text-white">{selectedLesson.title}</h2>
              <p className="mt-2 text-slate-400">Duration: {selectedLesson.duration}</p>
              <Button className="mt-5" onClick={markComplete} loading={completeLessonMutation.isPending}>
                Mark Complete
              </Button>
            </Card>
          )}
        </div>

        <LessonSidebar
          lessons={lessons}
          selectedLesson={selectedLesson}
          setSelectedLesson={setSelectedLesson}
        />
      </div>
    </div>
  );
}