"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Video,
  ClipboardList,
  TrendingUp,
  Award,
  Search,
  BookOpen,
  CheckCircle2,
  Circle,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import useCourses from "@/hooks/queries/student/useCourses";
import useMyCourses from "@/hooks/queries/student/useMyCourses";
import { useNotification } from "@/context/NotificationContext";
import { getCalendarEvents } from "@/services/calendar.service";
import MyCourseCard from "@/components/student/my-courses/MyCourseCard";
import CoursesSidebar from "@/components/student/my-courses/CoursesSidebar";

const toLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isPendingAssignment = (a) => a.status !== "Submitted" && a.status !== "Graded";

export default function MyCoursesPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading, isError } = useDashboard();
  const { data: assignments = [] } = useAssignments();
  const { notifications = [] } = useNotification();
  // The dashboard's enrolledCoursesList only carries a thin course object
  // (no thumbnail/category/module-quiz counts) — the catalog and enrollments
  // endpoints fill those gaps for the card, same merge used on Browse Courses.
  const { data: catalogCourses = [] } = useCourses();
  const { data: myEnrollments = [] } = useMyCourses();
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const catalogById = useMemo(() => new Map(catalogCourses.map((c) => [c.id, c])), [catalogCourses]);
  const lastAccessedByCourseId = useMemo(
    () => new Map(myEnrollments.map((e) => [e.course?.id || e.courseId, e.lastAccessedAt])),
    [myEnrollments]
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];
  const stats = dashboardData?.stats ?? {};

  const todayStr = toLocalDateString(new Date());

  const instructors = useMemo(
    () => Array.from(new Set(enrolledCourses.map((e) => e.course?.instructor).filter(Boolean))),
    [enrolledCourses]
  );

  const filteredCourses = useMemo(() => {
    let list = enrolledCourses.map((e) => {
      const catalogCourse = catalogById.get(e.course?.id);
      return {
        ...e,
        lastAccessedAt: lastAccessedByCourseId.get(e.course?.id),
        // Merge in the richer catalog fields, but never let a missing
        // catalog thumbnail blank out the one the dashboard already gave us.
        course: { ...e.course, ...catalogCourse, thumbnailUrl: catalogCourse?.thumbnailUrl || e.course?.thumbnailUrl },
      };
    });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.course?.title?.toLowerCase().includes(q));
    }
    if (statusFilter === "in-progress") {
      list = list.filter((e) => (e.progress ?? 0) < 100);
    } else if (statusFilter === "completed") {
      list = list.filter((e) => (e.progress ?? 0) >= 100);
    }
    if (instructorFilter !== "all") {
      list = list.filter((e) => e.course?.instructor === instructorFilter);
    }

    const sorted = [...list];
    if (sortBy === "progress") {
      sorted.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    } else if (sortBy === "name") {
      sorted.sort((a, b) => (a.course?.title || "").localeCompare(b.course?.title || ""));
    }
    return sorted;
  }, [enrolledCourses, catalogById, lastAccessedByCourseId, search, statusFilter, instructorFilter, sortBy]);

  const todaysClassesCount = useMemo(
    () => calendarEvents.filter((e) => e.date === todayStr).length,
    [calendarEvents, todayStr]
  );

  const pendingAssignmentsCount = useMemo(() => assignments.filter(isPendingAssignment).length, [assignments]);

  const averageProgress = useMemo(() => {
    if (enrolledCourses.length === 0) return 0;
    return Math.round(enrolledCourses.reduce((sum, e) => sum + (e.progress ?? 0), 0) / enrolledCourses.length);
  }, [enrolledCourses]);

  const progressSummary = useMemo(() => {
    const completed = enrolledCourses.filter((e) => (e.progress ?? 0) >= 100).length;
    const notStarted = enrolledCourses.filter((e) => (e.progress ?? 0) === 0).length;
    const inProgress = enrolledCourses.length - completed - notStarted;
    return { completed, inProgress, notStarted, overall: averageProgress };
  }, [enrolledCourses, averageProgress]);

  const announcementNotifications = useMemo(
    () => notifications.filter((n) => (n.type || "").toUpperCase() === "ANNOUNCEMENT"),
    [notifications]
  );

  const sidebarNextClass = useMemo(() => {
    return (
      calendarEvents
        .filter((e) => e.date === todayStr)
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))[0] || null
    );
  }, [calendarEvents, todayStr]);

  // Mobile-only compact 2x2 grid. "Draft"/"Archived" aren't real states for a
  // student's enrollments (those are course-authoring states) — these four
  // reuse the same real, already-computed progressSummary/stats fields and
  // the same status colors as the course cards below (amber/emerald/sky/orange).
  const mobileStats = [
    { key: "inProgress", label: "In Progress", value: progressSummary.inProgress, icon: TrendingUp, bg: "bg-amber-500/10", color: "text-amber-400" },
    { key: "completed", label: "Completed", value: progressSummary.completed, icon: CheckCircle2, bg: "bg-emerald-500/10", color: "text-emerald-400" },
    { key: "notStarted", label: "Not Started", value: progressSummary.notStarted, icon: Circle, bg: "bg-sky-500/10", color: "text-sky-400" },
    { key: "certificates", label: "Certificates", value: stats.certificatesCount ?? 0, icon: Award, bg: "bg-orange-500/10", color: "text-orange-400" },
  ];

  const kpis = [
    {
      key: "courses",
      label: "Active Courses",
      value: enrolledCourses.length,
      icon: Layers,
      bg: "bg-purple-500/10",
      color: "text-purple-400",
      subtitle: "Enrolled",
    },
    {
      key: "todayClasses",
      label: "Today's Classes",
      value: todaysClassesCount,
      icon: Video,
      bg: "bg-blue-500/10",
      color: "text-blue-400",
      subtitle: todaysClassesCount > 0 ? "Scheduled today" : "None today",
    },
    {
      key: "assignments",
      label: "Upcoming Assignments",
      value: pendingAssignmentsCount,
      icon: ClipboardList,
      bg: "bg-amber-500/10",
      color: "text-amber-400",
      subtitle: "Pending",
    },
    {
      key: "progress",
      label: "Avg. Progress",
      value: `${averageProgress}%`,
      icon: TrendingUp,
      bg: "bg-emerald-500/10",
      color: "text-emerald-400",
      subtitle: "Across all courses",
    },
    {
      key: "certificates",
      label: "Certificates",
      value: stats.certificatesCount ?? 0,
      icon: Award,
      bg: "bg-orange-500/10",
      color: "text-orange-400",
      subtitle: "Earned",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Unable to load your courses"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <PageHeader title="My Courses" subtitle="Manage and continue your enrolled courses." />

      {enrolledCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="You haven't enrolled in any courses yet."
          description="Browse the course catalog and enroll to see your courses here."
          actionText="Browse Courses"
          onAction={() => router.push("/student/courses")}
        />
      ) : (
        <>
          {/* Mobile: compact 2x2 grid, same card recipe as the Dashboard's stat cards. */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {mobileStats.map((k) => (
              <div key={k.key} className="rounded-xl bg-card border border-card-border p-2">
                <div className={`h-6 w-6 rounded-md ${k.bg} flex items-center justify-center mb-1`}>
                  <k.icon size={11} className={k.color} />
                </div>
                <p className="text-sm font-black text-white leading-none">{k.value}</p>
                <p className="text-[8.5px] text-slate-400 font-semibold leading-tight mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Desktop / tablet: full stat row with subtitle */}
          <div className="hidden sm:flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
            {kpis.map((k) => (
              <div
                key={k.key}
                className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-card border border-card-border p-3 shadow-sm hover:border-slate-700 transition"
              >
                <div className={`p-2 rounded-xl ${k.bg} shrink-0`}>
                  <k.icon size={16} className={k.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{k.label}</p>
                  <p className="text-lg font-black text-white leading-none mt-0.5">{k.value}</p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 truncate">{k.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filters — mobile: compact 2-row stack, no horizontal
              scrolling (search + status filter, then instructor + sort). */}
          <div className="sm:hidden space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full bg-card border border-card-border rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shrink-0 w-[104px] bg-card border border-card-border rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="flex-1 min-w-0 bg-card border border-card-border rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Instructors</option>
                {instructors.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 min-w-0 bg-card border border-card-border rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="recent">Sort: Recent</option>
                <option value="progress">Sort: Progress</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          {/* Search + Filters — desktop/tablet: unchanged single row */}
          <div className="hidden sm:flex sm:flex-col lg:flex-row gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-card border border-card-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition"
              />
            </div>

            <div className="flex gap-2.5 overflow-x-auto scrollbar-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shrink-0 bg-card border border-card-border rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="shrink-0 bg-card border border-card-border rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Instructors</option>
                {instructors.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shrink-0 bg-card border border-card-border rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="recent">Sort: Recently Joined</option>
                <option value="progress">Sort: Progress</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          {/* Course Cards + Sidebar */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
            <div className="min-w-0">
              {filteredCourses.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-card-border rounded-2xl">
                  No courses found matching your search or filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredCourses.map((enrollment) => (
                    <MyCourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </div>

            <div className="xl:sticky xl:top-4">
              <CoursesSidebar
                nextClass={sidebarNextClass}
                announcements={announcementNotifications}
                progressSummary={progressSummary}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
