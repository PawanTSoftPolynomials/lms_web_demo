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
  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className="bg-card group relative flex w-[85%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-full md:shrink-0 flex-col overflow-hidden p-3 md:p-4 transition-all duration-300 cursor-pointer"
    >
      {/* Soft rounded image wrapper */}
      <div className="relative h-32 md:h-40 shrink-0 w-full overflow-hidden rounded-[24px] shadow-inner bg-muted/50 mb-4">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getDisplayUrl(course.thumbnailUrl)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <BookOpen size={36} className="text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/50 border border-primary/20 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>

        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/50 border border-primary/20 backdrop-blur-md rounded-full shadow-sm text-primary">
            <ActionMenu items={menuItems} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1">
        <h3 className="text-sm md:text-base font-black leading-tight line-clamp-2 text-foreground mb-1">
          {course.title}
        </h3>
        {course.description ? (
          <p className="text-[11px] leading-relaxed line-clamp-1 text-muted-foreground mb-3">{course.description}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground/70 mb-4">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {studentsCount}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {course.estimatedLearningHours ? `${course.estimatedLearningHours}h` : "?"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-extrabold text-primary">
            {course.category || "General"}
          </span>
          {course.level && (
            <span className="rounded-full bg-secondary/30 px-3 py-1 text-[10px] font-extrabold text-foreground">
              {course.level}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={goTo(`/instructor/courses/edit/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-background px-3 py-2.5 text-[11px] font-extrabold text-foreground transition hover:bg-muted"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            onClick={goTo(`/instructor/courses/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-[11px] font-extrabold text-primary-foreground transition shadow-md hover:-translate-y-0.5"
          >
            View
            <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {exporting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-background/80 backdrop-blur-sm">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
