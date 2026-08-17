"use client";

import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";

// import { WelcomeHeroCard } from "@/components/instructor/dashboard/WelcomeHeroCard";
import { InstructorKPIs } from "@/components/instructor/dashboard/InstructorKPIs";
import { CourseOverviewTable } from "@/components/instructor/dashboard/CourseOverviewTable";
import { RecentSubmissionsList } from "@/components/instructor/dashboard/RecentSubmissionsList";
import { PerformancePieChart } from "@/components/instructor/dashboard/PerformancePieChart";
import { UpcomingEventsPanel } from "@/components/instructor/dashboard/UpcomingEventsPanel";
import { DashboardCalendarWidget } from "@/components/instructor/dashboard/DashboardCalendarWidget";
import { RecentActivitiesSidebar } from "@/components/instructor/dashboard/RecentActivitiesSidebar";
import { BatchPerformanceOverviewWidget } from "@/components/instructor/dashboard/BatchPerformanceOverviewWidget";

import {
  useDashboardStats,
  useUpcomingClasses,
  useRecentActivities,
  useCourseProgressOverview,
  useRecentSubmissions,
  useGradeDistribution,
  useEngagementAnalytics,
  useNeedsAttention,
  useAnnouncementsFeed,
} from "@/hooks/queries/instructor/useDashboardHome";
import { useMyLessonQueries } from "@/hooks/queries/instructor/useLessonQueries";
import {
  ChevronRight,
  Radio,
  Plus,
  FolderPlus,
  Video,
  Megaphone,
  BookOpen,
  Users,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

// Mobile-only Quick Actions — same destinations/icons as the desktop
// QUICK_ACTION_ITEMS strip (src/components/instructor/QuickActions/quickActionItems.ts),
// just relabeled to match the compact mobile grid.
const MOBILE_QUICK_ACTIONS = [
  { key: "course", label: "Course", href: "/instructor/courses/create", icon: Plus, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "quiz", label: "Quiz", href: "/instructor/quizzes/create", icon: FolderPlus, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "class", label: "Class", href: "/instructor/calendar", icon: Video, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "announce", label: "Announce", href: "/instructor/announcements", icon: Megaphone, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const SEVERITY_HINT: Record<string, string> = {
  high: "Needs attention now",
  medium: "Review when you can",
  low: "Low priority",
};

interface RecentLessonQuery {
  id: string;
  question: string;
  createdAt?: string;
  lesson?: { module?: { course?: { title?: string } } };
}

function formatQaTime(dateStr?: string) {
  if (!dateStr) return "Recently";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return "Recently";
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function InstructorDashboardHomePage() {
  const { user } = useAuth();

  // Data fetching
  const stats = useDashboardStats();
  const schedule = useUpcomingClasses();
  const activities = useRecentActivities();
  const courses = useCourseProgressOverview();
  const submissions = useRecentSubmissions();
  const grades = useGradeDistribution();
  const engagement = useEngagementAnalytics();
  const needsAttention = useNeedsAttention();
  const announcements = useAnnouncementsFeed();
  const qa = useMyLessonQueries();

  // Extract needed KPIs from the stats payload
  const activeCourses = stats.data?.find(s => s.id === "active-courses")?.value || 0;
  const totalStudents = stats.data?.find(s => s.id === "students")?.value || 0;
  const pendingReviews = stats.data?.find(s => s.id === "pending-reviews")?.value || 0;
  const activeQuizzes = stats.data?.find(s => s.id === "active-quizzes")?.value || 0;
  const todaysClasses = stats.data?.find(s => s.id === "todays-classes")?.value || 0;

  const engagementData = engagement.data ?? [];
  const avgEngagement = engagementData.length > 0
    ? Math.round(engagementData.reduce((acc, point) => acc + (point.lessonCompletion || 0), 0) / engagementData.length)
    : 0;

  const mobileStats = [
    { key: "courses", label: "Courses", value: activeCourses, icon: BookOpen, color: "text-orange-400", bg: "bg-orange-500/10" },
    { key: "students", label: "Students", value: totalStudents, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { key: "classes", label: "Today's Classes", value: todaysClasses, icon: CalendarClock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { key: "pending", label: "Pending Reviews", value: pendingReviews, icon: ClipboardCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const todaysSchedule = schedule.data?.today || [];
  const pendingActions = needsAttention.data || [];
  const recentQa = (qa.data || []).slice(0, 3);
  const recentAnnouncements = (announcements.data || []).slice(0, 3);

  return (
    <TooltipProvider>
      {/* ============================= MOBILE (true mobile-first layout, not a squeezed desktop) ============================= */}
      <div className="sm:hidden -mx-3 -mt-3 px-4 pt-4 pb-2 space-y-5 bg-[#080B11] min-h-[calc(100vh-3.5rem)]">

        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F1A] to-[#12182B] border border-[#1A1F35] p-4 flex items-center justify-between gap-3">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/10 blur-[50px] pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Hi, {user?.name ? user.name.split(" ")[0] : "Instructor"}! <span className="animate-wave origin-bottom-right inline-block text-lg">👋</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Welcome back. Here&apos;s what&apos;s waiting for you today.</p>
          </div>
          <div className="relative z-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500/15 to-purple-500/15 border border-[#1A1F35] flex items-center justify-center shrink-0">
            <GraduationCap size={28} className="text-orange-400" />
          </div>
        </div>

        {/* Compact Overview Cards — exact reuse of the Student Dashboard's
            mobile stat card proportions (h-6 w-6 icon chip, p-2, text-sm value),
            all four in a single row. */}
        <div className="grid grid-cols-4 gap-2">
          {mobileStats.map((s) => (
            <div key={s.key} className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-2">
              <div className={`h-6 w-6 rounded-md ${s.bg} flex items-center justify-center mb-1`}>
                <s.icon size={11} className={s.color} />
              </div>
              {stats.isLoading ? (
                <div className="h-4 w-8 bg-slate-800 rounded animate-pulse" />
              ) : (
                <p className="text-sm font-black text-white leading-none">{s.value}</p>
              )}
              <p className="text-[8.5px] text-slate-400 font-semibold leading-tight mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions — exact reuse of the Student Dashboard's
            QuickActionButton proportions (icon-over-label, py-3, min-h-[44px]),
            all four in a single row. */}
        <div>
          <h2 className="text-sm font-black text-white mb-2.5">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {MOBILE_QUICK_ACTIONS.map((a) => (
              <Link
                key={a.key}
                href={a.href}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] py-3 min-h-[44px] active:scale-95 transition"
              >
                <div className={`h-8 w-8 rounded-full ${a.bg} flex items-center justify-center`}>
                  <a.icon size={15} className={a.color} />
                </div>
                <span className="text-[10px] font-bold text-slate-300">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Schedule — highest priority section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Today&apos;s Schedule</h2>
            <Link href="/instructor/calendar" className="text-[11px] text-orange-400 font-bold">View all</Link>
          </div>

          {schedule.isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((n) => <div key={n} className="h-[62px] rounded-xl bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : todaysSchedule.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
              Nothing scheduled today. Enjoy the breather.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaysSchedule.map((event) => {
                const isLive = event.status === "live";
                const isEnded = event.status === "ended";
                return (
                  <Link
                    key={event.id}
                    href="/instructor/calendar"
                    className="flex items-center gap-2.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3 active:border-slate-700 transition"
                  >
                    <div className="shrink-0 w-[46px]">
                      <p className="text-[10.5px] font-black text-orange-400 leading-tight">{event.time}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{event.title}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {event.courseName}{event.batch ? ` • ${event.batch}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                        isLive
                          ? "bg-rose-500/15 text-rose-400"
                          : isEnded
                            ? "bg-slate-700/40 text-slate-400"
                            : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {isLive && <Radio size={8} />}
                      {isLive ? "Live" : isEnded ? "Ended" : "Scheduled"}
                    </span>
                    <ChevronRight size={15} className="text-slate-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Reviews */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Pending Reviews</h2>
            <Link href="/instructor/assignments" className="text-[11px] text-orange-400 font-bold">View all</Link>
          </div>

          {needsAttention.isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((n) => <div key={n} className="h-[58px] rounded-xl bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : pendingActions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
              Nothing needs your attention right now.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingActions.slice(0, 4).map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[#141930] border border-[#1A1F35] flex items-center justify-center shrink-0 text-orange-400">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white leading-snug line-clamp-2">{action.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{SEVERITY_HINT[action.severity] ?? "Needs review"}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Q&A */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Recent Q&amp;A</h2>
            <Link href="/instructor/qa" className="text-[11px] text-orange-400 font-bold">View all</Link>
          </div>

          {qa.isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((n) => <div key={n} className="h-[58px] rounded-xl bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : recentQa.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
              No open questions right now.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentQa.map((q: RecentLessonQuery) => (
                <Link
                  key={q.id}
                  href="/instructor/qa"
                  className="flex items-start gap-3 rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2">{q.question}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-1">
                      {q.lesson?.module?.course?.title || "General"} • {formatQaTime(q.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 mt-0.5 text-[8.5px] font-black uppercase tracking-wide px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">
                    Unread
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-white">Recent Announcements</h2>
            <Link href="/instructor/announcements" className="text-[11px] text-orange-400 font-bold">View all</Link>
          </div>

          {announcements.isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((n) => <div key={n} className="h-[62px] rounded-xl bg-slate-800/50 animate-pulse" />)}
            </div>
          ) : recentAnnouncements.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-xl">
              No announcements posted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAnnouncements.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl bg-[#0D1021] border border-[#1A1F35] p-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                    <Megaphone size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{a.title}</p>
                    {a.body && <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{a.body}</p>}
                    <p className="text-[9.5px] text-slate-600 mt-1">{a.postedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================= DESKTOP / TABLET (unchanged) ============================= */}
      <div className="hidden sm:block -m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-[#080B11] p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex flex-col max-w-[1600px] mx-auto">

          <div className="mt-4 mb-2">
            <InstructorKPIs
              coursesCount={Number(activeCourses)}
              studentsCount={Number(totalStudents)}
              pendingAssignments={Number(pendingReviews)}
              activeQuizzes={Number(activeQuizzes)}
              engagementPercentage={Number(avgEngagement)}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
            {/* Left Main Column (occupies 8/12 on large screens) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              {/* <WelcomeHeroCard instructorName={user?.name || "Instructor"} /> */}

              <CourseOverviewTable
                courses={courses.data}
                isLoading={courses.isLoading}
              />

              {/* Bottom Row inside Main Column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentSubmissionsList
                  submissions={submissions.data}
                  isLoading={submissions.isLoading}
                />
                <PerformancePieChart
                  data={grades.data}
                  isLoading={grades.isLoading}
                />
              </div>

              <BatchPerformanceOverviewWidget />
            </div>

            {/* Right Sidebar Column (occupies 4/12 on large screens) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <UpcomingEventsPanel
                events={schedule.data?.today || []}
                isLoading={schedule.isLoading}
              />

              <DashboardCalendarWidget />

              <RecentActivitiesSidebar
                activities={activities.data || []}
                isLoading={activities.isLoading}
              />
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
