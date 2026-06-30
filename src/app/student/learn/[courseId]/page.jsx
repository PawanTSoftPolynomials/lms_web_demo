"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import api from "@/lib/axios";
import LessonSidebar from "@/components/students/LessonSidebar";

export default function LearnPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] =
    useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(
          `/courses/${courseId}`
        );

        const courseData =
          response.data.data || response.data;

        setCourse(courseData);

        const flatLessons =
          courseData.modules.flatMap((module) =>
            module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description:
                lesson.description,
              duration: "N/A",
            }))
          );

        setLessons(flatLessons);

        if (flatLessons.length > 0) {
          setSelectedLesson(flatLessons[0]);
        }
      } catch (error) {
        console.error(
          "Course fetch failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const markComplete = async () => {
    try {
      await api.patch("/progress/complete", {
        lessonId: selectedLesson.id,
      });

      alert("Lesson marked complete");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="text-white">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-white">
        Course not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {course.title}
        </h1>

        <p className="text-gray-400 mt-2">
          {course.description}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-xl h-96 flex items-center justify-center">
            <p className="text-gray-400 text-lg">
              Video Player Placeholder
            </p>
          </div>

          {selectedLesson && (
            <div className="bg-slate-900 rounded-xl p-5">
              <h2 className="text-xl font-bold">
                {selectedLesson.title}
              </h2>

              <p className="text-gray-400 mt-2">
                Duration:{" "}
                {selectedLesson.duration}
              </p>

              <button
                onClick={markComplete}
                className="mt-5 bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-lg"
              >
                Mark Complete
              </button>
            </div>
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