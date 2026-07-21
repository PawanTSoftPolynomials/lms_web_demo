'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueries } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { PieChart, Pie, Cell } from 'recharts';
import {
  BookOpen, Users, Zap, Award, Calendar,
  ArrowRight, PlusCircle,
  FileText, CheckCircle, Plus,
  TrendingUp, Edit3
} from 'lucide-react';
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import { useInstructorCertificates } from "@/hooks/queries/instructor/useCertificates";
import { useNotifications } from "@/hooks/queries/instructor/useInstructorDashboard";

// Donut Chart for Student Reports
const donutData = [
  { name: 'Completed', value: 35 },
  { name: 'In Progress', value: 50 },
  { name: 'Not Started', value: 15 },
];
const DONUT_COLORS = ['#10B981', '#FF7A00', '#F59E0B'];

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch instructor's own courses
  const { data: allCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['instructorCoursesList'],
    queryFn: async () => {
      const { data } = await api.get('/courses');
      return data.data ?? data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: certificatesData = [] } = useInstructorCertificates(user?.id);
  const { data: notifications = [] } = useNotifications();

  const myCourses = allCourses.filter((c) => c.creatorId === user?.id);

  // Fetch batches for each instructor course in parallel
  const batchResults = useQueries({
    queries: myCourses.map((course) => ({
      queryKey: ['courseBatches', course.id],
      queryFn: async () => {
        try {
          const { data } = await api.get(`/courses/${course.id}/batches`);
          return (data.data ?? data ?? []).map((b) => ({ ...b, courseName: course.title }));
        } catch { return []; }
      },
      staleTime: 1000 * 60 * 5,
      enabled: !!course.id,
    })),
  });

  const allBatches = batchResults.flatMap((r) => r.data ?? []);
  const batchesLoading = batchResults.some((r) => r.isLoading);

  return (
    <div className="min-h-screen pb-16 select-none">

      {/* ── Welcome Banner ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Instructor'} ! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* ── Main Grid ── */}
      <div className="flex flex-col gap-5">

        {/* ════════════ MAIN SECTION ════════════ */}
        <div className="flex flex-col gap-5">

          {/* ── Row 1: Subjects / Batches / Quick Actions ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Subjects / Courses — Real Data */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm flex flex-col justify-between min-h-[220px] hover:border-[#252B45] transition-colors">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={16} className="text-orange-400" strokeWidth={2.5} />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Subjects / Courses</span>
                </div>

                {/* Course list */}
                <div className="flex-1 space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#1A1F35]">
                  {coursesLoading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-7 rounded-xl bg-[#1A1F35] animate-pulse" />
                      ))}
                    </div>
                  ) : myCourses.length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No courses yet.</p>
                  ) : (
                    myCourses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/instructor/courses/${course.id}`}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#13172B] border border-[#1A1F35] hover:border-orange-500/30 hover:bg-orange-500/5 transition group"
                      >
                        <span className="text-[10px] font-bold text-slate-300 truncate group-hover:text-orange-300 transition">
                          {course.title}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                          course.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {course.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <Link href="/instructor/courses" className="flex items-center gap-1 text-[11px] font-extrabold text-orange-400 hover:text-orange-300 transition mt-3 pt-3 border-t border-[#1A1F35]">
                View all courses <ArrowRight size={11} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Batches & their Students — Real Data */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm flex flex-col justify-between min-h-[220px] hover:border-[#252B45] transition-colors">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-orange-400" strokeWidth={2.5} />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Batches & their Students</span>
                </div>

                {/* Batch list */}
                <div className="flex-1 space-y-2 max-h-[145px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#1A1F35]">
                  {batchesLoading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-7 rounded-xl bg-[#1A1F35] animate-pulse" />
                      ))}
                    </div>
                  ) : allBatches.length === 0 ? (
                    <p className="text-[10px] text-slate-600 italic">No batches found.</p>
                  ) : (
                    allBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#13172B] border border-[#1A1F35] hover:border-orange-500/30 hover:bg-orange-500/5 transition group"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400/60 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-300 truncate group-hover:text-orange-300 transition">
                          {batch.name ?? batch.title ?? 'Unnamed Batch'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link href="/instructor/reports" className="flex items-center gap-1 text-[11px] font-extrabold text-orange-400 hover:text-orange-300 transition mt-3 pt-3 border-t border-[#1A1F35]">
                View batches & students <ArrowRight size={11} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm flex flex-col min-h-[220px] hover:border-[#252B45] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-orange-400" strokeWidth={2.5} />
                <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Quick Actions</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { label: 'Create Course',         href: '/instructor/courses/create',  desc: 'Add a new course'           },
                  { label: 'Create Assignment',      href: '/instructor/assignments',     desc: 'Set a new task'             },
                  { label: 'Create Quiz',            href: '/instructor/quizzes',         desc: 'Build a quiz'               },
                  { label: 'Create Study Material',  href: '/instructor/modules',         desc: 'Upload lesson content'      },
                  { label: 'Make Announcement',      href: '/instructor/announcements',   desc: 'Broadcast to students'      },
                ].map(({ label, href, desc }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#13172B] border border-[#1A1F35] hover:border-orange-500/30 hover:bg-orange-500/5 transition group"
                  >
                    <PlusCircle size={13} className="text-slate-700 group-hover:text-orange-400 flex-shrink-0 transition" />
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-300 group-hover:text-orange-300 transition leading-tight">{label}</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ── Row 2: Student Reports / Certificates / Schedules ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Instructor Courses List (Reports Link) */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm flex flex-col min-h-[320px] max-h-[320px] hover:border-[#252B45] transition-colors relative overflow-hidden group">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-400" strokeWidth={2.5} />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Course Reports</span>
                </div>
                <Link href="/instructor/courses/create" className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer group-hover:scale-110">
                  <Plus size={14} strokeWidth={3} />
                </Link>
              </div>

              {/* Scrollable List of Courses */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {myCourses.length > 0 ? (
                  myCourses.map((course, i) => (
                    <Link key={course.id || i} href={`/instructor/reports?courseId=${course.id}`} className="flex items-center justify-between p-3 rounded-2xl bg-[#13172B]/50 border border-[#1A1F35] hover:border-orange-500/30 transition-colors group/item block">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                          <BookOpen size={14} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-slate-200 truncate">{course.title}</p>
                          <p className="text-[9px] font-semibold text-slate-500 truncate">{course.level || "Beginner"}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-[9px] font-bold text-orange-400/80 mb-0.5 whitespace-nowrap">View Reports</p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">{course.status || "PUBLISHED"}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <BookOpen size={24} className="text-slate-500 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No courses yet</p>
                    <p className="text-[9px] text-slate-500">Create one to view reports</p>
                  </div>
                )}
              </div>

              <Link href="/instructor/reports" className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-400 hover:text-orange-400 transition mt-4 pt-3 border-t border-[#1A1F35]">
                View all reports <ArrowRight size={10} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Certificates List & Actions */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm flex flex-col min-h-[320px] max-h-[320px] hover:border-[#252B45] transition-colors relative overflow-hidden group">
              
              {/* Header & Create Button */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-orange-400" strokeWidth={2.5} />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wide">Certificates</span>
                </div>
                <Link href="/instructor/certificates/create" className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer group-hover:scale-110">
                  <Plus size={14} strokeWidth={3} />
                </Link>
              </div>

              {/* Action Buttons for Creation and Updation */}
              <div className="flex-1 flex flex-col justify-center gap-4 py-2">
                
                {/* Create Certificate */}
                <Link href="/instructor/certificates/create" className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/15 transition-all group/action cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover/action:scale-110 group-hover/action:bg-orange-500 group-hover/action:text-white transition-all">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 mb-0.5">Issue Certificate</h3>
                    <p className="text-[10px] font-medium text-slate-400">Manually grant a new credential</p>
                  </div>
                </Link>

                {/* Update Certificate */}
                <Link href="/instructor/certificates/edit" className="flex items-center gap-4 p-4 rounded-2xl bg-[#13172B]/50 border border-[#1A1F35] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/action cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover/action:scale-110 group-hover/action:bg-blue-500/20 group-hover/action:text-blue-400 transition-all">
                    <Edit3 size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-200 mb-0.5">Update Certificate</h3>
                    <p className="text-[10px] font-medium text-slate-500">Modify an existing credential</p>
                  </div>
                </Link>

              </div>
            </div>
            {/* Schedules / Mini Calendar */}
            <div className="md:col-span-1 h-[320px]">
              <MiniCalendar role="INSTRUCTOR" />
            </div>

          </div>

          {/* ── Row 3: Recent Activity + Mini Calendar ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

            {/* Recent Activity */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm md:col-span-7 hover:border-[#252B45] transition-colors">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-semibold">No recent activity found.</div>
                ) : (
                  notifications.slice(0, 4).map((notification, i) => {
                    const iconMap = {
                      'COURSE': <BookOpen size={12} strokeWidth={3} />,
                      'CERTIFICATE': <Award size={12} strokeWidth={3} />,
                      'ASSIGNMENT': <FileText size={12} strokeWidth={3} />,
                      'QUIZ': <CheckCircle size={12} strokeWidth={3} />,
                      'DEFAULT': <Plus size={12} strokeWidth={3} />
                    };
                    const bgMap = {
                      'COURSE': 'bg-orange-500/10 text-orange-400 border-orange-500/10',
                      'CERTIFICATE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
                      'ASSIGNMENT': 'bg-amber-500/10 text-amber-400 border-amber-500/10',
                      'QUIZ': 'bg-blue-500/10 text-blue-400 border-blue-500/10',
                      'DEFAULT': 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                    };
                    
                    const type = (notification.type || 'DEFAULT').toUpperCase();
                    const icon = iconMap[type] || iconMap['DEFAULT'];
                    const bg = bgMap[type] || bgMap['DEFAULT'];
                    const dateObj = new Date(notification.createdAt);
                    const time = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={notification.id || i} className="flex items-start gap-3.5">
                        <div className={`p-2 rounded-xl flex-shrink-0 border ${bg}`}>{icon}</div>
                        <div className="flex-1 flex justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-slate-500 leading-normal line-clamp-1">{notification.title}</p>
                            {notification.message && <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{notification.message}</p>}
                          </div>
                          <span className="text-[9px] text-slate-700 font-semibold whitespace-nowrap">{time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#0D1021] rounded-3xl border border-[#1A1F35] p-5 shadow-sm md:col-span-5 flex flex-col justify-between hover:border-[#252B45] transition-colors">
              <div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {[
                    { day: '20', month: 'MAY', title: 'Class: React Hooks', sub: '10:00 AM – 11:30 AM' },
                    { day: '22', month: 'MAY', title: 'Assignment Due', sub: 'React Components' },
                    { day: '25', month: 'MAY', title: 'Quiz: JavaScript Basics', sub: '02:00 PM – 03:00 PM' },
                  ].map(({ day, month, title, sub }) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/15 flex-shrink-0">
                        <span className="text-sm font-black text-orange-400 leading-tight">{day}</span>
                        <span className="text-[8px] font-black text-orange-500/70 uppercase tracking-wider">{month}</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold text-slate-200">{title}</p>
                        <p className="text-[9px] text-slate-600 font-semibold mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/instructor/calendar" className="flex items-center gap-1 text-[11px] font-extrabold text-orange-400 hover:text-orange-300 transition mt-4 pt-4 border-t border-[#1A1F35]">
                View all schedules <ArrowRight size={11} strokeWidth={2.5} />
              </Link>
            </div>

          </div>

        </div>
        {/* ════════════ END MAIN SECTION ════════════ */}

      </div>
    </div>
  );
}