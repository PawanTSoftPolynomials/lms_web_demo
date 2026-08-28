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
  Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/20",
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
      className="card-photo-jellyfish group relative flex w-[70%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-56 md:shrink flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--card-photo-bg-from)] to-[var(--card-photo-bg-to)] border border-[var(--card-photo-border)] shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-28 md:h-32 shrink-0 pt-1.5 px-1.5 md:pt-2 md:px-2">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/20">
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
              <BookOpen size={36} className="text-white/25" />
            </div>
          )}

          {/* Blends the image's bottom edge into the card body's gradient
              color instead of a hard cutoff, echoing the soft-edged glow
              of the reference art. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{ background: "linear-gradient(to bottom, transparent, var(--card-photo-bg-to))" }}
          />

          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/55 backdrop-blur px-1.5 py-0.5 text-[9px] font-bold text-white">
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>

          <div className="absolute top-1.5 right-1.5" onClick={(e) => e.stopPropagation()}>
            <ActionMenu items={menuItems} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 md:gap-1.5 p-2 md:p-2.5">
        <div>
          <h3 className="card-photo-title text-xs md:text-sm font-bold leading-snug line-clamp-1 text-[var(--card-photo-h1)]">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-0.5 text-[10px] md:text-[11px] leading-relaxed line-clamp-1 text-[var(--card-photo-subtitle)]">{course.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] md:text-[10px] text-white/50">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {studentsCount} Students
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.estimatedLearningHours ? `${course.estimatedLearningHours}h` : "—"}
          </span>
          <span className="truncate">
            Updated {course.updatedAt ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true }) : "—"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span
            className="rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
            style={{ borderColor: "color-mix(in oklab, var(--card-photo-highlight) 35%, transparent)", backgroundColor: "color-mix(in oklab, var(--card-photo-highlight) 15%, transparent)", color: "var(--card-photo-highlight)" }}
          >
            {course.category || "Uncategorized"}
          </span>
          {course.tags?.[0] ? (
            <span
              className="rounded-md border px-1.5 py-0.5 text-[9px] font-bold"
              style={{ borderColor: "color-mix(in oklab, var(--card-photo-subtitle) 35%, transparent)", backgroundColor: "color-mix(in oklab, var(--card-photo-subtitle) 15%, transparent)", color: "var(--card-photo-subtitle)" }}
            >
              {course.tags[0]}
            </span>
          ) : null}
          {course.level ? (
            <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${LEVEL_STYLE[course.level] || LEVEL_STYLE.Beginner}`}>
              {course.level}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-1.5 pt-0.5">
          <button
            onClick={goTo(`/instructor/courses/edit/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] md:text-[11px] font-extrabold text-white/80 transition hover:bg-white/10"
          >
            <Pencil size={11} />
            Edit
          </button>
          <button
            onClick={goTo(`/instructor/courses/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] md:text-[11px] font-extrabold transition hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "var(--card-photo-highlight)", color: "#1a1200" }}
          >
            View Course
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>

      {exporting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
          <Loader2 size={20} className="animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
