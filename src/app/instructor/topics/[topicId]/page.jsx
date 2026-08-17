"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Pencil,
  Trash2,
  Eye,
  ArrowLeft,
  Table2,
  LayoutGrid,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import TopicHeader from "@/components/instructor/topics/TopicHeader";
import { LessonComposerPanel } from "@/components/instructor/LessonComposer/LessonComposerPanel";

import { useTopic } from "@/hooks/queries/instructor/useTopic";
import { useLesson } from "@/hooks/queries/instructor/useLesson";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useUpdateTopic } from "@/hooks/queries/instructor/useUpdateTopic";

export default function TopicDetailsPage() {
  const params = useParams();
  const topicId = params.topicId;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Existing table view stays the default/unchanged; Compose is the
  // cell-based Lesson Composer view, added alongside it rather than
  // replacing it. Landing here with ?view=compose (from the "Compose"
  // action on the Lesson's topic list) opens directly into it.
  const [view, setView] = useState(
    searchParams.get("view") === "compose" ? "compose" : "table"
  );

  // Fetch topic details
  const {
    data: topic,
    isLoading: topicLoading,
    isError: topicError,
  } = useTopic(topicId);

  // Fetch parent lesson for breadcrumb
  const { data: lesson } = useLesson(topic?.lessonId, { enabled: !!topic?.lessonId });

  const lessonId = params.lessonId || topic?.lessonId;

  // Fetch contents inside this topic
  const {
    data: contents = [],
    isLoading: contentLoading,
    isError: contentError,
  } = useContents(topicId);

  const deleteContentMutation = useDeleteContent();
  const updateTopicMutation = useUpdateTopic();

  const handleTogglePublish = async () => {
    try {
      await updateTopicMutation.mutateAsync({
        topicId,
        topicData: {
          lessonId: topic.lessonId,
          isPublished: !topic.isPublished,
        },
      });
    } catch (error) {
      console.error("Failed to update topic publish status:", error);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm("Delete this content?")) return;

    try {
      await deleteContentMutation.mutateAsync({
        contentId,
        topicId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (topicLoading || contentLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (topicError || contentError || !topic) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Failed to load topic</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {lessonId && (
        <Link
          href={`/instructor/lessons/${lessonId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Back to Lesson Details
        </Link>
      )}

      {/* Topic Header Stats Card */}
      <TopicHeader
        topic={topic}
        onTogglePublish={handleTogglePublish}
        isToggling={updateTopicMutation.isPending}
      />

      {/* Contents Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Contents</h2>
          <p className="mt-1 text-slate-400">Manage topic contents.</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              view === "table"
                ? "bg-orange-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Table2 size={13} />
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("compose")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              view === "compose"
                ? "bg-orange-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid size={13} />
            Compose
          </button>
        </div>
      </div>

      {view === "compose" && <LessonComposerPanel topicId={topicId} />}

      {/* Contents List - Tabular Flow */}
      {view === "table" && (!contents.length ? (
        <Card>
          <div className="py-16 text-center">
            <h3 className="text-2xl font-semibold">No Contents Found</h3>
            <p className="mt-2 text-slate-400">Add your first content.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5 pl-6">Content Title</th>
                  <th className="p-5">Type</th>
                  <th className="p-5 pr-6 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => {
                  const type = content.type || "VIDEO";
                  return (
                    <tr
                      key={content.id}
                      onClick={() =>
                        router.push(`/instructor/contents/view/${content.id}`)
                      }
                      className="border-b border-slate-800/50 hover:bg-slate-850/40 transition-all duration-200 text-sm text-slate-300 cursor-pointer group"
                    >
                      {/* Content Title */}
                      <td className="p-5 pl-6 max-w-xl">
                        <p className="font-bold text-white group-hover:text-orange-400 transition-colors leading-snug truncate">
                          {content.title}
                        </p>
                      </td>

                      {/* Content Type Badge */}
                      <td className="p-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-none border ${
                            type === "VIDEO"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : type === "DOCUMENT"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          }`}
                        >
                          {type}
                        </span>
                      </td>

                      {/* Actions cell */}
                      <td className="p-5 pr-6 text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-start gap-1.5 mt-0.5">
                          {/* View */}
                          <button
                            onClick={() => router.push(`/instructor/contents/view/${content.id}`)}
                            title="View Content"
                            className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                          >
                            <Eye size={12} />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => router.push(`/instructor/contents/edit/${content.id}`)}
                            title="Edit Content"
                            className="p-1 rounded-lg border border-slate-800 bg-slate-955/40 text-slate-400 hover:text-white hover:bg-slate-800/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                          >
                            <Pencil size={12} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            title="Delete Content"
                            className="p-1 rounded-lg border border-red-500/30 bg-slate-955/40 text-red-400 hover:text-red-300 hover:bg-red-955/20 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
