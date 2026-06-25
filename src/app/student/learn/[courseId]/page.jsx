"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import LearnHeader from "@/components/student/learn/LearnHeader";
import LearnSidebar from "@/components/student/learn/LearnSidebar";
import ContentViewer from "@/components/student/learn/ContentViewer";

import { getCourseById } from "@/services/course.service";

export default function LearnPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await getCourseById(courseId);

      setCourse(response);

      const firstLesson =
        response?.modules?.[0]?.lessons?.[0];

      setActiveLesson(firstLesson);
    } catch (error) {
      console.error("Course loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
        Loading course...
      </div>
    );
  }

  if (!course) {
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