'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import {
  BookOpen, Users, Award, Calendar, FileText, CheckCircle,
  Plus, ChevronRight, MessageSquare, Megaphone, AlertTriangle,
  UploadCloud, Bot, TrendingUp, Zap, Clock, Flame,
  CheckSquare, PenLine, X, Activity, Loader2, ClipboardList,
  Info, ShieldAlert, Edit2, Play, ExternalLink, HelpCircle
} from 'lucide-react';

import { getCertificates } from '@/services/certificate.service';
import { getNotifications } from '@/services/notification.service';
import { getCalendarEvents } from '@/services/calendar.service';
import { getAssignments } from '@/services/assignment.service';
import { getConversations } from '@/features/chat/api/chat.api';
import { getQuizzes } from '@/services/quiz.service';
import { getModules } from '@/services/module.service';

export default function InstructorDashboardPage() {
  const { user } = useAuth();

  // --- INTERACTION STATES ---
  const [activePrepTab, setActivePrepTab] = useState('Lecture'); // Lecture | Assignment | Quiz
  const [openAccordions, setOpenAccordions] = useState({
    messages: true,
    announcements: true,
    notifications: false,
    updates: false,
  });
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState([]);

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- REAL API DATA QUERIES ---
  const { data: allCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['instructorCoursesList'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/courses');
        return data.data ?? data ?? [];
      } catch (e) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const myCourses = useMemo(() =>
    allCourses.filter((c) => c.creatorId === user?.id || c.instructorId === user?.id || !c.creatorId),
    [allCourses, user?.id]
  );

  // STRICT REAL COURSES ONLY (No fallback mock data)
  const coursesData = useMemo(() => {
    return Array.isArray(myCourses) ? myCourses : [];
  }, [myCourses]);

  const { data: assignments = [] } = useQuery({
    queryKey: ['instructorAssignments'],
    queryFn: async () => {
      try {
        return await getAssignments();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 3,
  });

  const { data: calEvents = [] } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: async () => {
      try {
        return await getCalendarEvents();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        return await getNotifications();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        return await getConversations();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  const conversations = useMemo(() => {
    return Array.isArray(convData) ? convData : (convData?.data ?? []);
  }, [convData]);

  const { data: modules = [] } = useQuery({
    queryKey: ['instructorModulesList'],
    queryFn: async () => {
      try {
        const data = await getModules();
        return data.data ?? data ?? [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['instructorQuizzes'],
    queryFn: async () => {
      try {
        return await getQuizzes();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // --- DYNAMICALLY COMPUTED REAL DATA ---

  // 1. Dynamic Course Action Summaries derived strictly from DB
  const getCourseActionSummaries = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id || a.course?.id === course.id);
    const pendingGrading = courseAssignments.filter(a => a.status === 'PENDING' || a.status === 'SUBMITTED' || !a.status).length;
    const courseEvents = calEvents.filter(e => e.courseId === course.id || e.courseName === course.title);
    const nextLecture = courseEvents.find(e => e.type === 'lecture' || e.type === 'class');
    const nextDeadline = courseEvents.find(e => e.type === 'assignment' || e.type === 'quiz');

    const summaries = [];
    if (pendingGrading > 0) {
      summaries.push(`${pendingGrading} assignment submission(s) pending grading`);
    } else {
      summaries.push(`All assignments graded & up to date`);
    }

    if (nextLecture) {
      summaries.push(`Upcoming lecture: ${nextLecture.title} (${nextLecture.startTime || nextLecture.date})`);
    } else {
      summaries.push(`No upcoming lecture scheduled`);
    }

    if (nextDeadline) {
      summaries.push(`Upcoming deadline: ${nextDeadline.title} (${nextDeadline.date})`);
    }

    const courseQuizzes = quizzes.filter(q => q.courseId === course.id);
    if (courseQuizzes.length > 0) {
      summaries.push(`${courseQuizzes.length} quiz(zes) created for this course`);
    }

    return summaries;
  };

  // 2. Real Calendar Events Grouping
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const dynamicCalendarScheduleGrouped = useMemo(() => {
    const todayEvents = [];
    const tomorrowEvents = [];
    const upcomingEvents = [];

    calEvents.forEach(e => {
      const item = {
        id: e.id,
        time: e.startTime ? `${e.startTime}${e.endTime ? ' - ' + e.endTime : ''}` : 'All Day',
        title: e.title || 'Scheduled Session',
        course: e.courseName || 'General Course',
        batch: e.batch || 'Batch A',
        location: e.location || e.room || (e.link ? 'Online' : 'Online'),
        status: e.status || 'Scheduled'
      };
      if (e.date === todayStr) {
        todayEvents.push(item);
      } else if (e.date === tomorrowStr) {
        tomorrowEvents.push(item);
      } else {
        upcomingEvents.push({ ...item, day: e.date || 'Upcoming' });
      }
    });

    const result = {};
    if (todayEvents.length > 0) result.TODAY = todayEvents;
    if (tomorrowEvents.length > 0) result.Tomorrow = tomorrowEvents;
    if (upcomingEvents.length > 0) result['Upcoming / This Week'] = upcomingEvents;

    return result;
  }, [calEvents, todayStr, tomorrowStr]);

  // 3. Real Continue Working Items (Modules, Assignments, Quizzes)
  const prepTabItems = useMemo(() => {
    const draftModules = modules.map(m => ({
      id: m.id,
      title: m.title || m.name || 'Module Unit',
      course: m.course?.title || 'Course Module',
      status: m.isPublished ? 'Published' : 'Draft',
      lastUpdated: 'Recently',
      estTimeRemaining: 'In Progress'
    }));

    const realAssignments = assignments.map(a => ({
      id: a.id,
      title: a.title,
      course: a.course?.title || 'Assignment',
      status: a.isPublished ? 'Published' : 'Draft',
      lastUpdated: 'Recently',
      estTimeRemaining: a.dueDate ? `Due: ${a.dueDate.split('T')[0]}` : 'Active'
    }));

    const realQuizzes = quizzes.map(q => ({
      id: q.id,
      title: q.title,
      course: q.course?.title || 'Quiz',
      status: q.isPublished ? 'Published' : 'Draft',
      lastUpdated: 'Recently',
      estTimeRemaining: q.passingScore ? `Passing: ${q.passingScore}%` : 'Active'
    }));

    return {
      Lecture: draftModules,
      Assignment: realAssignments,
      Quiz: realQuizzes,
    };
  }, [modules, assignments, quizzes]);

  const sortedPrepItems = useMemo(() => {
    return prepTabItems[activePrepTab] || [];
  }, [activePrepTab, prepTabItems]);

  // 4. Real Activity List from DB Notifications
  const dynamicCategorizedActivities = useMemo(() => {
    const todayList = [];
    const yesterdayList = [];
    const earlierList = [];

    notifications.forEach((n, idx) => {
      const typeStr = n.type ? `${n.type.toUpperCase()}` : 'ACTIVITY';
      const item = {
        id: n.id || `notif_${idx}`,
        type: typeStr,
        course: n.course || 'LMS Platform',
        desc: n.title || n.message || 'Activity notification',
        time: n.time || 'Recently',
        href: '/instructor/dashboard'
      };
      if (idx < 2) todayList.push(item);
      else if (idx < 4) yesterdayList.push(item);
      else earlierList.push(item);
    });

    const result = {};
    if (todayList.length > 0) result.Today = todayList;
    if (yesterdayList.length > 0) result.Yesterday = yesterdayList;
    if (earlierList.length > 0) result.Earlier = earlierList;

    return result;
  }, [notifications]);

  // 5. Dynamic Operational Insights from Real DB Stats
  const dynamicAiInsights = useMemo(() => {
    const items = [];
    const pendingGrading = assignments.filter(a => a.status === 'PENDING' || a.status === 'SUBMITTED' || !a.status).length;

    if (pendingGrading > 0) {
      items.push({
        id: 'ai1',
        text: `${pendingGrading} assignment submission(s) are awaiting grading evaluation.`,
        actionLabel: 'Grade Submissions',
        href: '/instructor/assignments'
      });
    }

    if (coursesData.length === 0) {
      items.push({
        id: 'ai2',
        text: 'You have no courses registered in the system.',
        actionLabel: 'Create Course Now',
        href: '/instructor/courses/create'
      });
    }

    if (calEvents.length === 0) {
      items.push({
        id: 'ai3',
        text: 'No scheduled lectures or events in your calendar.',
        actionLabel: 'Schedule Session',
        href: '/instructor/calendar'
      });
    }

    return items.filter(item => !dismissedInsights.includes(item.id));
  }, [assignments, coursesData, calEvents, dismissedInsights]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col gap-6 select-none bg-[#080B11] pb-10">
      
      {/* 1. QUICK ACTION BAR */}
      <div className="flex items-center justify-between bg-[#0D1021] border border-[#1A1F35] rounded-xl p-2 relative overflow-visible shadow-xl">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 w-full md:w-auto">
          <Link href="/instructor/courses/create" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition whitespace-nowrap">
            Create Course
          </Link>
          <div className="h-4 w-px bg-[#1A1F35] self-center shrink-0" />
          <Link href="/instructor/quizzes/create" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition whitespace-nowrap">
            Create Quiz
          </Link>
          <div className="h-4 w-px bg-[#1A1F35] self-center shrink-0" />
          <Link href="/instructor/calendar" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition whitespace-nowrap">
            Schedule Class
          </Link>
          <div className="h-4 w-px bg-[#1A1F35] self-center shrink-0" />
          <Link href="/instructor/certificates/create" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition whitespace-nowrap">
            Create Certificate
          </Link>
          <div className="h-4 w-px bg-[#1A1F35] self-center shrink-0" />
          <Link href="/instructor/modules" className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] transition whitespace-nowrap">
            Upload Material
          </Link>
          <div className="h-4 w-px bg-[#1A1F35] self-center shrink-0" />
          
          {/* Dropdown toggle for More */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMoreActionsOpen(!moreActionsOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black text-orange-400 hover:bg-white/[0.02] transition cursor-pointer"
            >
              More ▼
            </button>
            {moreActionsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreActionsOpen(false)} />
                <div className="absolute left-0 mt-2 z-50 w-48 rounded-xl border border-[#1A1F35] bg-[#0D1021] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/instructor/announcements"
                    onClick={() => setMoreActionsOpen(false)}
                    className="block px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    Make Announcement
                  </Link>
                  <Link
                    href="/instructor/reports"
                    onClick={() => setMoreActionsOpen(false)}
                    className="block px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    View Reports
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN 3-PANEL ROW: MY COURSES | CALENDAR | MESSAGES & NOTIFICATIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* PANEL 1: MY COURSES */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
              My Courses ({coursesData.length})
            </h2>
            <Link href="/instructor/courses" className="text-[10px] font-black text-orange-400 hover:text-orange-300 transition">
              View All
            </Link>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-0.5">
            {coursesData.length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-[#1A1F35] rounded-xl space-y-3">
                <BookOpen size={28} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-400">No courses found in database.</p>
                <Link href="/instructor/courses/create" className="inline-block px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-extrabold transition shadow-md">
                  Create First Course
                </Link>
              </div>
            ) : (
              coursesData.map((course) => {
                const summaries = getCourseActionSummaries(course);
                const isPub = course.isPublished || course.status === "Published" || course.status === "PUBLISHED";
                return (
                  <div key={course.id} className="p-4 rounded-xl bg-white/[0.01] border border-[#1A1F35] flex flex-col gap-3.5 transition hover:border-slate-800">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-200 truncate pr-2">{course.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPub 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          }`}>
                            {isPub ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-extrabold">{course.batch || 'Batch A'} &bull; {course._count?.enrollments ?? course.studentsCount ?? 0} Enrolled</span>
                        </div>
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                        <BookOpen size={18} />
                      </div>
                    </div>

                    {/* Actionable Summaries */}
                    <div className="p-3 rounded-lg bg-[#05070E] border border-[#1A1F35] space-y-1.5 text-[10px] font-bold text-slate-300 leading-relaxed">
                      {summaries.map((summary, idx) => (
                        <p key={idx} className="flex items-start gap-1">
                          <span className="text-orange-400 shrink-0">&bull;</span>
                          <span>{summary}</span>
                        </p>
                      ))}
                    </div>

                    {/* Course Link */}
                    <div className="pt-2 border-t border-[#1A1F35]/40">
                      <Link href={`/instructor/courses/${course.id}`} className="w-full flex items-center justify-center py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-[10.5px] font-black transition text-center shadow-lg shadow-orange-500/10">
                        View Course &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: CALENDAR SCHEDULE */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Calendar Schedule</h2>
            <Link href="/instructor/calendar" className="text-[10px] font-black text-orange-400 hover:text-orange-300 transition">
              Open Calendar
            </Link>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-0.5">
            {Object.keys(dynamicCalendarScheduleGrouped).length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-[#1A1F35] rounded-xl space-y-3">
                <Calendar size={28} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-400">No scheduled events in database.</p>
                <Link href="/instructor/calendar" className="inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition">
                  Schedule Event
                </Link>
              </div>
            ) : (
              Object.entries(dynamicCalendarScheduleGrouped).map(([group, events]) => (
                <div key={group} className="space-y-2">
                  <h3 className={`text-[9px] font-black uppercase tracking-widest border-b border-[#1A1F35] pb-1 font-mono ${
                    group === 'TODAY' ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    {group} ({events.length})
                  </h3>
                  <div className="space-y-2">
                    {events.map((event, idx) => (
                      <Link href="/instructor/calendar" key={idx} className="block p-3 bg-[#05070E] border border-[#1A1F35] rounded-xl transition hover:border-slate-700">
                        <div className="flex justify-between items-center text-[8.5px] font-black">
                          <span className="text-slate-400 font-mono">{event.time}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            event.status === 'Upcoming' || event.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-black text-white mt-1.5 leading-snug">{event.title}</h4>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold mt-1">
                          <span>{event.course} &bull; {event.batch}</span>
                          <span>📍 {event.location}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL 3: MESSAGES & SYSTEM NOTIFICATIONS */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Messages & Activity</h2>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[480px] pr-0.5">
            
            {/* Accordion 1: Student Messages */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden bg-[#05070E]">
              <button
                onClick={() => toggleAccordion('messages')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-200 flex items-center gap-1.5">
                  💬 Student Messages ({conversations.length})
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.messages ? '▲' : '▼'}</span>
              </button>
              {openAccordions.messages && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2">
                  {conversations.length > 0 ? (
                    conversations.slice(0, 4).map((conv) => (
                      <Link key={conv.id} href="/instructor/messages" className="block p-2.5 rounded-lg bg-[#0D1021] border border-[#1A1F35] hover:border-slate-700 transition">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-300">
                          <span>{conv.name || 'Student Query'}</span>
                          {conv.unread > 0 ? (
                            <span className="text-orange-400 font-black">Unread</span>
                          ) : (
                            <span className="text-slate-500 font-bold">Read</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate leading-snug mt-1">{conv.lastMessage || 'Message preview...'}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-xs font-bold">
                      No conversations found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: System Notifications */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden bg-[#05070E]">
              <button
                onClick={() => toggleAccordion('notifications')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-200 flex items-center gap-1.5">
                  🔔 System Notifications ({notifications.length})
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.notifications ? '▲' : '▼'}</span>
              </button>
              {openAccordions.notifications && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-[#0D1021] text-[9.5px] text-slate-300 border border-[#1A1F35]">
                        <p className="font-bold">{n.title || n.message}</p>
                        <span className="text-[8px] text-slate-500 block mt-0.5">{n.time || 'Recently'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-xs font-bold">
                      No new notifications.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 3: Course Modules & Content */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden bg-[#05070E]">
              <button
                onClick={() => toggleAccordion('updates')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-200 flex items-center gap-1.5">
                  🔄 Course Modules ({modules.length})
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.updates ? '▲' : '▼'}</span>
              </button>
              {openAccordions.updates && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2">
                  {modules.length > 0 ? (
                    modules.slice(0, 3).map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg bg-[#0D1021] text-[9.5px] text-slate-300 border border-[#1A1F35]">
                        <p className="font-bold">{m.title || m.name}</p>
                        <p className="text-slate-500 mt-0.5">Module Unit</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-xs font-bold">
                      No modules created yet.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 3. ROW 2: CONTINUE WORKING */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-[#1A1F35] pb-3">
          <div className="h-3 w-0.5 rounded-full bg-orange-400" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Content Management</h2>
        </div>

        {/* Tabs Selector */}
        <div className="flex gap-2.5 border-b border-[#1A1F35] pb-1">
          {['Lecture', 'Assignment', 'Quiz'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePrepTab(tab)}
              className={`pb-2.5 px-1 text-xs font-black transition relative cursor-pointer ${
                activePrepTab === tab ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab} Items ({prepTabItems[tab]?.length || 0})
              {activePrepTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Real Content Items Grid */}
        {sortedPrepItems.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#1A1F35] rounded-xl text-slate-500 text-xs font-bold">
            No {activePrepTab.toLowerCase()} items found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-1">
            {sortedPrepItems.slice(0, 4).map((work) => (
              <div key={work.id} className="p-4 bg-[#05070E] border border-[#1A1F35] rounded-xl flex flex-col justify-between min-h-[145px] transition hover:border-slate-700">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs font-extrabold text-white leading-snug truncate">{work.title}</h3>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                      work.status === 'Published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>{work.status}</span>
                  </div>
                  
                  <div className="flex flex-col gap-0.5 mt-2 text-[9px] text-slate-400 font-bold">
                    <p className="truncate">{work.course}</p>
                    <p className="text-orange-400 mt-0.5">{work.estTimeRemaining}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#1A1F35]">
                  <Link href={`/instructor/${activePrepTab.toLowerCase()}s`} className="flex items-center justify-center p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-[9px] font-black transition text-center shadow-md">
                    Manage
                  </Link>
                  <Link href={`/instructor/${activePrepTab.toLowerCase()}s`} className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black transition text-slate-300 text-center border border-white/5">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ROW 3: RECENT ACTIVITY */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Recent Activity</h2>
        </div>

        {Object.keys(dynamicCategorizedActivities).length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#1A1F35] rounded-xl text-slate-500 text-xs font-bold">
            No recent activity recorded in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(dynamicCategorizedActivities).map(([timeframe, items]) => (
              <div key={timeframe} className="space-y-3">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-[#1A1F35] pb-1.5 mb-2 font-mono">
                  {timeframe}
                </h3>
                <div className="space-y-2">
                  {items.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-[#05070E] border border-[#1A1F35] flex flex-col gap-1.5 justify-between">
                      <div>
                        <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase font-mono">
                          <span>{act.type}</span>
                          <span>{act.time}</span>
                        </div>
                        <p className="text-[10.5px] font-bold text-white mt-1 leading-snug">{act.desc}</p>
                        <p className="text-[8.5px] text-orange-400 font-bold mt-0.5">{act.course}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. DYNAMIC OPERATIONAL INSIGHTS */}
      {dynamicAiInsights.length > 0 && (
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1F35]">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-purple-400" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Operational Insights</h2>
            </div>
            <span className="text-[9px] text-slate-400 font-bold font-mono">{dynamicAiInsights.length} suggestions</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
            {dynamicAiInsights.map((insight) => (
              <div key={insight.id} className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between min-h-[100px]">
                <p className="text-[10.5px] font-bold text-slate-200 leading-relaxed">{insight.text}</p>
                <div className="flex justify-between items-center mt-3 border-t border-purple-500/20 pt-2">
                  <Link href={insight.href} className="text-[9.5px] font-black text-purple-400 hover:text-purple-300">
                    {insight.actionLabel} &rarr;
                  </Link>
                  <button
                    onClick={() => setDismissedInsights(prev => [...prev, insight.id])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold cursor-pointer"
                    title="Dismiss Insight"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
