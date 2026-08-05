"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Layers,
  Video,
  ClipboardList,
  TrendingUp,
  Award,
  Search,
  BookOpen,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
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
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">Unable to load your courses</h2>
        <p className="mt-2 text-slate-400">Please try again later.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="My Courses" subtitle="Manage and continue your enrolled courses." />

      {enrolledCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#0D1021] p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={26} className="text-orange-400" />
          </div>
          <h3 className="text-sm font-bold text-white">You haven&apos;t enrolled in any courses yet.</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Browse the course catalog and enroll to see your courses here.
          </p>
          <Link href="/student/courses" className="inline-block mt-5">
            <button className="px-5 py-2.5 min-h-[44px] bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer">
              Browse Courses
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: compact grid, same card recipe as the Dashboard's stat cards.
              Odd item count (5) — the last card spans both columns instead of
              leaving an empty cell in the last row. */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {kpis.map((k, idx) => (
              <div
                key={k.key}
                className={`rounded-xl bg-[#0D1021] border border-[#1A1F35] p-2 ${
                  idx === kpis.length - 1 && kpis.length % 2 === 1 ? "col-span-2" : ""
                }`}
              >
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
                className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-3 shadow-sm hover:border-slate-700 transition"
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

          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-[#0D1021] border border-[#1A1F35] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition"
              />
            </div>

            <div className="flex gap-2.5 overflow-x-auto scrollbar-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shrink-0 bg-[#0D1021] border border-[#1A1F35] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="shrink-0 bg-[#0D1021] border border-[#1A1F35] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
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
                className="shrink-0 bg-[#0D1021] border border-[#1A1F35] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
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
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-[#1A1F35] rounded-2xl">
                  No courses found matching your search or filters.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredCourses.map((enrollment, index) => (
                    <MyCourseCard key={enrollment.id} enrollment={enrollment} index={index} />
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
