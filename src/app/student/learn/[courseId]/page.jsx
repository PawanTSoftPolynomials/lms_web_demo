"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import LearnHeader from "@/components/students/learn/LearnHeader";
import LearnSidebar from "@/components/students/learn/LearnSidebar";
import ContentViewer from "@/components/students/learn/ContentViewer";

import useCourse from "@/hooks/queries/students/useCourse";

export default function LearnPage() {
  const { courseId } = useParams();

  const [activeLesson, setActiveLesson] = useState(null);

  const {
    data: course,
    isLoading,
    error,
  } = useCourse(courseId);

  useEffect(() => {
    if (!course) return;

    setActiveLesson(
      course.modules?.[0]?.lessons?.[0] ?? null
    );
  }, [course]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-red-400">
        Course not found.
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">
      <LearnSidebar
        course={course}
        activeLesson={activeLesson}
        setActiveLesson={setActiveLesson}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <LearnHeader
          course={course}
          activeLesson={activeLesson}
        />

        <ContentViewer
          lesson={activeLesson}
        />
      </div>
    </div>
  );
}