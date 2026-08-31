"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, Users, Pencil, ArrowUpRight, Loader2 } from "lucide-react";

import ActionMenu from "@/components/menus/ActionMenu";
import { useConfirm } from "@/context/ConfirmContext";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { exportCourse } from "@/services/course.service";
import { getDisplayUrl } from "@/lib/blob";

const STATUS_STYLE = {
  PUBLISHED: { label: "Published", dot: "bg-emerald-400" },
  DRAFT: { label: "Draft", dot: "bg-amber-400" },
  ARCHIVED: { label: "Archived", dot: "bg-rose-400" },
};

const LEVEL_STYLE = {
  Beginner: "bg-primary/10 text-primary border-primary/20",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  Advanced: "bg-primary/20 text-primary border-primary/40",
};

/** My Courses grid card — banner, meta row, tag pills, edit/view actions, and a
 *  kebab menu for export/delete. */
export default function CourseGridCard({ course }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [exporting, setExporting] = useState(false);

  const deleteCourseMutation = useDeleteCourse();

  const statusStyle = STATUS_STYLE[course.status] || STATUS_STYLE.DRAFT;
  const studentsCount = course._count?.enrollments ?? 0;

  const goTo = (path) => (e) => {
    e.stopPropagation();
    router.push(path);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await exportCourse(course.id);
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = `course-${course.id}.zip`;
      const cd = res.headers["content-disposition"];
      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert(err?.response?.data?.message || err?.message || "Failed to export course ZIP.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Course",
      message: `Are you sure you want to delete "${course.title}"? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    try {
      await deleteCourseMutation.mutateAsync(course.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const menuItems = [
    { label: exporting ? "Exporting…" : "Export ZIP", onClick: handleExport },
    { label: "Delete Course", onClick: handleDelete },
  ];
  const updatedTime = course.updatedAt
    ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })
    : null;

  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className="group relative flex w-[85%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-full md:shrink-0 flex-col overflow-hidden rounded-2xl bg-white border border-[#E5E5E5] dark:bg-[#0F172A] dark:border-[#1E293B] p-3 md:p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-200 hover:shadow-md dark:hover:border-slate-700 hover:-translate-y-1 cursor-pointer h-full"
    >
      {/* Course Thumbnail (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 mb-2.5">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getDisplayUrl(course.thumbnailUrl)}
            alt={course.title || "Course thumbnail"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
            <BookOpen size={32} className="text-slate-400 dark:text-slate-700" />
          </div>
        )}

        {/* Status Badge (Top-Left, High Contrast, Compact Rounded Square) */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md bg-white border border-[#D9D9D9] dark:bg-[#1E293B] dark:border-slate-700 px-2 py-0.5 text-[11px] font-bold text-[#111827] dark:text-slate-100 shadow-sm">
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>

        {/* Three-Dot Menu (Top-Right, Compact Rounded Square, High Contrast Button) */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white border border-[#D9D9D9] dark:bg-[#1E293B] dark:border-slate-700 rounded-md shadow-sm text-[#111827] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center p-0.5">
            <ActionMenu items={menuItems} />
          </div>
        </div>
      </div>

      {/* Course Info Body */}
      <div className="flex flex-1 flex-col">
        {/* Title (1-2 lines) */}
        <h3 className="text-[#111827] dark:text-[#F8FAFC] text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-primary dark:group-hover:text-white transition-colors">
          {course.title}
        </h3>

        {/* Description (1-2 lines) */}
        {course.description ? (
          <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed line-clamp-2 mb-2 font-normal">
            {course.description}
          </p>
        ) : null}

        {/* Metadata Row */}
        <div className="flex items-center gap-3 text-[11px] text-[#4B5563] dark:text-[#94A3B8] font-medium mb-2.5">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-[#6B7280] dark:text-slate-500 shrink-0" />
            <span>{studentsCount} {studentsCount === 1 ? "Student" : "Students"}</span>
          </span>
          {updatedTime && (
            <span className="flex items-center gap-1 truncate">
              <Clock size={12} className="text-[#6B7280] dark:text-slate-500 shrink-0" />
              <span className="truncate">Updated {updatedTime}</span>
            </span>
          )}
        </div>

        {/* Tag Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {course.category && (
            <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {course.category}
            </span>
          )}
          {course.level && (
            <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {course.level}
            </span>
          )}
          {!course.category && !course.level && (
            <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              General
            </span>
          )}
        </div>

        {/* Action Buttons (Strictly Single Line View Course) */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            onClick={goTo(`/instructor/courses/edit/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white hover:bg-slate-50 border border-[#D9D9D9] text-[#111827] font-bold dark:bg-[#1E293B] dark:hover:bg-slate-700 dark:border-slate-700 dark:text-[#F8FAFC] px-2 py-1.5 text-xs transition cursor-pointer active:scale-[0.98] whitespace-nowrap"
          >
            <Pencil size={12} className="text-[#111827] dark:text-[#F8FAFC] shrink-0" />
            Edit
          </button>
          <button
            onClick={goTo(`/instructor/courses/${course.id}`)}
            className="flex-[1.15] inline-flex items-center justify-center gap-1 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] px-2 py-1.5 text-xs font-bold text-[#111827] transition shadow-sm cursor-pointer active:scale-[0.98] whitespace-nowrap flex-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">View Course</span>
            <ArrowUpRight size={13} className="stroke-[2.5] text-[#111827] shrink-0" />
          </button>
        </div>
      </div>

      {/* Export Loader Overlay */}
      {exporting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <Loader2 size={24} className="animate-spin text-amber-500" />
        </div>
      )}
    </div>
  );
}
