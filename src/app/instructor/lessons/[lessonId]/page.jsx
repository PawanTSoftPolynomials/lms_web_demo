"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import LessonHeader from "@/components/instructor/lessons/LessonHeader";

import { useLesson } from "@/hooks/queries/instructor/useLesson";
import { useModule } from "@/hooks/queries/instructor/useModule";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";

export default function LessonDetailsPage() {
  const params = useParams();
  const lessonId = params.lessonId;
  const router = useRouter();

  // Fetch lesson details
  const {
    data: lesson,
    isLoading: lessonLoading,
    isError: lessonError,
  } = useLesson(lessonId);

  // Fetch parent module for course configuration
  const { data: moduleData } = useModule(lesson?.moduleId, { enabled: !!lesson?.moduleId });

  const moduleId = params.moduleId || lesson?.moduleId;
  const courseId = params.courseId || moduleData?.courseId;

  // Fetch contents inside this lesson
  const {
    data: contents = [],
    isLoading: contentLoading,
    isError: contentError,
  } = useContents(lessonId);

  const deleteContentMutation = useDeleteContent();

  const handleDeleteContent = async (contentId) => {
    if (!confirm("Delete this content?")) return;

    try {
      await deleteContentMutation.mutateAsync({
        contentId,
        lessonId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (lessonLoading || contentLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (lessonError || contentError || !lesson) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Failed to load lesson</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {courseId && moduleId && (
        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Back to Module Details
        </Link>
      )}

      {/* Lesson Header Stats Card */}
      <LessonHeader lesson={lesson} courseId={courseId} moduleId={moduleId} />

      {/* Contents Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Contents</h2>
          <p className="mt-1 text-slate-400">Manage lesson contents.</p>
        </div>

        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/create`}
        >
          <button className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95">
            <Plus size={16} />
            <span>Add Content</span>
          </button>
        </Link>
      </div>

      {/* Contents List - Tabular Flow */}
      {!contents.length ? (
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
                  <th className="p-5 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => {
                  const type = content.type || "VIDEO";
                  return (
                    <tr
                      key={content.id}
                      onClick={() =>
                        router.push(
                          `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${content.id}`
                        )
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
                      <td className="p-5 pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {/* View */}
                          <Link
                            href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${content.id}`}
                          >
                            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="View Content">
                              <Eye size={14} />
                            </button>
                          </Link>
                          {/* Edit */}
                          <Link
                            href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/edit/${content.id}`}
                          >
                            <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Edit Content">
                              <Edit size={14} />
                            </button>
                          </Link>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            className="p-2.5 rounded-lg border border-slate-855 bg-slate-900/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                            title="Delete Content"
                          >
                            <Trash2 size={14} />
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
      )}
    </div>
  );
}