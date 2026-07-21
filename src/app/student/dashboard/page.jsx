"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  Flame,
  ChevronRight,
  ClipboardList,
  Trophy,
  Calendar,
  Activity,
  PlayCircle,
  Video,
  Award as CertificateIcon,
  Search,
  ExternalLink,
  Target,
  Sparkles,
  Play,
  LayoutGrid
} from "lucide-react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import useUpcomingTasks from "@/hooks/queries/student/useUpcomingTasks";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const { data: dashboardData, isLoading: isDashboardLoading, isError } = useDashboard();
  const { data: assignments = [], isLoading: isAssignmentsLoading } = useAssignments();
  const { data: quizzes = [], isLoading: isQuizzesLoading } = useQuizzes();
  const { data: upcomingTasksList = [], isLoading: isTasksLoading } = useUpcomingTasks();

  const stats = dashboardData?.stats ?? {};
  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];

  // Determine last active course
  const lastActiveCourse = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return null;
    const sortedEnrollments = [...enrolledCourses].sort(
      (a, b) =>
        new Date(b.lastAccessedAt ?? b.enrolledAt) -
        new Date(a.lastAccessedAt ?? a.enrolledAt)
    );
    return sortedEnrollments[0];
  }, [enrolledCourses]);

  // Derived counts for Quick Actions / Tasks
  const pendingAssignments = useMemo(() => {
    return assignments.filter(a => a.status !== "Submitted" && a.status !== "Graded");
  }, [assignments]);

  const newQuizzes = useMemo(() => {
    return quizzes.filter(q => !q.quizSubmissions?.[0]);
  }, [quizzes]);

  const liveSessions = useMemo(() => {
    return upcomingTasksList.filter(
      (task) =>
        (task.type || "").toUpperCase() === "LIVE_CLASS" ||
        (task.type || "").toUpperCase() === "BATCH"
    );
  }, [upcomingTasksList]);

  // Static list of achievements indicators
  const achievementsList = useMemo(() => {
    return [
      { name: "Quiz Master", icon: "🏆", active: (stats.avgQuizScore ?? 0) >= 90 },
      { name: "Week Warrior", icon: "⚡", active: (stats.streak ?? 0) >= 3 },
      { name: "Top Learner", icon: "🧠", active: (stats.completedLessons ?? 0) >= 5 }
    ];
  }, [stats]);

  if (isError) {
    return (
      <Card className="p-8 text-center border border-slate-800 bg-slate-900/60">
        <h2 className="text-xl font-bold text-red-500">Unable to load student dashboard</h2>
        <p className="mt-2 text-slate-400">Please verify your connection and try again.</p>
      </Card>
    );
  }

  const isAnyLoading = isDashboardLoading || isAssignmentsLoading || isQuizzesLoading || isTasksLoading;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      
      {/* Page Header banner */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.name ? user.name.split(" ")[0] : "Student"}! 👋
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Let's continue your learning journey. You've got this!
          </p>
        </div>
      </div>

      {/* Main 3x2 Grid of Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: My Courses */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3.5 mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">My Courses</h3>
              {isDashboardLoading ? (
                <div className="h-5 bg-slate-800 w-16 rounded animate-pulse" />
              ) : (
                <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  {enrolledCourses.length} Enrolled
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center py-2">
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-2.5">
              Last Content Viewed
            </span>

            {isDashboardLoading ? (
              <div className="rounded-xl border border-slate-800/50 bg-slate-955/40 p-3.5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 items-center animate-pulse">
                <div className="w-full sm:w-2/5 lg:w-full xl:w-2/5 aspect-[4/3] rounded-lg bg-slate-800 shrink-0" />
                <div className="flex-1 w-full space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full" />
                    <div className="h-2.5 bg-slate-800 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ) : lastActiveCourse ? (
              <div className="rounded-xl border border-slate-800/50 bg-slate-955/40 p-3.5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 items-center">
                {/* Left side: Thumbnail with play overlay */}
                <div className="w-full sm:w-2/5 lg:w-full xl:w-2/5 aspect-[4/3] rounded-lg relative overflow-hidden bg-teal-955 flex items-center justify-center shrink-0 border border-slate-800/60">
                  <img
                    src="/last_content_viewed_mock.png"
                    alt={lastActiveCourse.course?.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-teal-955/10 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-200 cursor-pointer">
                      <Play size={12} className="text-slate-900 fill-slate-900 ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-1.5 left-1.5 rounded bg-black/75 px-1.5 py-0.5 flex items-center gap-1 text-[8px] font-bold text-white border border-white/5">
                    <Clock size={8} className="text-slate-300" />
                    <span>24:35</span>
                  </div>
                </div>

                {/* Right side: Course Info */}
                <div className="flex-1 w-full space-y-1.5 min-w-0">
                  <h4 className="text-sm font-black text-white leading-tight truncate">
                    {lastActiveCourse.course?.title}
                  </h4>
                  <p className="text-xs text-slate-450 font-medium truncate">
                    Introduction to Testing
                  </p>
                  <p className="text-xs text-slate-550 font-bold">
                    <span className="text-purple-400 font-black">Category:</span> <span className="text-slate-300 font-medium">{lastActiveCourse.course?.category || "Software Testing"}</span>
                  </p>
                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-955 h-1.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${lastActiveCourse.progress}%`, backgroundColor: '#a855f7' }}
                      />
                    </div>
                    <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider block">
                      {lastActiveCourse.progress}% Completed
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-555 border border-dashed border-slate-800 rounded-xl">
                You have not enrolled in any courses yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/40 flex flex-col sm:flex-row gap-2">
            {isDashboardLoading ? (
              <div className="w-full h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : lastActiveCourse ? (
              <>
                <Link href={`/student/learn/${lastActiveCourse.courseId}`} className="flex-1">
                  <button className="w-full py-2.5 px-2 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap">
                    <Play size={12} className="fill-slate-950 text-slate-950" />
                    <span>Continue Learning</span>
                  </button>
                </Link>
                <Link href="/student/my-courses" className="flex-1">
                  <button className="w-full py-2.5 px-2 bg-slate-950/60 hover:bg-slate-900/60 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer whitespace-nowrap">
                    <LayoutGrid size={12} className="text-purple-400" />
                    <span>View All Courses</span>
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/student/courses" className="w-full">
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center border border-slate-700/60 cursor-pointer">
                  Explore Courses
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Card 2: Quick Actions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Quick Actions</h3>
              <Sparkles size={16} className="text-orange-400" />
            </div>

            <div className="space-y-3">
              {isAnyLoading ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[52px] bg-slate-950/40 border border-slate-800 rounded-xl animate-pulse flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-800 h-8 w-8" />
                        <div className="h-3 bg-slate-800 rounded w-24" />
                      </div>
                      <div className="h-4 bg-slate-800 rounded w-6" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* New Quizzes */}
                  <Link
                    href="/student/quizzes"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-955/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
                        <BookOpen size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-200">New Quizzes</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-slate-900 text-orange-400 border border-slate-800">
                      {newQuizzes.length}
                    </span>
                  </Link>

                  {/* New Assignments */}
                  <Link
                    href="/student/assignments"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-955/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                        <ClipboardList size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-200">New Assignments</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-slate-900 text-purple-400 border border-slate-800">
                      {pendingAssignments.length}
                    </span>
                  </Link>

                  {/* New Assessments / Exams */}
                  <Link
                    href="/student/calendar"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-955/60 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                        <Target size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-200">New Assessments</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-slate-900 text-blue-400 border border-slate-800">
                      {upcomingTasksList.filter(t => t.type === "exam").length}
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/40">
            <Link href="/student/quizzes" className="block w-full">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer">
                Self Generate Quiz
              </button>
            </Link>
          </div>
        </div>

        {/* Card 3: Schedules */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Schedules</h3>
              <Calendar size={16} className="text-purple-400" />
            </div>

            <div className="space-y-3.5 max-h-[185px] overflow-y-auto pr-1">
              {isTasksLoading ? (
                <>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-[46px] bg-slate-950/30 border border-slate-800/60 rounded-xl animate-pulse flex justify-between items-center p-2">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="h-3 bg-slate-800 rounded w-2/3" />
                        <div className="h-2 bg-slate-800 rounded w-1/3" />
                      </div>
                      <div className="h-4 bg-slate-800 rounded w-10 shrink-0" />
                    </div>
                  ))}
                </>
              ) : upcomingTasksList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-550">
                  🎉 No classes or events scheduled this week.
                </div>
              ) : (
                upcomingTasksList.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex justify-between items-center gap-2 p-2 rounded-xl bg-slate-950/30 border border-slate-800/60">
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{task.title}</h5>
                      <span className="text-[9px] text-slate-500 font-semibold block uppercase mt-0.5">
                        {task.date} • {task.time}
                      </span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black uppercase shrink-0">
                      {task.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/40">
            <Link href="/student/calendar" className="block w-full">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer">
                View Calendar Events
              </button>
            </Link>
          </div>
        </div>

        {/* Card 4: Batches & Live Sessions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Batches & Live</h3>
              <Video size={16} className="text-orange-500" />
            </div>

            <div className="space-y-4">
              {isTasksLoading ? (
                <>
                  <div className="h-[62px] bg-slate-955/60 border border-slate-800 rounded-xl animate-pulse flex items-center justify-between p-3.5">
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-800 rounded w-16" />
                      <div className="h-3.5 bg-slate-800 rounded w-32" />
                    </div>
                    <div className="h-8 w-8 bg-slate-800 rounded-lg shrink-0" />
                  </div>
                  <div className="h-[74px] border border-slate-800 bg-slate-955/20 rounded-xl animate-pulse p-3.5 space-y-2">
                    <div className="h-2 bg-slate-800 rounded w-24" />
                    <div className="h-3 bg-slate-800 rounded w-2/3" />
                  </div>
                </>
              ) : (
                <>
                  {/* Student Batch Detail */}
                  <div className="p-3.5 rounded-xl bg-slate-955/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-505 uppercase font-extrabold tracking-wider">Active Batch</span>
                      <h4 className="text-sm font-extrabold text-white mt-0.5">{user?.batchName ?? "Java Full Stack LR-01"}</h4>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20">
                      <GraduationCap size={16} />
                    </div>
                  </div>

                  {/* Next Live session indicator */}
                  {liveSessions.length > 0 ? (
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-955/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider">Live Session Scheduled</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-300 leading-snug">{liveSessions[0].title}</h5>
                      <p className="text-[9px] text-slate-500 font-semibold">{liveSessions[0].date} at {liveSessions[0].time}</p>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-550 border border-dashed border-slate-800 rounded-xl">
                      No upcoming live sessions this week.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/40">
            {liveSessions.length > 0 && liveSessions[0].meetingLink ? (
              <a href={liveSessions[0].meetingLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-655 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                  Join Live Session
                </button>
              </a>
            ) : (
              <Link href="/student/live-classes" className="block w-full">
                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer">
                  View Live Schedule
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Card 5: Reports & Results */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Reports & Results</h3>
              <Trophy size={16} className="text-yellow-400" />
            </div>

            {isDashboardLoading ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                <div className="p-3 bg-slate-955/60 border border-slate-800 rounded-xl flex flex-col items-center justify-center h-[62px] space-y-1.5">
                  <div className="h-2 bg-slate-805 rounded w-16" />
                  <div className="h-4 bg-slate-805 rounded w-8" />
                </div>
                <div className="p-3 bg-slate-955/60 border border-slate-800 rounded-xl flex flex-col items-center justify-center h-[62px] space-y-1.5">
                  <div className="h-2 bg-slate-805 rounded w-20" />
                  <div className="h-4 bg-slate-805 rounded w-10" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-955/60 border border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Avg Quiz Score</span>
                  <div className="text-xl font-black text-white mt-1.5">{stats.avgQuizScore ?? 78}%</div>
                </div>

                <div className="p-3 bg-slate-955/60 border border-slate-800 rounded-xl text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Lessons Finished</span>
                  <div className="text-xl font-black text-white mt-1.5">
                    {stats.completedLessons ?? 0}/{stats.totalLessons ?? 5}
                  </div>
                </div>
              </div>
            )}

            {isDashboardLoading ? (
              <div className="h-10 mt-4 rounded-xl bg-slate-800 animate-pulse" />
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs text-center flex items-center justify-center gap-1.5 font-bold">
                <span>📈</span>
                <span>Avg Passing Rate: 100% on attempted tests</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/40">
            <Link href="/student/quizzes" className="block w-full">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer">
                View Performance Reports
              </button>
            </Link>
          </div>
        </div>

        {/* Card 6: Certificates & Achievements */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Certificates & Badges</h3>
              <Award size={16} className="text-emerald-400" />
            </div>
            <div className="space-y-4">
              {isDashboardLoading ? (
                <>
                  <div className="h-[52px] bg-slate-955/60 border border-slate-800 rounded-xl animate-pulse flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-800 h-8 w-8" />
                      <div className="h-3 bg-slate-800 rounded w-28" />
                    </div>
                    <div className="h-4 bg-slate-800 rounded w-6" />
                  </div>
                  <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
                </>
              ) : (
                <>
                  {/* Certificates count card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-955/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
                        <CertificateIcon size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-200">Earned Certificates</span>
                    </div>
                    <span className="text-xs font-black text-white">{stats.certificatesCount ?? 0}</span>
                  </div>

                  {/* Achievements row preview */}
                  <div className="flex items-center justify-between gap-1.5 px-1 py-1">
                    {achievementsList.map((ach, idx) => (
                      <div
                        key={idx}
                        title={ach.name}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm border shadow-sm transition-transform hover:scale-105 duration-200 cursor-help ${
                          ach.active
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/25"
                            : "bg-slate-800/20 border-slate-800 text-slate-650 opacity-30"
                        }`}
                      >
                        {ach.icon}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/40">
            <Link href="/student/certificates" className="block w-full">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-1.5 border border-slate-700/60 cursor-pointer">
                View My Certificates
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}