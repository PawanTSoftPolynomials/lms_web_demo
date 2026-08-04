"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  CheckCircle,
  Activity,
  Clock,
  ClipboardList,
  ClipboardCheck,
  Video,
  HelpCircle,
  Star,
  Play,
  Bookmark as BookmarkIcon,
  Calendar as CalendarIcon,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getCalendarEvents } from "@/services/calendar.service";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useCourses from "@/hooks/queries/student/useCourses";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import { useAuth } from "@/context/AuthContext";

const QUOTES = [
  "The beautiful thing about learning is that no one can take it away from you.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Learning never exhausts the mind, it only fuels it.",
  "The expert in anything was once a beginner.",
];

const ROW_ACCENTS = [
  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) return timeStr;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

const toMinutesSinceMidnight = (timeStr) => {
  if (!timeStr) return null;
  const t = timeStr.trim().toLowerCase();
  const ampmMatch = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    if (ampmMatch[3] === "pm" && h !== 12) h += 12;
    if (ampmMatch[3] === "am" && h === 12) h = 0;
    return h * 60 + m;
  }
  const parts = t.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getBadgeStyle = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "class" || t === "lecture") {
    return { label: "Lecture", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  }
  if (t === "office hours" || t === "session" || t === "q&a" || t === "live_class") {
    return { label: "Live Class", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
  }
  if (t === "assignment" || t === "deadline") {
    return { label: "Assignment Due", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  }
  if (t === "exam") {
    return { label: "Exam", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  }
  if (t === "quiz") {
    return { label: "Quiz Starts", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
  }
  return { label: type || "Event", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
};

const getEventIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "class" || t === "lecture" || t === "office hours" || t === "session" || t === "q&a" || t === "live_class") return Video;
  if (t === "assignment" || t === "deadline") return ClipboardList;
  if (t === "exam") return ClipboardCheck;
  if (t === "quiz") return HelpCircle;
  return Clock;
};

// Mobile "Upcoming (Next 7 Days)" uses its own compact badge palette so the
// desktop sidebar's existing colors (getBadgeStyle) stay untouched.
const getMobileEventBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "assignment" || t === "deadline") return { label: "Assignment", className: "bg-purple-500/15 text-purple-300" };
  if (t === "exam") return { label: "Exam", className: "bg-rose-500/15 text-rose-300" };
  if (t === "quiz") return { label: "Quiz", className: "bg-orange-500/15 text-orange-300" };
  return { label: "Live Class", className: "bg-blue-500/15 text-blue-300" };
};

const formatDueIn = (dateObj) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((dateObj - startOfToday) / 86400000);
  const dateLabel = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  if (diffDays <= 0) return `Due today • ${dateLabel}`;
  if (diffDays === 1) return `Due tomorrow • ${dateLabel}`;
  return `Due in ${diffDays} days • ${dateLabel}`;
};

function ContinueLearningRow({ enrollment, accentIdx }) {
  const [bookmarked, setBookmarked] = useState(false);
  const course = enrollment.course || {};
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const accent = ROW_ACCENTS[accentIdx % ROW_ACCENTS.length];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-[#1A1F35] bg-[#0A0D1B] hover:border-slate-700 transition">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 h-10 w-10 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center font-black text-sm`}>
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-200 truncate">{course.title || "Untitled Course"}</h4>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {totalLessons > 0 ? `${completedLessons}/${totalLessons} lessons` : "Self-paced"} &middot; {progress}% complete
          </p>
          <div className="w-full max-w-[220px] h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
            <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <Link href={`/student/learn/${enrollment.courseId || course.id}`} className="flex-1 sm:flex-none">
          <button className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer">
            <Play size={12} className="fill-slate-950" /> Continue
          </button>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setBookmarked((v) => !v);
          }}
          title={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className={`shrink-0 h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
            bookmarked
              ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
              : "bg-[#0D1021] border-[#1A1F35] text-slate-500 hover:text-slate-200"
          }`}
        >
          <BookmarkIcon size={14} className={bookmarked ? "fill-orange-400" : ""} />
        </button>
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course }) {
  const isNew = course.createdAt && Date.now() - new Date(course.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14;
  const hasReviews = Array.isArray(course.reviews) && course.reviews.length > 0;
  const rating = hasReviews
    ? (course.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / course.reviews.length).toFixed(1)
    : "4.8";

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="group rounded-xl border border-[#1A1F35] bg-[#0A0D1B] p-4 hover:border-orange-500/40 transition-all flex flex-col gap-2.5 min-w-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
          <BookOpen size={16} />
        </div>
        {isNew && (
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25 shrink-0">
            New
          </span>
        )}
      </div>
      <h4 className="text-sm font-extrabold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
        {course.title}
      </h4>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-auto pt-1">
        <span className="truncate">{course.level || "Beginner"}</span>
        <span className="flex items-center gap-1 text-amber-400 shrink-0">
          <Star size={11} className="fill-amber-400" /> {rating}
        </span>
      </div>
    </Link>
  );
}

// Mobile-only: one compact, equally-sized shortcut button (Quick Actions row).
function QuickActionButton({ href, icon: Icon, label, color, bg }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] py-3 min-h-[44px] active:scale-95 transition"
    >
      <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
        <Icon size={15} className={color} />
      </div>
      <span className="text-[10px] font-bold text-slate-300">{label}</span>
    </Link>
  );
}

// Mobile-only: the single most-prominent "resume where you left off" card —
// only the top enrollment, not the full list the desktop sidebar shows.
function MobileContinueCard({ enrollment }) {
  const [bookmarked, setBookmarked] = useState(false);
  const course = enrollment.course || {};
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const lessonLabel = totalLessons > 0 ? `Lesson ${Math.min(completedLessons + 1, totalLessons)} of ${totalLessons}` : "Self-paced";

  return (
    <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-base shrink-0">
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-white truncate">{course.title || "Untitled Course"}</h3>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{lessonLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setBookmarked((v) => !v)}
          title={bookmarked ? "Remove bookmark" : "Bookmark course"}
          className={`shrink-0 h-9 w-9 rounded-full border flex items-center justify-center transition ${
            bookmarked
              ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
              : "bg-[#141930] border-[#1A1F35] text-slate-500"
          }`}
        >
          <BookmarkIcon size={15} className={bookmarked ? "fill-orange-400" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3.5">
        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-black text-white shrink-0">{progress}%</span>
      </div>

      <Link
        href={`/student/learn/${enrollment.courseId || course.id}`}
        className="mt-3.5 flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 active:bg-orange-600 text-slate-950 font-black text-sm py-3 min-h-[44px] transition"
      >
        <Play size={15} className="fill-slate-950" /> Continue
      </Link>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading: isDashboardLoading, isError } = useDashboard();
  const { data: allCourses = [], isLoading: isCoursesLoading } = useCourses();

  const { data: calendarEvents = [], isLoading: isCalendarEventsLoading } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const stats = dashboardData?.stats ?? {};
  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];

  const dailyQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  const completedLessonsCount = stats.completedLessons ?? 0;
  const totalLessonsCount = stats.totalLessons ?? 0;
  const completionRate = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  const statCards = [
    {
      key: "enrolled",
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      icon: BookOpen,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      hint: "View all courses",
      href: "/student/my-courses",
    },
    {
      key: "completed",
      label: "Completed Lessons",
      value: completedLessonsCount,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      hint: "Keep it up! 🎉",
    },
    {
      key: "rate",
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      progress: completionRate,
    },
    {
      key: "certificates",
      label: "Certificates Earned",
      value: stats.certificatesCount ?? 0,
      icon: Trophy,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      hint: "View certificates",
      href: "/student/certificates",
    },
  ];

  const achievementsList = useMemo(
    () => [
      {
        name: "Quiz Master",
        icon: "🏆",
        description: "Scored 90%+ average in quizzes",
        active: (stats.avgQuizScore ?? 0) >= 90,
        bg: "bg-amber-500/10",
        color: "text-amber-400",
        border: "border-amber-500/25",
      },
      {
        name: "Consistency Star",
        icon: "⭐",
        description: `${stats.streak ?? 0} day learning streak`,
        active: (stats.streak ?? 0) >= 3,
        bg: "bg-purple-500/10",
        color: "text-purple-400",
        border: "border-purple-500/25",
      },
      {
        name: "Top Learner",
        icon: "🧠",
        description: "Completed 5+ lessons",
        active: (stats.completedLessons ?? 0) >= 5,
        bg: "bg-emerald-500/10",
        color: "text-emerald-400",
        border: "border-emerald-500/25",
      },
    ],
    [stats]
  );
  const unlockedAchievements = achievementsList.filter((a) => a.active);

  const upcomingEvents = useMemo(() => {
    if (!calendarEvents || calendarEvents.length === 0) return [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return calendarEvents
      .filter((e) => e.date === todayStr)
      .map((e) => ({ ...e, _minutes: toMinutesSinceMidnight(e.startTime) }))
      .filter((e) => e._minutes === null || e._minutes >= nowMinutes)
      .sort((a, b) => (a._minutes ?? 0) - (b._minutes ?? 0))
      .slice(0, 4);
  }, [calendarEvents]);

  const enrolledCourseIds = useMemo(
    () => new Set(enrolledCourses.map((e) => e.courseId || e.course?.id)),
    [enrolledCourses]
  );
  const recommendedCourses = useMemo(
    () => allCourses.filter((c) => !enrolledCourseIds.has(c.id)).slice(0, 3),
    [allCourses, enrolledCourseIds]
  );

  // Mobile-only "Upcoming (Next 7 Days)" — a wider window than the desktop
  // sidebar's "next 30 minutes today" view, computed from the same calendar
  // data already being fetched above.
  const mobileUpcomingEvents = useMemo(() => {
    if (!calendarEvents || calendarEvents.length === 0) return [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysOut = new Date(startOfToday);
    sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);

    return calendarEvents
      .map((e) => ({ ...e, _date: e.date ? new Date(`${e.date}T00:00:00`) : null }))
      .filter((e) => e._date && e._date >= startOfToday && e._date < sevenDaysOut)
      .sort((a, b) => a._date - b._date || (toMinutesSinceMidnight(a.startTime) ?? 0) - (toMinutesSinceMidnight(b.startTime) ?? 0))
      .slice(0, 4);
  }, [calendarEvents]);

  const topEnrollment = enrolledCourses[0];
  const resumeHref = topEnrollment
    ? `/student/learn/${topEnrollment.courseId || topEnrollment.course?.id}`
    : "/student/my-courses";

  if (isError) {
    return (
      <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Unable to load student dashboard</h2>
        <p className="mt-2 text-slate-400">Please verify your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
      {/* ============================= MOBILE (true mobile-first layout, not a squeezed desktop) ============================= */}
      <div className="sm:hidden -mx-3 -mt-3 px-4 pt-4 space-y-4 bg-[#080B11] min-h-[calc(100vh-3.5rem)]">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F1A] to-[#12182B] border border-[#1A1F35] p-4 flex items-center justify-between gap-3">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/10 blur-[50px] pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Hi, {user?.name ? user.name.split(" ")[0] : "Student"}! <span className="animate-wave origin-bottom-right inline-block text-lg">👋</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Let&apos;s continue your learning journey.</p>
          </div>
          <div className="relative z-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/15 to-purple-500/15 border border-[#1A1F35] flex items-center justify-center shrink-0">
            <GraduationCap size={28} className="text-orange-400" />
          </div>
        </div>

        {/* Compact Statistics — all four fit on one row on a 375px screen, no scrolling */}
        <div className="grid grid-cols-4 gap-2">
          {statCards.map((s) => (
            <div key={s.key} className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-2">
              <div className={`h-6 w-6 rounded-md ${s.bg} flex items-center justify-center mb-1`}>
                <s.icon size={11} className={s.color} />
              </div>
              {isDashboardLoading ? (
                <div className="h-4 w-8 bg-slate-800 rounded animate-pulse" />
              ) : (
                <p className="text-sm font-black text-white leading-none">{s.value}</p>
              )}
              <p className="text-[8.5px] text-slate-400 font-semibold leading-tight mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-black text-white mb-2.5">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2.5">
            <QuickActionButton href={resumeHref} icon={Play} label="Resume" color="text-orange-400" bg="bg-orange-500/10" />
            <QuickActionButton href="/student/calendar" icon={CalendarIcon} label="Schedule" color="text-emerald-400" bg="bg-emerald-500/10" />
            <QuickActionButton href="/student/assignments" icon={ClipboardList} label="Assignments" color="text-purple-400" bg="bg-purple-500/10" />
            <QuickActionButton href="/student/quizzes" icon={HelpCircle} label="Quiz" color="text-blue-400" bg="bg-blue-500/10" />
          </div>
        </div>

        {/* Continue Learning — one prominent card, the most recent enrollment only */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Continue Learning</h2>
            <Link href="/student/my-courses" className="text-[11px] text-orange-400 font-bold">
              View all
            </Link>
          </div>

          {isDashboardLoading ? (
            <div className="h-[168px] rounded-2xl bg-slate-800/50 animate-pulse" />
          ) : topEnrollment ? (
            <MobileContinueCard enrollment={topEnrollment} />
          ) : (
            <div className="py-8 text-center border border-dashed border-[#1A1F35] rounded-2xl">
              <p className="text-xs text-slate-500">You have not enrolled in any courses yet.</p>
              <Link href="/student/courses" className="inline-block mt-3">
                <button className="px-5 py-2.5 bg-orange-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">
                  Explore Courses
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming (Next 7 Days) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Upcoming (Next 7 Days)</h2>
            <Link href="/student/calendar" className="text-[11px] text-orange-400 font-bold">
              View all
            </Link>
          </div>

          {isCalendarEventsLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((n) => (
                <div key={n} className="h-[58px] rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : mobileUpcomingEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
              Nothing scheduled this week.
            </div>
          ) : (
            <div className="space-y-2.5">
              {mobileUpcomingEvents.map((task) => {
                const badge = getMobileEventBadge(task.type);
                const Icon = getEventIcon(task.type);
                return (
                  <div key={task.id} className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#141930] border border-[#1A1F35] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatDueIn(task._date)}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended Courses — horizontal carousel */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Recommended Courses</h2>
            <Link href="/student/courses" className="text-[11px] text-orange-400 font-bold">
              View all
            </Link>
          </div>

          {isCoursesLoading ? (
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 scrollbar-none">
              {[1, 2].map((n) => (
                <div key={n} className="shrink-0 w-[46%] h-[132px] rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : recommendedCourses.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No new recommendations right now.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x snap-mandatory scrollbar-none">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="snap-start shrink-0 w-[46%]">
                  <RecommendedCourseCard course={course} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================= DESKTOP / TABLET (unchanged) ============================= */}
      <div className="hidden sm:block -m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-[#080B11] p-3 sm:p-6 pt-0 sm:pt-0">
      <div className="flex flex-col max-w-[1600px] mx-auto">

        {/* Stat / KPI Strip */}
        <div className="mt-4 mb-2">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
            {statCards.map((s) => (
              <div
                key={s.key}
                className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-3 shadow-sm hover:border-slate-700 transition"
              >
                <div className={`p-2 rounded-xl ${s.bg} shrink-0`}>
                  <s.icon size={16} className={s.color} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{s.label}</p>
                  {isDashboardLoading ? (
                    <div className="h-5 w-10 bg-slate-800 rounded animate-pulse mt-1.5" />
                  ) : (
                    <p className="text-lg font-black text-white leading-none mt-1">{s.value}</p>
                  )}

                  {s.progress !== undefined ? (
                    <div className="w-full max-w-[110px] h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  ) : s.href ? (
                    <Link href={s.href} className="text-[9px] font-bold text-orange-400 hover:text-orange-300 transition truncate block mt-1.5">
                      {s.hint} &rarr;
                    </Link>
                  ) : (
                    <p className="text-[9px] text-slate-500 font-medium truncate mt-1.5">{s.hint}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid: content (8/12) + sidebar (4/12) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
          {/* Left main column */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Welcome Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F1A] to-[#12182B] border border-[#1A1F35] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between min-h-[140px]">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-500/10 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

              <div className="relative z-10 w-full md:w-2/3 space-y-2">
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-xs font-medium">Welcome back,</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    {user?.name ? user.name.split(" ")[0] : "Student"}! <span className="animate-wave origin-bottom-right inline-block text-xl">👋</span>
                  </h1>
                  <p className="text-slate-400 text-xs">Let&apos;s continue your learning journey. You&apos;ve got this!</p>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/20 max-w-lg inline-block">
                  <p className="text-orange-400 text-xs font-semibold italic">&quot;{dailyQuote}&quot;</p>
                </div>
              </div>

              <div className="relative z-10 hidden md:flex w-1/3 justify-end items-center gap-3">
                <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-3xl bg-gradient-to-br from-orange-500/15 to-purple-500/15 border border-[#1A1F35] flex items-center justify-center shrink-0">
                  <GraduationCap size={40} className="text-orange-400" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#0D1021] border border-[#1A1F35] flex items-center justify-center text-purple-400 shadow-lg">
                    <Trophy size={18} />
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-[#0D1021] border border-[#1A1F35] flex items-center justify-center text-emerald-400 shadow-lg">
                    <CheckCircle size={18} />
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-[#0D1021] border border-[#1A1F35] flex items-center justify-center text-blue-400 shadow-lg">
                    <Activity size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-200">Continue Learning</h3>
                <Link href="/student/my-courses" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
                  View all courses &rarr;
                </Link>
              </div>

              {isDashboardLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[74px] rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[#1A1F35] rounded-xl">
                  <p className="text-xs text-slate-500">You have not enrolled in any courses yet.</p>
                  <Link href="/student/courses" className="inline-block mt-3">
                    <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">
                      Explore Courses
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledCourses.slice(0, 5).map((enrollment, idx) => (
                    <ContinueLearningRow key={enrollment.id || enrollment.courseId || idx} enrollment={enrollment} accentIdx={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended for You */}
            <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-200">Recommended for You</h3>
                <Link href="/student/courses" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
                  View all
                </Link>
              </div>

              {isCoursesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[132px] rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : recommendedCourses.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No new recommendations right now &mdash; you&apos;re enrolled in everything available!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {recommendedCourses.map((course) => (
                    <RecommendedCourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar column */}
          <div className="xl:col-span-4 flex flex-col gap-6">

            {/* Upcoming */}
            <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
                <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-orange-400" />
                  Upcoming (Next 30 Min)
                </h3>
                <Link href="/student/calendar" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
                  View all
                </Link>
              </div>

              {isCalendarEventsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-[54px] rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-2">
                    <Clock size={16} className="text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Nothing scheduled for the rest of today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((task) => {
                    const badge = getBadgeStyle(task.type);
                    const Icon = getEventIcon(task.type);
                    const timeLabel = task.startTime ? formatTime(task.startTime) : "All Day";

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl border bg-[#141930] border-[#1A1F35] hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border ${badge.className}`}>
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                              <p className="text-[10px] text-slate-400 truncate">{task.courseName || task.subtitle || badge.label}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] font-black text-sky-400">{timeLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
              <div className="mb-2">
                <h3 className="text-sm font-black text-slate-200">Calendar</h3>
              </div>
              <div className="dashboard-calendar-wrapper text-white scale-[0.95] origin-top">
                <MiniCalendar role="STUDENT" />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#1A1F35] pb-3">
                <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  Recent Achievements
                </h3>
                <Link href="/student/achievements" className="text-[11px] text-orange-400 font-bold hover:text-orange-300">
                  View all
                </Link>
              </div>

              {isDashboardLoading ? (
                <div className="space-y-2.5">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-[54px] rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : unlockedAchievements.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Keep learning to unlock your first achievement!</p>
              ) : (
                <div className="space-y-5">
                  {unlockedAchievements.map((ach) => (
                    <div key={ach.name} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${ach.bg} ${ach.border} shrink-0 flex items-center justify-center text-base`}>
                        {ach.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200">{ach.name}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
