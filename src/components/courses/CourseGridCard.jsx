"use client";

import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { BookOpen, Layers, FileText, HelpCircle, Clock, UserRound, CalendarPlus, History, Pencil, ArrowUpRight } from "lucide-react";

import CourseStatusBadge from "@/components/courses/CourseStatusBadge";

const STATUS_ACCENT = {
  PUBLISHED: "from-white via-white/60 to-transparent",
  DRAFT: "from-white/50 via-white/30 to-transparent",
  ARCHIVED: "from-red-900 via-red-900/60 to-transparent",
};

/**
 * Bold gradient per card — one hue, cycled by grid index so every card in view is a
 * different color. The gradient itself stays at a normal, identifiable saturation;
 * `brightness`/`contrast` filters are applied on a separate background layer (not on
 * the text) to knock the perceived intensity down by ~40% without graying out content.
 */
const THEMES = [
  { gradient: "bg-gradient-to-br from-cyan-500 to-blue-700", viewText: "text-blue-800" },
  { gradient: "bg-gradient-to-br from-orange-500 to-red-700", viewText: "text-red-800" },
  { gradient: "bg-gradient-to-br from-amber-500 to-amber-700", viewText: "text-amber-900" },
  { gradient: "bg-gradient-to-br from-pink-500 to-pink-700", viewText: "text-pink-800" },
  { gradient: "bg-gradient-to-br from-violet-500 to-purple-700", viewText: "text-violet-900" },
  { gradient: "bg-gradient-to-br from-emerald-500 to-green-700", viewText: "text-green-900" },
  { gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700", viewText: "text-indigo-900" },
  { gradient: "bg-gradient-to-br from-teal-500 to-teal-700", viewText: "text-teal-900" },
  { gradient: "bg-gradient-to-br from-rose-500 to-rose-700", viewText: "text-rose-800" },
  { gradient: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-700", viewText: "text-fuchsia-900" },
  { gradient: "bg-gradient-to-br from-lime-600 to-green-700", viewText: "text-green-900" },
  { gradient: "bg-gradient-to-br from-sky-500 to-sky-700", viewText: "text-sky-900" },
];

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-white/25 bg-white/15 py-2 text-white backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <Icon size={15} />
        <p className="text-base font-black tabular-nums">{value}</p>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</p>
    </div>
  );
}

/** My Courses grid card — banner, stats, duration, creator, audit fields, description, edit/view actions. */
export default function CourseGridCard({ course, index = 0 }) {
  const router = useRouter();

  const lessonsCount = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? course.stats?.lessonsCount ?? 0;
  const accent = STATUS_ACCENT[course.status] || STATUS_ACCENT.DRAFT;
  const theme = THEMES[index % THEMES.length];

  const goTo = (path) => (e) => {
    e.stopPropagation();
    router.push(path);
  };

  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className="group relative flex w-80 flex-col overflow-hidden rounded-2xl shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 cursor-pointer"
    >
      {/* Dimmed color layer — ~40% less bright/contrasty than the raw gradient, kept behind the content so text stays crisp */}
      <div className={`absolute inset-0 ${theme.gradient} brightness-[0.6] contrast-[0.85]`} />

      {/* Content sits in its own stacked layer so it renders above the dimmed background */}
      <div className="relative z-10 flex flex-1 flex-col">
      {/* Banner */}
      <div className="relative h-28 shrink-0 overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} z-10`} />
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <BookOpen size={36} className="text-white/20" />
          </div>
        )}

        <span className="absolute top-3 left-3 rounded-md border border-white/30 bg-white/15 backdrop-blur px-2 py-1 text-[11px] font-bold text-white">
          {course.category || "Uncategorized"}
        </span>
        <div className="absolute top-3 right-3">
          <CourseStatusBadge status={course.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="text-lg font-black text-white leading-snug line-clamp-1">
            {course.title}
          </h3>
          {course.description ? (
            <p className="mt-1 text-[13px] leading-relaxed text-white/80 line-clamp-2">{course.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Layers} value={course._count?.modules ?? 0} label="Modules" />
          <Stat icon={FileText} value={lessonsCount} label="Lessons" />
          <Stat icon={HelpCircle} value={course._count?.quizzes ?? 0} label="Quizzes" />
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="flex min-w-0 items-center gap-1.5 truncate rounded-lg border border-white/25 bg-white/15 px-2 py-1 text-white backdrop-blur-sm">
            <UserRound size={13} className="shrink-0 text-white/70" />
            <span className="truncate">{course.creator?.name || "Unknown"}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/25 bg-white/15 px-2 py-1 text-white backdrop-blur-sm">
            <Clock size={13} className="text-white/70" />
            {course.estimatedLearningHours ? `${course.estimatedLearningHours}h` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span className="flex items-center gap-1.5">
            <CalendarPlus size={13} className="text-white/60" />
            {course.createdAt ? format(new Date(course.createdAt), "MMM d, yyyy") : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <History size={13} className="text-white/60" />
            {course.updatedAt ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true }) : "—"}
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1.5">
          <button
            onClick={goTo(`/instructor/courses/edit/${course.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-[13px] font-extrabold text-white transition hover:bg-white/20"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={goTo(`/instructor/courses/${course.id}`)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-extrabold transition hover:bg-white/90 active:scale-95 ${theme.viewText}`}
          >
            View
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
