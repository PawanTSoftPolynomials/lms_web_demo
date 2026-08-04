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
  ChevronRight,
  ClipboardList,
  ClipboardCheck,
  Video,
  HelpCircle,
  Star,
  Play,
  Bookmark as BookmarkIcon,
  Sparkles,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getCalendarEvents } from "@/services/calendar.service";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useCourses from "@/hooks/queries/student/useCourses";
import useCourseState from "@/hooks/queries/student/useCourseState";
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

function ContinueLearningRow({ enrollment, accentIdx }) {
  const [bookmarked, setBookmarked] = useState(false);
  const course = enrollment.course || {};
  const courseId = enrollment.courseId || course.id;
  const progress = enrollment.progress ?? 0;
  const completedLessons = enrollment.completedLessons ?? 0;
  const totalLessons = course.lessons ?? 0;
  const accent = ROW_ACCENTS[accentIdx % ROW_ACCENTS.length];
  const { data: courseState } = useCourseState(courseId);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/30 hover:border-slate-700/60 transition">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`shrink-0 h-10 w-10 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center font-black text-sm`}>
          {course.title?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-white truncate">{course.title || "Untitled Course"}</h4>
            {courseState && (
              <span
                title={`AI-personalized · ${courseState.timeSavedMinutes}m saved`}
                className="shrink-0 inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-400"
              >
                <Sparkles size={9} /> {courseState.knowledgeLevel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
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
              : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-200"
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
      className="group rounded-xl border border-slate-800/60 bg-slate-950/30 p-4 hover:border-orange-500/40 transition-all flex flex-col gap-2.5 min-w-0"
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
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mt-auto pt-1">
        <span className="truncate">{course.level || "Beginner"}</span>
        <span className="flex items-center gap-1 text-amber-400 shrink-0">
          <Star size={11} className="fill-amber-400" /> {rating}
        </span>
      </div>
    </Link>
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

  if (isError) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Unable to load student dashboard</h2>
        <p className="mt-2 text-slate-400">Please verify your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-5 sm:p-8">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-orange-400 text-[11px] sm:text-xs font-black uppercase tracking-widest">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              {user?.name ? user.name.split(" ")[0] : "Student"}! <span>👋</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-md">Let&apos;s continue your learning journey. You&apos;ve got this!</p>
            <blockquote className="mt-4 border-l-2 border-orange-500/40 pl-3.5 text-xs sm:text-sm text-slate-300 italic max-w-lg leading-relaxed">
              &quot;{dailyQuote}&quot;
            </blockquote>
          </div>

          <div className="hidden md:flex shrink-0 items-center gap-3">
            <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-3xl bg-gradient-to-br from-orange-500/15 to-purple-500/15 border border-slate-800 flex items-center justify-center">
              <GraduationCap size={40} className="text-orange-400" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shadow-lg">
                <Trophy size={18} />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-lg">
                <CheckCircle size={18} />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-lg">
                <Activity size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm flex items-center gap-3 min-w-0"
          >
            <div className={`shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] sm:text-xs text-slate-400 font-semibold truncate">{s.label}</p>
              {isDashboardLoading ? (
                <div className="h-7 w-14 bg-slate-800 rounded animate-pulse mt-1.5" />
              ) : (
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 truncate">{s.value}</h3>
              )}
              {s.progress !== undefined ? (
                <div className="w-full max-w-[110px] h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              ) : s.href ? (
                <Link
                  href={s.href}
                  className="text-[10px] sm:text-[11px] font-bold text-orange-400 hover:text-orange-300 transition inline-flex items-center gap-0.5 mt-1.5"
                >
                  <span className="truncate">{s.hint}</span> <ChevronRight size={11} className="shrink-0" />
                </Link>
              ) : (
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-1.5 truncate">{s.hint}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main content: Continue Learning / Recommended + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* Continue Learning */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-base font-black text-white">Continue Learning</h2>
              <Link
                href="/student/my-courses"
                className="text-[11px] sm:text-xs font-bold text-orange-400 hover:text-orange-300 transition inline-flex items-center gap-1 shrink-0"
              >
                View all courses <ChevronRight size={13} />
              </Link>
            </div>

            {isDashboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[74px] rounded-xl bg-slate-950/30 border border-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-800 rounded-xl">
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm sm:text-base font-black text-white">Recommended for You</h2>
              <Link
                href="/student/courses"
                className="text-[11px] sm:text-xs font-bold text-orange-400 hover:text-orange-300 transition inline-flex items-center gap-1 shrink-0"
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {isCoursesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[132px] rounded-xl bg-slate-950/30 border border-slate-800/60 animate-pulse" />
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

        {/* Sidebar */}
        <div className="space-y-6 min-w-0">
          {/* Upcoming */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Clock size={14} className="text-orange-400" /> Upcoming (Next 30 Minutes)
              </h3>
              <Link
                href="/student/calendar"
                className="text-[10px] font-black text-orange-400 hover:text-orange-300 transition uppercase tracking-wider shrink-0"
              >
                View all
              </Link>
            </div>

            {isCalendarEventsLoading ? (
              <div className="space-y-2.5">
                {[1, 2].map((n) => (
                  <div key={n} className="h-[54px] rounded-xl bg-slate-950/30 border border-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-xl">
                Nothing scheduled for the rest of today. Check back later.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingEvents.map((task) => {
                  const badge = getBadgeStyle(task.type);
                  const Icon = getEventIcon(task.type);
                  const timeLabel = task.startTime ? formatTime(task.startTime) : "All Day";

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 min-w-0"
                    >
                      <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center border ${badge.className}`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-extrabold text-white truncate">{task.title}</h5>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{task.courseName || task.subtitle || badge.label}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-black text-slate-400">{timeLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar */}
          <MiniCalendar role="STUDENT" />

          {/* Recent Achievements */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Trophy size={14} className="text-amber-400" /> Recent Achievements
              </h3>
              <Link
                href="/student/achievements"
                className="text-[10px] font-black text-orange-400 hover:text-orange-300 transition uppercase tracking-wider shrink-0"
              >
                View all
              </Link>
            </div>

            {isDashboardLoading ? (
              <div className="space-y-2.5">
                {[1, 2].map((n) => (
                  <div key={n} className="h-[54px] rounded-xl bg-slate-950/30 border border-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : unlockedAchievements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-xl">
                Keep learning to unlock your first achievement!
              </div>
            ) : (
              <div className="space-y-2.5">
                {unlockedAchievements.map((ach) => (
                  <div key={ach.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 min-w-0">
                    <div
                      className={`shrink-0 h-9 w-9 rounded-full ${ach.bg} ${ach.color} border ${ach.border} flex items-center justify-center text-base`}
                    >
                      {ach.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-extrabold text-white truncate">{ach.name}</h5>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
