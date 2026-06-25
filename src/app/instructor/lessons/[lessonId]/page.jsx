"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getLessonById, deleteLesson } from "@/services/lesson.service";

import { getContents } from "@/services/content.service";

import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";

export default function LessonDetailsPage() {
  const { lessonId } = useParams();

  const router = useRouter();

  const [lesson, setLesson] = useState(null);

  const [contents, setContents] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lessonResponse = await getLessonById(lessonId);

        setLesson(lessonResponse);

        const contentResponse = await getContents(lessonId);

        setContents(contentResponse);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadData();
    }
  }, [lessonId]);

  const handleDelete = async () => {
    if (!confirm("Delete this lesson?")) {
      return;
    }

    try {
      await deleteLesson(lessonId);

      router.back();
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
      {/* Lesson Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {lesson.title}
            </h1>

            <p className="text-slate-400">{lesson.description}</p>
          </div>

          <ActionMenu
            items={[
              {
                label: "Edit",
                onClick: () =>
                  router.push(`/instructor/lessons/edit/${lesson.id}`),
              },
              {
                label: "Delete",
                onClick: handleDelete,
              },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Contents</h2>

          <p className="text-slate-400">Manage lesson contents.</p>
        </div>

        <Link
          href={`/instructor/contents/create/${lessonId}`}
          className="
            bg-orange-600
            hover:bg-orange-700
            px-5
            py-3
            rounded-xl
            text-white
          "
        >
          Add Content
        </Link>
      </div>
      {/* Content List */}
      {contents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <h3 className="text-xl text-white mb-2">No Contents Found</h3>

          <p className="text-slate-400">Add your first content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {contents.map((content) => (
            <div
              key={content.id}
              className="
    bg-slate-900
    border
    border-slate-800
    rounded-2xl
    p-5
    flex
    flex-col
    justify-between
    min-h-[120px]
    hover:border-orange-500
    transition
  "
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {content.title}
                  </h3>

                  <span
                    className="
          inline-block
          mt-2
          px-3
          py-1
          rounded-full
          text-sm
          bg-orange-500/20
          text-orange-400
        "
                  >
                    {content.type}
                  </span>
                </div>

                <ActionMenu
                  items={[
                    {
                      label: "Edit",
                      onClick: () =>
                        router.push(`/instructor/contents/edit/${content.id}`),
                    },
                    {
                      label: "Delete",
                      onClick: () => console.log("Delete content"),
                    },
                  ]}
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/instructor/contents/${content.id}`);
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
      )}
    </div>
  );
}
