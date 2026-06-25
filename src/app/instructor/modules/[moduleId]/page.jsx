"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getModuleById } from "@/services/module.service";

import { getLessons, deleteLesson } from "@/services/lesson.service";

import ActionMenu from "@/components/menus/ActionMenu";
import Loader from "@/components/common/Loader";

export default function ModuleDetailsPage() {
  const { moduleId } = useParams();

  const router = useRouter();

  const [module, setModule] = useState(null);

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const moduleResponse = await getModuleById(moduleId);

        setModule(moduleResponse);

        const lessonResponse = await getLessons(moduleId);

        setLessons(lessonResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      loadData();
    }
  }, [moduleId]);

  const handleDelete = async (lessonId) => {
    if (!confirm("Delete this lesson?")) {
      return;
    }

    try {
      await deleteLesson(lessonId);

      setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-4">{module.title}</h1>

        <p className="text-slate-400 text-lg">{module.description}</p>
      </div>

      {/* Lessons Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Lessons</h2>

          <p className="text-slate-400 mt-1">Manage lessons and contents.</p>
        </div>

        <Link
          href={`/instructor/lessons/create/${moduleId}`}
          className="
            bg-orange-600
            hover:bg-orange-700
            px-5
            py-3
            rounded-xl
            text-white
            transition
          "
        >
          Add Lesson
        </Link>
      </div>

      {/* Empty State */}
     
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    {lessons.map((lesson) => (
      <div
        key={lesson.id}
        onClick={() =>
          router.push(
            `/instructor/lessons/${lesson.id}`
          )
        }
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-5
          flex
          flex-col
          justify-between
          min-h-[180px]
          hover:border-orange-500
          transition
          cursor-pointer
        "
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-semibold text-white">
              {lesson.title}
            </h3>

            <div
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <ActionMenu
                items={[
                  {
                    label: "View",
                    onClick: () =>
                      router.push(
                        `/instructor/lessons/${lesson.id}`
                      ),
                  },
                  {
                    label: "Edit",
                    onClick: () =>
                      router.push(
                        `/instructor/lessons/edit/${lesson.id}`
                      ),
                  },
                  {
                    label: "Delete",
                    onClick: () =>
                      handleDelete(
                        lesson.id
                      ),
                  },
                ]}
              />
            </div>
          </div>

          <p className="text-slate-400 text-sm line-clamp-3">
            {lesson.description}
          </p>
        </div>

        <div className="mt-5 flex justify-between items-center">
          <span
            className="
              px-3
              py-1
              rounded-full
              text-sm
              bg-orange-500/20
              text-orange-400
            "
          >
            Lesson
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/instructor/lessons/${lesson.id}`
              );
            }}
            className="
              bg-orange-500
              hover:bg-orange-600
              px-4
              py-2
              rounded-lg
              text-sm
              transition
            "
          >
            View
          </button>
        </div>
      </div>
    ))}
  </div>

    </div>
  );
}
