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
      {lessons.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">No lessons found.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
      p-6
      flex
      justify-between
      items-center
      hover:border-orange-500
      hover:bg-slate-900/80
      cursor-pointer
      transition
    "
  >
    <div className="space-y-3">
      <h3 className="text-2xl font-semibold text-white">
        {lesson.title}
      </h3>

      <p className="text-slate-400">
        {lesson.description}
      </p>

      <div className="flex gap-3">
        <span className="px-3 py-1 text-sm rounded-full bg-slate-800 text-slate-300">
          Lesson
        </span>

        <span className="px-3 py-1 text-sm rounded-full bg-orange-500/20 text-orange-400">
          View Details
        </span>
      </div>
    </div>

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
))}
        </div>
      )}
    </div>
  );
}
