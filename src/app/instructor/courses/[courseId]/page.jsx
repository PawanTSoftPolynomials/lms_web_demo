"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  FaBook,
  FaLayerGroup,
} from "react-icons/fa";

import { getCourseById } from "@/services/course.service";
import {
  getModules,
  deleteModule,
} from "@/services/module.service";

import ActionMenu from "@/components/menus/ActionMenu";

export default function CourseDetails() {
  const { courseId } = useParams();

  const router = useRouter();

  const [course, setCourse] =
    useState(null);

  const [modules, setModules] =
    useState([]);

  useEffect(() => {
    const loadData =
      async () => {
        try {
          const courseResponse =
            await getCourseById(
              courseId
            );

          setCourse(
            courseResponse
          );

          const moduleResponse =
            await getModules(
              courseId
            );

          setModules(
            moduleResponse
          );
        } catch (error) {
          console.error(error);
        }
      };

    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const handleDelete =
    async (moduleId) => {
      if (
        !confirm(
          "Delete this module?"
        )
      )
        return;

      try {
        await deleteModule(
          moduleId
        );

        setModules(
          modules.filter(
            (module) =>
              module.id !==
              moduleId
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  if (!course) {
    return (
      <div className="flex justify-center py-20 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">
              {course.title}
            </h1>

            <p className="text-slate-300 max-w-3xl mb-6">
              {course.description}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-slate-500 text-sm">
                  Category
                </p>

                <p className="text-white font-semibold">
                  {course.category}
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-sm">
                  Level
                </p>

                <p className="text-white font-semibold">
                  {course.level}
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-sm">
                  Status
                </p>

                <span className="inline-flex px-3 py-1 rounded-full bg-green-600 text-white text-sm">
                  {course.status}
                </span>
              </div>
            </div>
          </div>

          <div className="text-orange-500 text-5xl">
            <FaBook />
          </div>
        </div>

        <Link
          href={`/instructor/modules/create/${courseId}`}
          className="
            inline-flex
            items-center
            gap-2
            mt-8
            bg-orange-600
            hover:bg-orange-700
            px-6
            py-3
            rounded-xl
            text-white
            transition
          "
        >
          Add Module
        </Link>
      </div>

      {/* Modules */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <FaLayerGroup className="text-orange-500 text-2xl" />

          <h2 className="text-3xl font-bold text-white">
            Modules
          </h2>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400">
              No modules found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map(
              (module) => (
                <div
                  key={module.id}
                  className="
                    bg-slate-800
                    rounded-xl
                    p-5
                    flex
                    justify-between
                    items-center
                    hover:bg-slate-700
                    transition
                  "
                >
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {module.title}
                    </h3>

                    <p className="text-slate-400 mt-2">
                      {
                        module.description
                      }
                    </p>

                    <p className="text-sm text-slate-500 mt-3">
                      Order:
                      {" "}
                      {module.order}
                    </p>
                  </div>

                  <ActionMenu
                    items={[
                      {
                        label:
                          "Lessons",
                        onClick:
                          () =>
                            router.push(
                              `/instructor/modules/${module.id}`
                            ),
                      },
                      {
                        label:
                          "Quizzes",
                        onClick:
                          () =>
                            router.push(
                              `/instructor/quizzes/${course.id}`
                            ),
                      },
                      {
                        label:
                          "Edit",
                        onClick:
                          () =>
                            router.push(
                              `/instructor/modules/edit/${module.id}`
                            ),
                      },
                      {
                        label:
                          "Delete",
                        onClick:
                          () =>
                            handleDelete(
                              module.id
                            ),
                      },
                    ]}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}