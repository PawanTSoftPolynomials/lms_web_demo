"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  BookOpen
} from "lucide-react";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import { useModule } from "@/hooks/queries/instructor/useModule";
import { useLessons } from "@/hooks/queries/instructor/useLessons";
import { useDeleteLesson } from "@/hooks/queries/instructor/useDeleteLesson";

export default function ModuleDetailsPage() {
  const params = useParams();
  const moduleId = params.moduleId;
  const router = useRouter();

  // Fetch module detail info
  const {
    data: module,
    isLoading: moduleLoading,
    isError: moduleError,
  } = useModule(moduleId);

  const courseId = params.courseId || module?.courseId;

  // Fetch lessons inside this module
  const {
    data: lessons = [],
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useLessons(moduleId);

  const deleteLessonMutation = useDeleteLesson();

  const handleDelete = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      await deleteLessonMutation.mutateAsync({
        lessonId,
        moduleId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (moduleLoading || lessonsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (moduleError || lessonsError || !module) {
    return (
      <Card>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold">Failed to load module</h2>
          <p className="mt-2 text-slate-400">Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      {courseId && (
        <Link
          href={`/instructor/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Back to Course Details
        </Link>
      )}

      {/* Module Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
            <BookOpen size={18} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {module.title}
          </h1>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
          {module.description}
        </p>
      </div>

      {/* Lessons Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Lessons</h2>
          <p className="mt-1 text-slate-400">Manage lessons and contents.</p>
        </div>

        <Link
          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/create`}
        >
          <button className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-sm px-6 py-3.5 transition shadow-lg shadow-orange-500/10 active:scale-95">
            <Plus size={16} />
            <span>Add Lesson</span>
          </button>
        </Link>
      </div>

      {/* Lessons List - Tabular Flow */}
      {lessons.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <h3 className="text-2xl font-semibold">No Lessons Found</h3>
            <p className="mt-2 text-slate-400">Create your first lesson.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-5 pl-6">Lesson Title</th>
                  <th className="p-5">Type</th>
                  <th className="p-5 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    onClick={() =>
                      router.push(
                        `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`
                      )
                    }
                    className="border-b border-slate-800/50 hover:bg-slate-850/40 transition-all duration-200 text-sm text-slate-300 cursor-pointer group"
                  >
                    {/* Lesson Title & Description */}
                    <td className="p-5 pl-6 max-w-xl">
                      <p className="font-bold text-white group-hover:text-orange-400 transition-colors leading-snug truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-normal truncate mt-0.5 max-w-2xl">
                        {lesson.description || "No description provided."}
                      </p>
                    </td>

                    {/* Lesson Type Label */}
                    <td className="p-5">
                      <span className="inline-flex rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 text-xs font-semibold leading-none">
                        Lesson
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="p-5 pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}
                        <Link
                          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                        >
                          <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="View Lesson">
                            <Eye size={14} />
                          </button>
                        </Link>
                        {/* Edit */}
                        <Link
                          href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/edit/${lesson.id}`}
                        >
                          <button className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Edit Lesson">
                            <Edit size={14} />
                          </button>
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2.5 rounded-lg border border-slate-855 bg-slate-900/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                          title="Delete Lesson"
                        >
                          <Trash2 size={14} />
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