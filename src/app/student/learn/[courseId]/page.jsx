"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/services/course.service";

export default function LearnCourse() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await getCourseById(courseId);

        setCourse(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!course) {
    return <div className="text-red-500">Course not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-slate-900 p-6 rounded-xl">
        <h1 className="text-4xl font-bold">{course.title}</h1>

        <p className="text-slate-400 mt-3">{course.description}</p>
      </div>
      <Link
        href={`/student/quizzes/${course.id}`}
        className="
    inline-block
    mt-4
    bg-orange-600
    px-5
    py-3
    rounded-lg
  "
      >
        Take Quiz
      </Link>
      {/* Modules */}
      {course.modules?.map((module, moduleIndex) => (
        <div
          key={module.id}
          className="
              bg-slate-900
              rounded-xl
              p-6
            "
        >
          <h2 className="text-2xl font-bold mb-4">
            Module {moduleIndex + 1}: {module.title}
          </h2>

          <p className="text-slate-400 mb-6">{module.description}</p>

          {/* Lessons */}
          <div className="space-y-4">
            {module.lessons?.map((lesson, lessonIndex) => (
              <div
                key={lesson.id}
                className="
                      bg-slate-800
                      rounded-lg
                      p-4
                    "
              >
                <h3 className="text-xl font-semibold">
                  Lesson {lessonIndex + 1}: {lesson.title}
                </h3>

                <p className="text-slate-400 mt-2">{lesson.description}</p>

                {/* Contents */}
                <div className="mt-4 space-y-3">
                  {lesson.contents?.map((content) => (
                    <div
                      key={content.id}
                      className="
                              bg-slate-700
                              p-3
                              rounded
                            "
                    >
                      <h4 className="font-semibold">{content.title}</h4>

                      {content.videoUrl && (
                        <a
                          href={content.videoUrl}
                          target="_blank"
                          className="
                                  text-orange-500
                                  block
                                  mt-2
                                "
                        >
                          Watch Video
                        </a>
                      )}

                      {content.fileUrl && (
                        <a
                          href={content.fileUrl}
                          target="_blank"
                          className="
                                  text-blue-400
                                  block
                                  mt-2
                                "
                        >
                          Download File
                        </a>
                      )}

                      {content.externalUrl && (
                        <a
                          href={content.externalUrl}
                          target="_blank"
                          className="
                                  text-green-400
                                  block
                                  mt-2
                                "
                        >
                          Open Link
                        </a>
                      )}

                      {content.htmlContent && (
                        <div className="mt-3 text-slate-300">
                          {content.htmlContent}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
