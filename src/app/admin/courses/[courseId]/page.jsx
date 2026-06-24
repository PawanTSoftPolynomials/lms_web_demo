"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
} from "@/services/course.service";

export default function AdminCoursePage() {
  const { courseId } = useParams();

  const [activeTab, setActiveTab] =
    useState("overview");

  const [course, setCourse] =
    useState(null);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      level: "",
    });

  useEffect(() => {
    const loadCourse =
      async () => {
        try {
          const data =
            await getCourseById(
              courseId
            );

          setCourse(data);

          setFormData({
            title:
              data.title || "",
            description:
              data.description ||
              "",
            category:
              data.category ||
              "",
            level:
              data.level || "",
          });
        } catch (error) {
          console.error(error);
        }
      };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleChange = (
    e
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const refreshCourse =
    async () => {
      const updated =
        await getCourseById(
          courseId
        );

      setCourse(updated);
    };

  const handleSave =
    async () => {
      try {
        await updateCourse(
          courseId,
          formData
        );

        await refreshCourse();

        alert(
          "Course updated successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to update course"
        );
      }
    };

  const handlePublish =
    async () => {
      try {
        await updateCourseStatus(
          courseId,
          "PUBLISHED"
        );

        await refreshCourse();

        alert(
          "Course published"
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleArchive =
    async () => {
      try {
        await updateCourseStatus(
          courseId,
          "ARCHIVED"
        );

        await refreshCourse();

        alert(
          "Course archived"
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async () => {
      const confirmed =
        window.confirm(
          "Delete this course?"
        );

      if (!confirmed)
        return;

      try {
        await deleteCourse(
          courseId
        );

        alert(
          "Course deleted"
        );

        window.location.href =
          "/admin/courses";
      } catch (error) {
        console.error(error);
      }
    };

  if (!course) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  const lessonCount =
    course.modules?.reduce(
      (total, module) =>
        total +
        (module.lessons?.length ||
          0),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-xl p-6">
        <h1 className="text-3xl font-bold">
          {course.title}
        </h1>

        <div className="flex flex-wrap gap-2 mt-3 text-sm text-slate-400">
          <span>
            {course.category}
          </span>

          <span>•</span>

          <span>
            {course.level}
          </span>

          <span>•</span>

          <span>
            {course.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 rounded-xl p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() =>
            setActiveTab(
              "overview"
            )
          }
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab ===
            "overview"
              ? "bg-orange-600"
              : "hover:bg-slate-800"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "modules"
            )
          }
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab ===
            "modules"
              ? "bg-orange-600"
              : "hover:bg-slate-800"
          }`}
        >
          Modules
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "lessons"
            )
          }
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab ===
            "lessons"
              ? "bg-orange-600"
              : "hover:bg-slate-800"
          }`}
        >
          Lessons
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "settings"
            )
          }
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            activeTab ===
            "settings"
              ? "bg-orange-600"
              : "hover:bg-slate-800"
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-900 rounded-xl p-6">

        {activeTab ===
          "overview" && (
          <div className="space-y-6">

            <div className="grid md:grid-cols-4 gap-4">

              <div className="bg-slate-800 rounded-xl p-6">
                <p className="text-slate-400">
                  Modules
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {course.modules
                    ?.length ||
                    0}
                </h2>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <p className="text-slate-400">
                  Lessons
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {
                    lessonCount
                  }
                </h2>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <p className="text-slate-400">
                  Quizzes
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {course
                    .quizzes
                    ?.length ||
                    0}
                </h2>
              </div>

              <div className="bg-slate-800 rounded-xl p-6">
                <p className="text-slate-400">
                  Status
                </p>

                <h2 className="text-xl font-bold mt-2">
                  {
                    course.status
                  }
                </h2>
              </div>

            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">
                Description
              </h3>

              <p>
                {
                  course.description
                }
              </p>
            </div>

          </div>
        )}

        {activeTab ===
          "modules" && (
          <div className="space-y-6">

            <h2 className="text-2xl font-semibold">
              Course Structure
            </h2>

            {course.modules?.map(
              (module) => (
                <div
                  key={
                    module.id
                  }
                  className="bg-slate-800 rounded-xl p-5"
                >
                  <h3 className="text-lg font-semibold">
                    {
                      module.title
                    }
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    {
                      module.description
                    }
                  </p>

                  <div className="mt-5 space-y-3">

                    {module.lessons?.map(
                      (
                        lesson
                      ) => (
                        <div
                          key={
                            lesson.id
                          }
                          className="bg-slate-700 rounded-lg p-4"
                        >
                          <h4 className="font-medium">
                            {
                              lesson.title
                            }
                          </h4>

                          <p className="text-slate-400 text-sm mt-1">
                            {
                              lesson.description
                            }
                          </p>

                          <div className="mt-3 space-y-2">

                            {lesson.contents?.map(
                              (
                                content
                              ) => (
                                <div
                                  key={
                                    content.id
                                  }
                                  className="bg-slate-900 px-3 py-2 rounded text-sm"
                                >
                                  {
                                    content.type
                                  }{" "}
                                  •{" "}
                                  {
                                    content.title
                                  }
                                </div>
                              )
                            )}

                          </div>
                        </div>
                      )
                    )}

                  </div>
                </div>
              )
            )}

          </div>
        )}

        {activeTab ===
          "lessons" && (
          <div className="space-y-4">

            <h2 className="text-2xl font-semibold">
              Lessons
            </h2>

            {course.modules?.flatMap(
              (
                module
              ) =>
                module.lessons?.map(
                  (
                    lesson
                  ) => (
                    <div
                      key={
                        lesson.id
                      }
                      className="bg-slate-800 rounded-xl p-4"
                    >
                      <h3 className="font-semibold">
                        {
                          lesson.title
                        }
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        {
                          lesson.description
                        }
                      </p>

                      <p className="text-xs text-orange-400 mt-2">
                        Module:{" "}
                        {
                          module.title
                        }
                      </p>
                    </div>
                  )
                )
            )}

          </div>
        )}

        {activeTab ===
          "settings" && (
          <div className="space-y-4 max-w-2xl">

            <div>
              <label className="block mb-2">
                Course Title
              </label>

              <input
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                className="w-full bg-slate-800 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2">
                Description
              </label>

              <textarea
                rows={5}
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="w-full bg-slate-800 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2">
                Category
              </label>

              <input
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                className="w-full bg-slate-800 rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2">
                Level
              </label>

              <input
                name="level"
                value={
                  formData.level
                }
                onChange={
                  handleChange
                }
                className="w-full bg-slate-800 rounded-lg p-3"
              />
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={
                  handleSave
                }
                className="bg-green-600 px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>

              <button
                onClick={
                  handlePublish
                }
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                Publish
              </button>

              <button
                onClick={
                  handleArchive
                }
                className="bg-yellow-600 px-4 py-2 rounded-lg"
              >
                Archive
              </button>

              <button
                onClick={
                  handleDelete
                }
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                Delete Course
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}