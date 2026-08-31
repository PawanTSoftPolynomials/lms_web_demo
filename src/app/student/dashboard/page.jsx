"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Trophy,
  CheckCircle,
  Activity,
  Clock,
  ClipboardList,
  HelpCircle,
  Play,
  CalendarIcon,
} from "lucide-react";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useCourses from "@/hooks/queries/student/useCourses";
import useStudentCalendar from "@/hooks/queries/student/useStudentCalendar";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import RecommendedCoursesCarousel from "@/components/dashboard/RecommendedCoursesCarousel";
import ContinueLearningRow from "@/components/dashboard/ContinueLearningRow";
import RecommendedCourseCard from "@/components/dashboard/RecommendedCourseCard";
import QuickActionButton from "@/components/dashboard/QuickActionButton";
import MobileContinueCard from "@/components/dashboard/MobileContinueCard";
import StudentStatCard from "@/components/dashboard/StudentStatCard";
import UpcomingEventCard from "@/components/dashboard/UpcomingEventCard";
import AchievementItem from "@/components/dashboard/AchievementItem";
import { useAuth } from "@/context/AuthContext";
import { toMinutesSinceMidnight } from "@/lib/dateUtils";
import { QUOTES } from "@/constants/dashboardQuotes";
import { getAchievementsList } from "@/features/student/constants/achievementsConfig";
import { getStatCards } from "@/features/student/constants/dashboardConfig";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: dashboardData, isLoading: isDashboardLoading, isError } = useDashboard();
  const { data: allCourses = [], isLoading: isCoursesLoading } = useCourses();

  const { data: calendarEvents = [], isLoading: isCalendarEventsLoading } = useStudentCalendar();

  const stats = dashboardData?.stats ?? {};
  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];

  const dailyQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  const completedLessonsCount = stats.completedLessons ?? 0;
  const totalLessonsCount = stats.totalLessons ?? 0;
  const completionRate = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  const statCards = getStatCards({
    enrolledCount: enrolledCourses.length,
    completedLessonsCount,
    completionRate,
    certificatesCount: stats.certificatesCount ?? 0,
  });

  const achievementsList = useMemo(() => getAchievementsList(stats), [stats]);
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
  // Capped well above the visible slide count (4 + peek on desktop) so the
  // carousel always has real content to scroll to.
  const recommendedCourses = useMemo(
    () => allCourses.filter((c) => !enrolledCourseIds.has(c.id)).slice(0, 12),
    [allCourses, enrolledCourseIds]
  );

  const topEnrollment = enrolledCourses[0];

  if (isError) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Unable to load student dashboard</h2>
        <p className="mt-2 text-muted-foreground">Please verify your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
      {/* ============================= UNIFIED RESPONSIVE LAYOUT ============================= */}
      <div className="-m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-background p-3 sm:p-6 pt-0 sm:pt-0">
      <div className="flex flex-col max-w-[1600px] mx-auto">

        {/* Stat / KPI Strip */}
        <div className="mt-4 mb-2">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            {statCards.map((s) => (
              <StudentStatCard key={s.key} stat={s} isLoading={isDashboardLoading} variant="desktop" />
            ))}
          </div>
        </div>

        {/* Main grid: content (8/12) + sidebar (4/12) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
          {/* Left main column */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Welcome Hero Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F1A] to-[#12182B] border border-border p-5 shadow-sm flex flex-col md:flex-row items-center justify-between min-h-[140px]">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />

              <div className="relative z-10 w-full md:w-2/3 space-y-2">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-xs font-medium">Welcome back,</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
                    {user?.name ? user.name.split(" ")[0] : "Student"}! <span className="animate-wave origin-bottom-right inline-block text-xl">👋</span>
                  </h1>
                  <p className="text-muted-foreground text-xs">Let&apos;s continue your learning journey. You&apos;ve got this!</p>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 max-w-lg inline-block">
                  <p className="text-primary text-xs font-semibold italic">&quot;{dailyQuote}&quot;</p>
                </div>
              </div>

              <div className="relative z-10 hidden md:flex w-1/3 justify-end items-center gap-3">
                <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-3xl bg-gradient-to-br from-orange-500/15 to-purple-500/15 border border-border flex items-center justify-center shrink-0">
                  <GraduationCap size={40} className="text-primary" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-card border border-border flex items-center justify-center text-purple-400 shadow-lg">
                    <Trophy size={18} />
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-card border border-border flex items-center justify-center text-emerald-400 shadow-lg">
                    <CheckCircle size={18} />
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-card border border-border flex items-center justify-center text-blue-400 shadow-lg">
                    <Activity size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-foreground">Continue Learning</h3>
                <Link href="/student/my-courses" className="text-[11px] text-primary font-bold hover:text-orange-300">
                  View all courses &rarr;
                </Link>
              </div>

              {isDashboardLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[74px] rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground">You have not enrolled in any courses yet.</p>
                  <Link href="/student/courses" className="inline-block mt-3">
                    <button className="px-5 py-2.5 bg-primary hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">
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
            <div className="rounded-2xl bg-card border border-border p-5">
              <RecommendedCoursesCarousel
                title="Recommended for You"
                viewAllHref="/student/courses"
                courses={recommendedCourses}
                isLoading={isCoursesLoading}
                renderCard={(course) => <RecommendedCourseCard course={course} />}
                emptyMessage="No new recommendations right now — you're enrolled in everything available!"
              />
            </div>
          </div>

          {/* Right sidebar column */}
          <div className="xl:col-span-4 flex flex-col gap-6">

            {/* Upcoming */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <CalendarIcon size={14} className="text-primary" />
                  Upcoming (Next 30 Min)
                </h3>
                <Link href="/student/calendar" className="text-[11px] text-primary font-bold hover:text-orange-300">
                  View all
                </Link>
              </div>

              {isCalendarEventsLoading ? (
                <div className="space-y-2.5">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-[54px] rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                    <Clock size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Nothing scheduled for the rest of today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((task) => (
                    <UpcomingEventCard key={task.id} task={task} variant="desktop" />
                  ))}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="mb-2">
                <h3 className="text-sm font-black text-foreground">Calendar</h3>
              </div>
              <div className="dashboard-calendar-wrapper text-foreground scale-[0.95] origin-top">
                <MiniCalendar role="STUDENT" />
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  Recent Achievements
                </h3>
                <Link href="/student/achievements" className="text-[11px] text-primary font-bold hover:text-orange-300">
                  View all
                </Link>
              </div>

              {isDashboardLoading ? (
                <div className="space-y-2.5">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-[54px] rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : unlockedAchievements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Keep learning to unlock your first achievement!</p>
              ) : (
                <div className="space-y-5">
                  {unlockedAchievements.map((ach) => (
                    <AchievementItem key={ach.name} achievement={ach} />
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
