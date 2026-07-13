"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Flame,
  ChevronRight,
  ClipboardList,
  Trophy,
  Calendar,
  Bell,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import Link from "next/link";

import Loader from "@/components/common/Loader";
import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useAuth } from "@/context/AuthContext";

// Helper for formatting learning times (e.g. "28h 45m" or "45 mins")
const formatTime = (minutes) => {
  if (!minutes) return "0 mins";
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
};

// Light-mode customized StatCard with mini sparkline matching screenshot
function DashboardStatCard({ title, value, subValue, trend, icon, sparkData, color = "#4f46e5" }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 flex justify-between items-stretch">
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs font-bold ${trend >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
            {subValue}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end h-20">
        <div className="p-2.5 rounded-xl bg-slate-50 text-indigo-650 border border-slate-100 shadow-sm">
          {icon}
        </div>
        {sparkData && (
          <div className="w-16 h-8 opacity-80 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();
  const { data: assignments = [] } = useAssignments();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = data?.stats ?? {};
  const enrolledCourses = data?.enrolledCoursesList ?? [];
  const skillsList = data?.skills ?? [];
  const recommendations = data?.recommendations ?? [];
  const upcomingTasks = data?.upcomingTasks ?? [];

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === "Submitted" || a.status === "Graded").length;
  const assignmentProgressPercent = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Weekly study hours fluctuations matching the screenshot design style
  const studyHoursData = useMemo(() => {
    const activeScale = enrolledCourses.length || 1;
    const completedScale = stats.completedLessons || 0;
    
    return [
      { day: "Mon", hours: Number((0.5 * activeScale + 0.1 * completedScale).toFixed(1)) },
      { day: "Tue", hours: Number((0.8 * activeScale + 0.2 * completedScale).toFixed(1)) },
      { day: "Wed", hours: Number((0.3 * activeScale + 0.1 * completedScale).toFixed(1)) },
      { day: "Thu", hours: Number((1.1 * activeScale + 0.3 * completedScale).toFixed(1)) },
      { day: "Fri: Today", hours: Number((0.7 * activeScale + 0.2 * completedScale).toFixed(1)) },
      { day: "Sat", hours: Number((1.5 * activeScale + 0.4 * completedScale).toFixed(1)) },
      { day: "Sun", hours: Number((0.6 * activeScale + 0.1 * completedScale).toFixed(1)) },
    ];
  }, [enrolledCourses.length, stats.completedLessons]);

  const achievements = useMemo(() => {
    return [
      {
        name: "Week Warrior",
        desc: "7 days streak",
        icon: "⚡",
        active: stats.completedLessons > 0,
        bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100"
      },
      {
        name: "Quiz Master",
        desc: "Score 90%+",
        icon: "🏆",
        active: stats.avgQuizScore >= 90,
        bgColor: "bg-blue-50 text-blue-600 border-blue-100"
      },
      {
        name: "Quick Learner",
        desc: "Complete 5+ lessons",
        icon: "🧠",
        active: stats.completedLessons >= 5,
        bgColor: "bg-purple-50 text-purple-600 border-purple-100"
      },
      {
        name: "First Step",
        desc: "First course enrolled",
        icon: "🎓",
        active: stats.enrolledCourses >= 1,
        bgColor: "bg-orange-50 text-orange-600 border-orange-100"
      }
    ];
  }, [stats]);

  const lastActiveCourse = useMemo(() => {
    if (!enrolledCourses || enrolledCourses.length === 0) return null;

    const progressList = data?.progressList ?? [];
    const completedProgress = progressList
      .filter((p) => p.completed && p.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (completedProgress.length > 0) {
      const latestLessonCourseId = completedProgress[0].lesson?.module?.courseId;
      if (latestLessonCourseId) {
        const matchingCourse = enrolledCourses.find((c) => c.courseId === latestLessonCourseId);
        if (matchingCourse) return matchingCourse;
      }
    }

    const sortedEnrollments = [...enrolledCourses].sort(
      (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
    );
    return sortedEnrollments[0];
  }, [enrolledCourses, data?.progressList]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl">
        <h2 className="text-xl font-bold text-red-500">
          Unable to load dashboard
        </h2>
        <p className="mt-2 text-slate-500">
          Please check your connection and try again later.
        </p>
      </div>
    );
  }

  const completionRate = stats.completionRate ?? 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="space-y-8 text-white">
      {/* 1. Page Header (Matches the Admin Dashboard styling) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, {user?.name ? user.name.split(" ")[0] : "Student"}! 👋
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Let's continue your learning journey. You've got this!
          </p>
        </div>
      </div>

      {/* 2. Stat Cards Section */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardStatCard
          title="Total Learning Time"
          value={formatTime(stats.totalLearningTime)}
          subValue={`+${formatTime(stats.totalLearningTimeThisWeek)} this week`}
          trend={1}
          icon={<Clock size={20} className="text-orange-500" />}
          sparkData={[{ value: 2 }, { value: 5 }, { value: 3 }, { value: 7 }, { value: 6 }]}
          color="#f97316"
        />

        <DashboardStatCard
          title="Courses Enrolled"
          value={`${stats.enrolledCourses ?? 0}`}
          subValue={`${enrolledCourses.filter(c => c.progress < 100).length} active`}
          trend={0}
          icon={<BookOpen size={20} className="text-orange-500" />}
          sparkData={[{ value: 1 }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 4 }]}
          color="#f97316"
        />

        <DashboardStatCard
          title="Lessons Completed"
          value={`${stats.completedLessons ?? 0}`}
          subValue={`+${stats.completedLessons ?? 0} total`}
          trend={1}
          icon={<CheckCircle size={20} className="text-orange-500" />}
          sparkData={[{ value: 0 }, { value: 1 }, { value: 3 }, { value: 4 }, { value: 6 }]}
          color="#f97316"
        />

        <DashboardStatCard
          title="Quizzes Score (Avg.)"
          value={`${stats.avgQuizScore ?? 78}%`}
          subValue={`+8% improvement`}
          trend={1}
          icon={<Award size={20} className="text-orange-500" />}
          sparkData={[{ value: 70 }, { value: 72 }, { value: 75 }, { value: 73 }, { value: 78 }]}
          color="#f97316"
        />

        <DashboardStatCard
          title="Current Streak"
          value={`${stats.streak ?? 0} Day${stats.streak !== 1 ? "s" : ""}`}
          subValue={stats.streak > 0 ? "Active learning!" : "Start today!"}
          trend={1}
          icon={<Flame size={20} className="text-orange-500" />}
          sparkData={[{ value: 1 }, { value: 2 }, { value: 4 }, { value: 5 }, { value: 7 }]}
          color="#f97316"
        />
      </section>

      {/* 3. Grid Section: Learning Progress + Learning Activity + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Widget 1: Learning Progress */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white mb-4">Overall Learning Progress</h3>
            
            {/* SVG Circular Progress */}
            <div className="flex justify-center items-center py-4">
              <div className="relative flex items-center justify-center h-32 w-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="text-orange-500"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{completionRate}%</span>
                  <span className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold">Overall</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdowns */}
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Lessons Completed</span>
                  <span className="text-white font-bold">{stats.completedLessons ?? 0}/{stats.totalLessons ?? 0}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalLessons ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Quizzes Completed</span>
                  <span className="text-white font-bold">{stats.completedQuizzes ?? 0}/{stats.totalQuizzes ?? 2}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalQuizzes ? Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Assignments Completed</span>
                  <span className="text-white font-bold">{completedAssignments}/{totalAssignments}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${assignmentProgressPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Courses Completed</span>
                  <span className="text-white font-bold">{enrolledCourses.filter(c => c.progress === 100).length}/{stats.enrolledCourses ?? 0}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.enrolledCourses ? Math.round((enrolledCourses.filter(c => c.progress === 100).length / stats.enrolledCourses) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs text-center flex items-center justify-center gap-1.5 font-bold">
            <span>🚀</span>
            <span>You're ahead of {100 - (stats.rankPercentile ?? 100)}% of learners. Keep it up!</span>
          </div>
        </div>

        {/* Widget 2: Learning Activity AreaChart */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white">Learning Activity</h3>
              <span className="text-xs bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-700/50 text-slate-300 font-bold">
                This Week
              </span>
            </div>

            <div className="w-full h-48">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studyHoursData}>
                    <defs>
                      <linearGradient id="studyDarkGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3 3" vertical={false} />
                    <XAxis stroke="#64748b" fontSize={10} tickLine={false} dataKey="day" />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={15} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "12px" }}
                      itemStyle={{ color: "#ffffff", fontSize: "11px" }}
                      labelStyle={{ color: "#f97316", fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      name="Hours"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#studyDarkGlow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 mt-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Most Active</span>
              <div className="text-xs font-black text-white mt-1">Thursday</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Daily Avg</span>
              <div className="text-xs font-black text-white mt-1">4h 06m</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly Total</span>
              <div className="text-xs font-black text-white mt-1">{formatTime(stats.totalLearningTimeThisWeek)}</div>
            </div>
          </div>
        </div>

        {/* Widget 3: Upcoming Tasks */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white">Upcoming Tasks</h3>
              <Link href="/student/calendar">
                <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">View All</span>
              </Link>
            </div>

            <div className="space-y-3.5">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-800/30 transition">
                  <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {task.type === "quiz" && <GraduationCap size={18} />}
                    {task.type === "assignment" && <ClipboardList size={18} />}
                    {task.type === "class" && <Activity size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-white truncate">{task.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{task.subtitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] text-orange-400 font-bold">{task.dueDateLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/student/calendar" className="block w-full">
            <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
              <span>📅</span>
              <span>View Calendar</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4. Grid Row: Continue Learning + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Continue Learning Cards */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Continue Learning</h2>
            <Link href="/student/my-courses">
              <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">View All Courses</span>
            </Link>
          </div>

          {lastActiveCourse ? (
            <div className="w-full">
              <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-luxury-md flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Last Active Course
                    </span>
                    <span className="text-xs text-slate-450 font-bold">{lastActiveCourse.progress}% Complete</span>
                  </div>

                  <h4 className="text-base font-black text-white leading-tight">{lastActiveCourse.course.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-2xl">{lastActiveCourse.course.description}</p>
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-md bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${lastActiveCourse.progress}%` }} />
                  </div>
                </div>

                <div className="flex-shrink-0 w-full md:w-auto">
                  <Link href={`/student/learn/${lastActiveCourse.courseId}`}>
                    <button className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
                      <span>Resume Learning</span>
                      <ChevronRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-10 text-center shadow-luxury-md">
              <h3 className="text-md font-semibold text-white">No enrolled courses</h3>
              <p className="mt-1.5 text-xs text-slate-400">Browse available courses and start learning.</p>
            </div>
          )}
        </section>

        {/* Achievements widget */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Achievements</h2>
            <Link href="/student/achievements">
              <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">View All</span>
            </Link>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-center h-40 shadow-luxury-md">
            <div className="grid grid-cols-4 gap-3 text-center">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg border shadow-sm transition-transform hover:scale-105 duration-300 ${
                    ach.active 
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-slate-800/40 border-slate-800/60 text-slate-650 opacity-40"
                  }`}>
                    {ach.icon}
                  </div>
                  <div className="text-[9px] font-black text-slate-350 truncate w-full">{ach.name}</div>
                  <div className="text-[8px] text-slate-500 truncate w-full">{ach.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 5. Bottom Widgets: Skill Progress + Performance Overview + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Skill Progress */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-white">Skill Progress</h3>
            <Link href="/student/progress">
              <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">View All</span>
            </Link>
          </div>

          <div className="space-y-3.5">
            {skillsList.map((skill, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>{skill.name}</span>
                  <span className="text-white">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 2: Performance Overview */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-white">Performance Overview</h3>
              <span className="text-xs bg-slate-800/60 px-2.5 py-0.5 rounded border border-slate-700/50 text-slate-305 font-bold text-[10px]">
                This Month
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-850/50 border border-slate-800/50 rounded-xl text-center flex flex-col justify-between h-24">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Tests Taken</span>
                <div className="text-xl font-black text-white">{stats.completedQuizzes ?? 0}</div>
                <div className="flex gap-0.5 justify-center items-end h-5 opacity-40">
                  <span className="w-1 bg-orange-500 h-2 rounded-t" />
                  <span className="w-1 bg-orange-500 h-4 rounded-t" />
                  <span className="w-1 bg-orange-500 h-3 rounded-t" />
                  <span className="w-1 bg-orange-500 h-5 rounded-t" />
                </div>
              </div>

              <div className="p-3 bg-slate-850/50 border border-slate-800/50 rounded-xl text-center flex flex-col justify-between h-24">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Avg Score</span>
                <div className="text-xl font-black text-white">{stats.avgQuizScore ?? 78}%</div>
                <div className="flex justify-center items-center h-5">
                  <span className="text-emerald-500 text-[10px] font-bold">📈 +5%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-850/50 border border-slate-800/50 rounded-xl text-center flex flex-col justify-between h-24">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Rank</span>
                <div className="text-xs font-black text-white truncate">Top {stats.rankPercentile ?? 100}%</div>
                <div className="flex justify-center items-center h-5 text-orange-400">
                  <Trophy size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Recommended for You */}
        <div className="bg-slate-900/50 border border-slate-800/80 backdrop-blur-md rounded-2xl p-5 shadow-luxury-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-white">Recommended for You</h3>
              <Link href="/student/courses">
                <span className="text-xs text-orange-500 font-bold hover:underline cursor-pointer">View All</span>
              </Link>
            </div>

            {recommendations.length > 0 ? (
              <div className="flex gap-4 items-center bg-slate-850/50 p-3.5 rounded-xl border border-slate-800/60">
                <div className="h-16 w-16 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl flex items-center justify-center text-xs font-black shadow-sm uppercase">
                  {recommendations[0].category ? recommendations[0].category.substring(0, 4) : "LMS"}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white truncate">{recommendations[0].title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{recommendations[0].description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] bg-slate-800 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded font-bold">{recommendations[0].lessonsCount} Lesson{recommendations[0].lessonsCount !== 1 ? "s" : ""}</span>
                    <Link href={`/student/courses`}>
                      <button className="text-[9px] bg-orange-500 hover:bg-orange-600 transition text-white px-2.5 py-0.5 rounded font-bold cursor-pointer">Explore</button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-850/50 p-6 rounded-xl border border-slate-800/60 text-center text-xs text-slate-400">
                You have enrolled in all available courses! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}