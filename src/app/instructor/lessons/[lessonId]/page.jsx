"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowLeft,
  BookOpen,
  LayoutGrid
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import { useLesson } from "@/hooks/queries/instructor/useLesson";
import { useModule } from "@/hooks/queries/instructor/useModule";
import { useTopics } from "@/hooks/queries/instructor/useTopics";
import { useDeleteTopic } from "@/hooks/queries/instructor/useDeleteTopic";

export default function LessonDetailsPage() {
  const params = useParams();
  const lessonId = params.lessonId;
  const router = useRouter();

  // Fetch lesson detail info
  const {
    data: lesson,
    isLoading: lessonLoading,
    isError: lessonError,
  } = useLesson(lessonId);

  const moduleId = params.moduleId || lesson?.moduleId;

  // Fetch parent module for course configuration
  const { data: moduleData } = useModule(moduleId, { enabled: !!moduleId });

  const courseId = params.courseId || moduleData?.courseId;

  // Fetch topics inside this lesson
  const {
    data: topics = [],
    isLoading: topicsLoading,
    isError: topicsError,
  } = useTopics(lessonId);

  const deleteTopicMutation = useDeleteTopic();

  const handleDelete = async (topicId) => {
    if (!confirm("Delete this topic?")) return;

    try {
      await deleteTopicMutation.mutateAsync({
        topicId,
        lessonId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (lessonLoading || topicsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (lessonError || topicsError || !lesson) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Failed to load lesson</h2>
          <p className="mt-2 text-muted-foreground">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {courseId && moduleId && (
        <Link
          href={`/instructor/modules/${moduleId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={14} />
          Back to Module Details
        </Link>
      )}

      {/* Lesson Header Card */}
      <div className="rounded-2xl border border-transparent bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <BookOpen size={18} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {lesson.title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          {lesson.description}
        </p>
      </div>

      {/* Topics Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Topics</h2>
          <p className="mt-1 text-muted-foreground">Manage topics and contents.</p>
        </div>

        <Link
          href={`/instructor/topics/create/${lessonId}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-orange-600 text-slate-950 font-black text-xs px-4 py-2.5 transition shadow-sm"
        >
          <Plus size={14} className="stroke-[3]" />
          New Topic
        </Link>
      </div>

      {/* Topics List - Tabular Flow */}
      {topics.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <h3 className="text-2xl font-semibold">No Topics Found</h3>
            <p className="mt-2 text-muted-foreground">Create your first topic.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-transparent/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="border-b border-transparent bg-background/40 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="p-5 pl-6">Topic Title</th>
                  <th className="p-5 whitespace-nowrap">Type</th>
                  <th className="p-5 pr-6 text-left whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic) => (
                  <tr
                    key={topic.id}
                    onClick={() =>
                      router.push(`/instructor/topics/${topic.id}`)
                    }
                    className="border-b border-transparent/50 hover:bg-slate-850/40 transition-all duration-200 text-sm text-foreground cursor-pointer group"
                  >
                    {/* Topic Title & Description */}
                    <td className="p-5 pl-6 max-w-xl">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                        {topic.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-normal truncate mt-0.5 max-w-2xl">
                        {topic.description || "No description provided."}
                      </p>
                    </td>

                    {/* Topic Type Label */}
                    <td className="p-5">
                      <span className="inline-flex rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-semibold leading-none">
                        Topic
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="p-5 pr-6 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-start gap-1.5 mt-0.5">
                        {/* Add Content */}
                        <button
                          onClick={() =>
                            router.push(`/instructor/contents/create/${topic.id}`)
                          }
                          title="Add Content"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-primary hover:text-orange-300 hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                        {/* Compose */}
                        <button
                          onClick={() =>
                            router.push(`/instructor/topics/${topic.id}?view=compose`)
                          }
                          title="Open Composer"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-purple-400 hover:text-purple-300 hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <LayoutGrid size={12} />
                        </button>
                        {/* View */}
                        <button
                          onClick={() =>
                            router.push(`/instructor/topics/${topic.id}`)
                          }
                          title="View Topic"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() =>
                            router.push(`/instructor/topics/edit/${topic.id}`)
                          }
                          title="Edit Topic"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(topic.id)}
                          title="Delete Topic"
                          className="p-1 rounded-lg border border-red-500/30 bg-slate-955/40 text-red-400 hover:text-red-300 hover:bg-red-955/20 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
