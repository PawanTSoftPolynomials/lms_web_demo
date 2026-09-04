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
          <p className="mt-2 text-muted-foreground">Please try again later.</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={14} />
          Back to Course Details
        </Link>
      )}

      {/* Module Header Card */}
      <div className="rounded-2xl border border-transparent bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <BookOpen size={18} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {module.title}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          {module.description}
        </p>
      </div>

      {/* Lessons Section Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Lessons</h2>
        <p className="mt-1 text-muted-foreground">Manage lessons and contents.</p>
      </div>

      {/* Lessons List - Tabular Flow */}
      {lessons.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <h3 className="text-2xl font-semibold">No Lessons Found</h3>
            <p className="mt-2 text-muted-foreground">Create your first lesson.</p>
          </div>
        </Card>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-transparent/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="border-b border-transparent bg-background/40 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="p-5 pl-6">Lesson Title</th>
                  <th className="p-5 whitespace-nowrap">Type</th>
                  <th className="p-5 pr-6 text-left whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    onClick={() =>
                      router.push(
                        `/instructor/lessons/${lesson.id}`
                      )
                    }
                    className="border-b border-transparent/50 hover:bg-slate-850/40 transition-all duration-200 text-sm text-foreground cursor-pointer group"
                  >
                    {/* Lesson Title & Description */}
                    <td className="p-5 pl-6 max-w-xl">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-normal truncate mt-0.5 max-w-2xl">
                        {lesson.description || "No description provided."}
                      </p>
                    </td>

                    {/* Lesson Type Label */}
                    <td className="p-5">
                      <span className="inline-flex rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-semibold leading-none">
                        Lesson
                      </span>
                    </td>

                    {/* Actions cell */}
                    <td className="p-5 pr-6 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-start gap-1.5 mt-0.5">
                        {/* Manage Topics */}
                        <button
                          onClick={() =>
                            router.push(
                              `/instructor/lessons/${lesson.id}`
                            )
                          }
                          title="Manage Topics"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-primary hover:text-orange-300 hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                        {/* Compose */}
                        <button
                          onClick={() =>
                            router.push(
                              `/instructor/lessons/${lesson.id}`
                            )
                          }
                          title="Manage Topics"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-purple-400 hover:text-purple-300 hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <LayoutGrid size={12} />
                        </button>
                        {/* View */}
                        <button
                          onClick={() =>
                            router.push(
                              `/instructor/lessons/${lesson.id}`
                            )
                          }
                          title="View Lesson"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() =>
                            router.push(
                              `/instructor/lessons/edit/${lesson.id}`
                            )
                          }
                          title="Edit Lesson"
                          className="p-1 rounded-lg border border-transparent bg-slate-955/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition duration-150 flex items-center justify-center w-6.5 h-6.5 cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          title="Delete Lesson"
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