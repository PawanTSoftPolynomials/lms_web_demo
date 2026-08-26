"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { BookOpen, Layers, FileText, HelpCircle, Clock, UserRound, CalendarPlus, History, Pencil, ArrowUpRight, Download, Loader2 } from "lucide-react";

import CourseStatusBadge from "@/components/courses/CourseStatusBadge";
import { exportCourse } from "@/services/course.service";
import { getDisplayUrl } from "@/lib/blob";

const ACCENT_BAR = {
  PUBLISHED: "bg-primary",
  DRAFT: "bg-muted-foreground/40",
  ARCHIVED: "bg-destructive",
};

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 md:gap-1 rounded-lg border border-border bg-muted/60 py-1 md:py-2 text-foreground">
      <div className="flex items-center gap-1.5">
        <Icon size={15} className="text-primary" />
        <p className="text-sm md:text-base font-black tabular-nums">{value}</p>
      </div>
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

/** My Courses grid card — banner, stats, duration, creator, audit fields, description, edit/view actions. */
export default function CourseGridCard({ course }) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);

  const lessonsCount = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? course.stats?.lessonsCount ?? 0;
  const accentBar = ACCENT_BAR[course.status] || ACCENT_BAR.DRAFT;

  const goTo = (path) => (e) => {
    e.stopPropagation();
    router.push(path);
  };

  const handleExport = async (e) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className="group relative flex w-[90%] shrink-0 snap-center max-md:first:ml-[5%] max-md:last:mr-[5%] md:w-80 md:shrink flex-col overflow-hidden rounded-2xl bg-card border border-card-border shadow-luxury-sm hover:shadow-luxury-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-16 md:h-28 shrink-0 overflow-hidden bg-muted">
        <div className={`absolute inset-x-0 top-0 h-1 ${accentBar} z-10`} />
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
            <BookOpen size={36} className="text-muted-foreground/40" />
          </div>
        )}

        <span className="absolute top-2 left-2 md:top-3 md:left-3 rounded-md border border-white/30 bg-black/50 backdrop-blur px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] font-bold text-white">
          {course.category || "Uncategorized"}
        </span>
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <CourseStatusBadge status={course.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 md:gap-2.5 p-3 md:p-4">
        <div>
          <h3 className="text-base md:text-lg font-black text-foreground leading-snug line-clamp-1">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-0.5 md:mt-1 text-xs md:text-[13px] leading-relaxed text-muted-foreground line-clamp-1 md:line-clamp-2">{course.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-1.5 md:gap-2">
          <Stat icon={Layers} value={course._count?.modules ?? 0} label="Modules" />
          <Stat icon={FileText} value={lessonsCount} label="Lessons" />
          <Stat icon={HelpCircle} value={course._count?.quizzes ?? 0} label="Quizzes" />
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
          <span className="flex min-w-0 items-center gap-1.5 truncate rounded-lg border border-border bg-muted/60 px-2 py-0.5 md:py-1 text-foreground">
            <UserRound size={13} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{course.creator?.name || "Unknown"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-2 py-0.5 md:py-1 text-foreground">
            <Clock size={13} className="text-muted-foreground" />
            {course.estimatedLearningHours ? `${course.estimatedLearningHours}h` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarPlus size={13} />
            {course.createdAt ? format(new Date(course.createdAt), "MMM d, yyyy") : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <History size={13} />
            {course.updatedAt ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true }) : "—"}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-0.5 md:pt-1.5">
          <button
            onClick={goTo(`/instructor/courses/edit/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 md:py-2 text-xs md:text-[13px] font-extrabold text-foreground transition hover:bg-muted"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            title="Export Course ZIP"
            className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-muted/40 text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          </button>
          <button
            onClick={goTo(`/instructor/courses/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3 py-1.5 md:py-2 text-xs md:text-[13px] font-extrabold transition hover:brightness-110 active:scale-95"
          >
            View
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
