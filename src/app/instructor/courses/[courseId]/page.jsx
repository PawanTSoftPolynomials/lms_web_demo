"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FaBook, FaLayerGroup } from "react-icons/fa";

import { getCourseById } from "@/services/course.service";
import { getModules, deleteModule } from "@/services/module.service";

import ActionMenu from "@/components/menus/ActionMenu";

export default function CourseDetails() {
  const { courseId } = useParams();

  const router = useRouter();

  const [course, setCourse] = useState(null);

  const [modules, setModules] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseResponse = await getCourseById(courseId);

        setCourse(courseResponse);

        const moduleResponse = await getModules(courseId);

        setModules(moduleResponse);
      } catch (error) {
        console.error(error);
      }
    };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const handleDelete = async (moduleId) => {
    if (!confirm("Delete this module?")) return;

    try {
      await deleteModule(moduleId);

      setModules(modules.filter((module) => module.id !== moduleId));
    } catch (error) {
      console.error(error);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center py-20 text-white">Loading... </div>
    );
  }

  return (
    <div className="space-y-6">
     
      {/* Course Header */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <FaBook className="text-orange-500 text-2xl" />

          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
        </div>

        <p className="text-slate-300 max-w-4xl text-sm mb-4">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-8 mb-4">
          <div>
            <p className="text-slate-500 text-sm">Category</p>

            <p className="text-white font-semibold">{course.category}</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Level</p>

            <p className="text-white font-semibold">{course.level}</p>
          </div>

          <div>
            <p className="text-slate-500 text-sm">Status</p>

            <span className="inline-flex px-3 py-1 rounded-full bg-green-600 text-white text-sm">
              {course.status}
            </span>
          </div>
        </div>

        <Link
          href={`/instructor/modules/create/${courseId}`}
          className="
      inline-flex
      items-center
      bg-orange-600
      hover:bg-orange-700
      px-4
      py-2
      rounded-lg
      text-white
      transition
    "
        >
          Add Module
        </Link>
      </div>
      {/* Modules */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FaLayerGroup className="text-orange-500 text-2xl" />

          <h2 className="text-3xl font-bold text-white">Modules</h2>
        </div>

        {modules.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-10 text-center">
            <p className="text-slate-400">No modules found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {modules.map((module) => (
              <div
                key={module.id}
                className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            flex
            flex-col
            justify-between
            min-h-[220px]
            hover:border-orange-500
            transition
          "
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-semibold text-white">
                      {module.title}
                    </h3>

                    <ActionMenu
                      items={[
                        {
                          label: "Lessons",
                          onClick: () =>
                            router.push(`/instructor/modules/${module.id}`),
                        },
                        {
                          label: "Quizzes",
                          onClick: () =>
                            router.push(`/instructor/quizzes/${course.id}`),
                        },
                        {
                          label: "Edit",
                          onClick: () =>
                            router.push(
                              `/instructor/modules/edit/${module.id}`,
                            ),
                        },
                        {
                          label: "Delete",
                          onClick: () => handleDelete(module.id),
                        },
                      ]}
                    />
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-4">
                    {module.description}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-slate-500 mb-4">
                    Order: {module.order}
                  </p>

                  <div className="flex justify-start">
                    <button
                      onClick={() =>
                        router.push(`/instructor/modules/${module.id}`)
                      }
                      className="
        bg-orange-500
        hover:bg-orange-600
        rounded-lg
        px-6
        py-2.5
        font-medium
        transition
      "
                    >
                      Manage Module
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
