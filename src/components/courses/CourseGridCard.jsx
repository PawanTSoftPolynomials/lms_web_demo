"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Layers,
  ClipboardCheck,
  Clock,
  Calendar,
  History,
  Pencil,
  ArrowUpRight,
} from "lucide-react";

const STATUS_STYLES = {
  DRAFT: { dot: "bg-amber-400", pill: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  PUBLISHED: { dot: "bg-emerald-400", pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  ARCHIVED: { dot: "bg-slate-400", pill: "bg-white/10 text-slate-300 border-white/15" },
};

// Each course gets a vibrant accent gradient (there's no per-course color in
// the data model) so cards read as distinct, colorful identities instead of
// one flat dark card repeated — cycled by position, same pattern the old
// student card used for its accent colors.
export const CARD_ACCENTS = [
  { gradient: "from-[#1c5a8a] via-[#164a72] to-[#0e2c46]", text: "text-[#1c5a8a]" }, // blue
  { gradient: "from-[#a8531f] via-[#8a3f16] to-[#4a2410]", text: "text-[#a8531f]" }, // rust/orange
  { gradient: "from-[#a8791f] via-[#8a5f16] to-[#4a3610]", text: "text-[#a8791f]" }, // gold/brown
  { gradient: "from-[#8a2a63] via-[#6f2050] to-[#3a1230]", text: "text-[#8a2a63]" }, // magenta/purple
];

function StatCell({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2.5 px-1.5 rounded-lg bg-white/10 border border-white/15">
      <Icon size={13} className="text-white/70" />
      <span className="text-[13px] font-black text-white leading-none tabular-nums">{value}</span>
      <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/70">{label}</span>
    </div>
  );
}

/** The "My Courses" grid card — thumbnail, status, progress stats, Edit/View. */
export default function CourseGridCard({ course, index = 0 }) {
  const router = useRouter();

  if (!course) return null;

  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const status = course.status || "DRAFT";
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;

  const modulesCount = course._count?.modules ?? 0;
  const lessonsCount = course.stats?.lessonsCount ?? 0;
  const quizzesCount = course._count?.quizzes ?? 0;

  // Prefer the course's own estimated hours; fall back to a lesson-count
  // heuristic (0.75 hr/lesson, same as the marketplace card) if unset.
  const estimatedHours =
    course.estimatedLearningHours ?? (lessonsCount > 0 ? Math.max(1, Math.round(lessonsCount * 0.75)) : null);
  const durationLabel = estimatedHours ? `${estimatedHours}h` : "—";

  const createdLabel = course.createdAt ? format(new Date(course.createdAt), "MMM d, yyyy") : "—";
  const updatedAgoLabel = course.updatedAt
    ? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })
    : "—";

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={() => router.push(`/instructor/courses/${course.id}`)}
      className={`group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b ${accent.gradient} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 cursor-pointer`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black/20">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
            <BookOpen size={28} className="text-white/50" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />

        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/50 backdrop-blur-md text-white/90 border border-white/10">
          {course.category || "Uncategorized"}
        </span>

        <span
          className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${statusStyle.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3
            className="text-[15px] font-bold text-white leading-snug line-clamp-2 min-h-[2.6em]"
            title={course.title}
          >
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-white/80 leading-relaxed line-clamp-2 min-h-[2.2em]">
            {course.description || "No description provided yet."}
          </p>
        </div>

        <div className="flex items-stretch gap-2">
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            <StatCell icon={Layers} value={modulesCount} label="Modules" />
            <StatCell icon={BookOpen} value={lessonsCount} label="Lessons" />
            <StatCell icon={ClipboardCheck} value={quizzesCount} label="Quizzes" />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-[11px] font-bold text-white">
            <Clock size={12} className="text-white/70" />
            {durationLabel}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10.5px] font-medium text-white/80">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {createdLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <History size={12} /> {updatedAgoLabel}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/instructor/courses/edit/${course.id}`}
            onClick={stop}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all duration-200"
          >
            <Pencil size={13} /> Edit
          </Link>
          <Link
            href={`/instructor/courses/${course.id}`}
            onClick={stop}
            className={`flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold ${accent.text} hover:bg-slate-100 transition-all duration-200`}
          >
            View <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
