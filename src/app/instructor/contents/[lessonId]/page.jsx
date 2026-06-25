"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getContents,
  deleteContent,
} from "@/services/content.service";

import ActionMenu from "@/components/menus/ActionMenu";
import Loader from "@/components/common/Loader";

export default function LessonContentsPage() {
  const { lessonId } = useParams();

  const router = useRouter();

  const [contents, setContents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (lessonId) {
      loadContents();
    }
  }, [lessonId]);

  const loadContents =
    async () => {
      try {
        const response =
          await getContents(
            lessonId
          );

        setContents(
          response.data ||
            response
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const handleDelete =
    async (contentId) => {
      if (
        !confirm(
          "Delete this content?"
        )
      ) {
        return;
      }

      try {
        await deleteContent(
          contentId
        );

        setContents(
          contents.filter(
            (content) =>
              content.id !==
              contentId
          )
        );
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Contents
          </h1>

          <p className="text-slate-400 mt-2">
            Manage lesson contents.
          </p>
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
            transition
          "
        >
          Add Content
        </Link>
      </div>

      {/* Empty State */}
      {contents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">
            No content found.
          </p>
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
        min-h-[180px]
        hover:border-orange-500
        transition
      "
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {content.title}
            </h2>

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
                  router.push(
                    `/instructor/contents/edit/${content.id}`
                  ),
              },
              {
                label: "Delete",
                onClick: () =>
                  handleDelete(content.id),
              },
            ]}
          />
        </div>

        {content.url && (
          <p className="text-sm text-slate-400 break-all">
            {content.url}
          </p>
        )}
      </div>

      <div className="mt-5">
        <button
          onClick={() =>
            router.push(
              `/instructor/contents/${content.id}`
            )
          }
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
          View Content
        </button>
      </div>
    </div>
  ))}
</div>
      )}
    </div>
  );
}