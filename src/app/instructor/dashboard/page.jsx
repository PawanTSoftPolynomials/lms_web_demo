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

  // --- INTERACTION & DYNAMIC MUTATION STATES ---
  const [calendarView, setCalendarView] = useState('Day'); // Day | Week | Month
  const [activePrepTab, setActivePrepTab] = useState('Lecture'); // Lecture | Assignment | Quiz
  const [openAccordions, setOpenAccordions] = useState({
    messages: true,
    announcements: true,
    notifications: false,
    updates: false,
    feedback: false
  });
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [publishedWorkIds, setPublishedWorkIds] = useState([]);
  const [dismissedInsights, setDismissedInsights] = useState([]);

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePublishWork = (id) => {
    if (!publishedWorkIds.includes(id)) {
      setPublishedWorkIds(prev => [...prev, id]);
    }
  };

  // --- API DATA QUERIES ---
  const { data: allCourses = [] } = useQuery({
    queryKey: ['instructorCoursesList'],
    queryFn: async () => {
      const { data } = await api.get('/courses');
      return data.data ?? data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const myCourses = useMemo(() =>
    allCourses.filter((c) => c.creatorId === user?.id || c.instructorId === user?.id),
    [allCourses, user?.id]
  );

  // Fallback courses if DB is empty to showcase Redesign correctly
  const coursesData = useMemo(() => {
    if (myCourses.length > 0) return myCourses;
    return [
      { id: 'c1', title: 'Java Full Stack Development', status: 'Published', batch: 'Batch A', studentsCount: 145 },
      { id: 'c2', title: 'React Architecture & State', status: 'Published', batch: 'Batch B', studentsCount: 92 },
      { id: 'c3', title: 'Express API Design & Security', status: 'Draft', batch: 'Batch C', studentsCount: 0 }
    ];
  }, [myCourses]);

  const { data: assignments = [] } = useQuery({
    queryKey: ['instructorAssignments'],
    queryFn: () => getAssignments(),
    staleTime: 1000 * 60 * 3,
  });

  const { data: calEvents = [] } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 2,
  });

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
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
      } catch { return []; }
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['instructorQuizzes'],
    queryFn: () => getQuizzes(),
    staleTime: 1000 * 60 * 5,
  });

  // --- DYNAMICALLY COMPUTED CARD DATA ---

  // 1. Dynamic Course Action Summaries (Panel 1)
  const getCourseActionSummaries = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id || a.course?.id === course.id);
    const pendingCount = courseAssignments.filter(a => a.status === 'PENDING' || a.status === 'SUBMITTED' || !a.status).length;
    const courseEvents = calEvents.filter(e => e.courseId === course.id || e.courseName === course.title);
    const nextLecture = courseEvents.find(e => e.type === 'class');
    const nextDeadline = courseEvents.find(e => e.type === 'deadline' || e.type === 'assignment');

    return [
      `${pendingCount > 0 ? pendingCount : 12} assignments waiting for grading`,
      `${Math.max(1, Math.floor((course.studentsCount || 145) * 0.05))} students are behind schedule`,
      `${pendingCount > 0 ? Math.ceil(pendingCount / 2) : 4} quiz submissions pending review`,
      `Upcoming lecture: ${nextLecture?.title || 'Concurrency & Threads (Today 09:00 AM)'}`,
      `Upcoming deadline: ${nextDeadline?.title || 'Concurrency Project Submission (Tomorrow)'}`
    ];
  };

  // 2. Dynamic Concept Self Test Analytics per Course (Panel 1)
  const conceptAnalytics = useMemo(() => ({
    c1: [
      { name: 'Java Streams API', attempts: 248, averageScore: 61, successRate: 58, difficulty: 'Hard', status: 'Needs Review' },
      { name: 'Multithreading & Executors', attempts: 185, averageScore: 72, successRate: 68, difficulty: 'Medium', status: 'Healthy' },
      { name: 'Spring Boot DI & IoC', attempts: 320, averageScore: 91, successRate: 88, difficulty: 'Easy', status: 'Healthy' }
    ],
    c2: [
      { name: 'useEffect Hooks Cleanup', attempts: 142, averageScore: 50, successRate: 46, difficulty: 'Hard', status: 'Needs Review' },
      { name: 'Context API Provider Design', attempts: 198, averageScore: 78, successRate: 74, difficulty: 'Medium', status: 'Healthy' },
      { name: 'React Concurrent Suspense', attempts: 96, averageScore: 81, successRate: 80, difficulty: 'Medium', status: 'Healthy' }
    ],
    c3: [
      { name: 'Express Request Pipeline', attempts: 0, averageScore: 0, successRate: 0, difficulty: 'Medium', status: 'Needs Review' }
    ]
  }), []);

  // 3. Dynamic Calendar Events Grouping (Panel 2)
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
        time: e.startTime ? `${e.startTime} - ${e.endTime || ''}` : '09:00 AM',
        title: e.title || 'Scheduled Class',
        course: e.courseName || 'General',
        batch: e.batch || 'Batch A',
        location: e.location || e.room || 'Room B',
        status: e.status || 'Upcoming'
      };
      if (e.date === todayStr) {
        todayEvents.push(item);
      } else if (e.date === tomorrowStr) {
        tomorrowEvents.push(item);
      } else {
        upcomingEvents.push({ ...item, day: e.date || 'Upcoming' });
      }
    });

    return {
      TODAY: todayEvents.length > 0 ? todayEvents : [
        { time: '09:00 AM - 10:30 AM', title: 'Java Streams Deep Dive', course: 'Java Stack', batch: 'Batch A', location: 'Room B', status: 'Upcoming' },
        { time: '11:00 AM - 12:00 PM', title: 'Office Hours: React Hooks Q&A', course: 'React Dev', batch: 'Batch B', location: 'Online Zoom', status: 'Confirmed' }
      ],
      Tomorrow: tomorrowEvents.length > 0 ? tomorrowEvents : [
        { time: '02:00 PM - 03:30 PM', title: 'Context Providers Architecture', course: 'React Dev', batch: 'Batch B', location: 'Room A', status: 'Scheduled' }
      ],
      'Upcoming / This Week': upcomingEvents.length > 0 ? upcomingEvents : [
        { time: 'Thursday, 09:00 AM', title: 'Java Streams API Implementation', course: 'Java Stack', batch: 'Batch A', location: 'Room B', status: 'Scheduled' },
        { time: 'Friday, 04:00 PM', title: 'Assignment 3: SQL Schema Submission', course: 'Java Stack', batch: 'Batch A', location: 'LMS Platform', status: 'Active' }
      ]
    };
  }, [calEvents, todayStr, tomorrowStr]);

  // 4. Dynamic Continue Working Items (Row 2) - Mutated by Published Action
  const prepTabItems = useMemo(() => ({
    Lecture: [
      { id: 'l1', title: 'Java Concurrency & Thread Pools', course: 'Java Stack', status: publishedWorkIds.includes('l1') ? 'Published' : 'Urgent', lastUpdated: '2 hours ago', estTimeRemaining: '25 mins remaining' },
      { id: 'l2', title: 'React Performance Auditing & Memo', course: 'React Dev', status: publishedWorkIds.includes('l2') ? 'Published' : 'Due Today', lastUpdated: '1 day ago', estTimeRemaining: '45 mins remaining' },
      { id: 'l3', title: 'Introduction to Node.js Event Loop', course: 'Express API', status: publishedWorkIds.includes('l3') ? 'Published' : 'Draft', lastUpdated: '3 days ago', estTimeRemaining: '10 mins remaining' },
      { id: 'l4', title: 'SQL Joins & Index Optimizations', course: 'Java Stack', status: publishedWorkIds.includes('l4') ? 'Published' : 'Recently Edited', lastUpdated: '4 days ago', estTimeRemaining: '0 mins remaining' }
    ],
    Assignment: [
      { id: 'a1', title: 'REST API Authentication Controller Lab', course: 'Express API', status: publishedWorkIds.includes('a1') ? 'Published' : 'Overdue', lastUpdated: '4 hours ago', estTimeRemaining: '15 mins remaining' },
      { id: 'a2', title: 'React Custom Hooks State Exercise', course: 'React Dev', status: publishedWorkIds.includes('a2') ? 'Published' : 'Draft', lastUpdated: '2 days ago', estTimeRemaining: '30 mins remaining' },
      { id: 'a3', title: 'SQL Schema normalization challenge', course: 'Java Stack', status: publishedWorkIds.includes('a3') ? 'Published' : 'Recently Edited', lastUpdated: '5 days ago', estTimeRemaining: '0 mins remaining' }
    ],
    Quiz: [
      { id: 'q1', title: 'SQL Joins & Group By Practice Quiz', course: 'Java Stack', status: publishedWorkIds.includes('q1') ? 'Published' : 'Urgent', lastUpdated: '3 hours ago', estTimeRemaining: '10 mins remaining' },
      { id: 'q2', title: 'Java Streams API Intermediate Quiz', course: 'Java Stack', status: publishedWorkIds.includes('q2') ? 'Published' : 'Recently Edited', lastUpdated: '6 days ago', estTimeRemaining: '0 mins remaining' }
    ]
  }), [publishedWorkIds]);

  const priorityOrder = { 'Urgent': 1, 'Due Today': 2, 'Overdue': 3, 'Draft': 4, 'Recently Edited': 5, 'Published': 6 };

  const sortedPrepItems = useMemo(() => {
    const list = prepTabItems[activePrepTab];
    return [...list].sort((a, b) => {
      return (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99);
    });
  }, [activePrepTab, prepTabItems]);

  // 5. Dynamic Categorized Recent Activity (Row 3)
  const dynamicCategorizedActivities = useMemo(() => {
    const todayList = [];
    const yesterdayList = [];
    const earlierList = [];

    notifications.forEach((n, idx) => {
      const typeStr = n.type ? `${n.type.toUpperCase()}` : 'QUIZ_SUBMISSION';
      const item = {
        id: n.id || `notif_${idx}`,
        type: typeStr,
        course: n.course || 'Orange LMS',
        desc: n.title || n.message || 'Quiz Submitted',
        time: n.time || 'RECENTLY',
        href: typeStr.includes('QUIZ')
          ? '/instructor/quizzes'
          : typeStr.includes('ASSIGNMENT')
          ? '/instructor/assignments'
          : typeStr.includes('STUDENT') || typeStr.includes('ENROLL')
          ? '/instructor/students'
          : typeStr.includes('CERTIFICATE')
          ? '/instructor/certificates'
          : '/instructor/courses/c1'
      };
      if (idx < 2) todayList.push(item);
      else if (idx < 4) yesterdayList.push(item);
      else earlierList.push(item);
    });

    return {
      Today: todayList.length > 0 ? todayList : [
        { id: 'act1', type: 'Lesson Edited', course: 'Java Full Stack', desc: 'Edited lesson "Concurrency & Threads"', time: '10:45 AM', href: '/instructor/courses/c1' },
        { id: 'act2', type: 'Quiz Published', course: 'React Architecture', desc: 'Published quiz "React Hooks Basics"', time: '09:15 AM', href: '/instructor/quizzes' }
      ],
      Yesterday: yesterdayList.length > 0 ? yesterdayList : [
        { id: 'act3', type: 'Assignment Reviewed', course: 'Java Full Stack', desc: 'Graded 14 submissions for "SQL Design"', time: 'Yesterday, 04:30 PM', href: '/instructor/assignments' },
        { id: 'act4', type: 'Student Enrolled', course: 'Express API Design', desc: '4 new students enrolled in Course', time: 'Yesterday, 11:20 AM', href: '/instructor/students' }
      ],
      Earlier: earlierList.length > 0 ? earlierList : [
        { id: 'act5', type: 'Certificate Generated', course: 'React Architecture', desc: 'Generated certificate for Rohan Joshi', time: 'July 20, 2026', href: '/instructor/certificates' }
      ]
    };
  }, [notifications]);

  // 6. Dynamic AI Operational Insights
  const dynamicAiInsights = useMemo(() => {
    const pendingTotal = assignments.filter(a => a.status === 'PENDING' || a.status === 'SUBMITTED' || !a.status).length;
    const items = [
      { id: 'ai1', text: '37 students struggled with Java Streams this week.', actionLabel: 'Schedule a revision session', href: '/instructor/calendar' }
    ];
    if (pendingTotal > 0) {
      items.push({ id: 'ai2', text: `${pendingTotal} assignment submissions require grading review.`, actionLabel: 'Grade pending submissions now', href: '/instructor/assignments' });
    } else {
      items.push({ id: 'ai2', text: 'Assignment submission rate dropped by 12%.', actionLabel: 'Send reminder broadcast', href: '/instructor/announcements' });
    }
    items.push({ id: 'ai3', text: 'Quiz average improved by 18% overall.', actionLabel: 'Auto-publish next module', href: '/instructor/courses' });
    items.push({ id: 'ai4', text: 'Five students are likely to fail without intervention.', actionLabel: 'Schedule 1-on-1 office hours', href: '/instructor/calendar' });
    items.push({ id: 'ai5', text: 'Students from Batch B completed modules faster than average.', actionLabel: 'Review module difficulty', href: '/instructor/reports' });
    
    return items.filter(item => !dismissedInsights.includes(item.id));
  }, [assignments, dismissedInsights]);

  // 7. Dynamic Course Performance Cards
  const coursePerformanceInsights = useMemo(() => ({
    c1: [
      { label: 'Students requiring attention', value: '12 students requiring attention' },
      { label: 'Weakest topic', value: 'Java Streams API' },
      { label: 'Best performing topic', value: 'OOP Interfaces' },
      { label: 'Assignments pending grading', value: `${assignments.filter(a => a.courseId === 'c1').length || 8} assignments pending` },
      { label: 'Average quiz improvement', value: '+14% average quiz improvement' },
      { label: 'Students inactive this week', value: '4 students inactive' },
      { label: 'Students missing deadlines', value: '6 students missing deadlines' }
    ],
    c2: [
      { label: 'Students requiring attention', value: '3 students requiring attention' },
      { label: 'Weakest topic', value: 'useEffect Hooks Cleanup' },
      { label: 'Best performing topic', value: 'JSX Render Props' },
      { label: 'Assignments pending grading', value: `${assignments.filter(a => a.courseId === 'c2').length || 2} assignments pending` },
      { label: 'Average quiz improvement', value: '+8% average quiz improvement' },
      { label: 'Students inactive this week', value: '1 student inactive' },
      { label: 'Students missing deadlines', value: '2 students missing deadlines' }
    ]
  }), [assignments]);

  // 8. Student Insights Grouped
  const studentInsightsGrouped = useMemo(() => ({
    'Behind Schedule': [
      { id: 's1', name: 'Amit Sharma', course: 'Java Full Stack', reason: 'Behind average progress by 18%', badge: 'High Priority', critical: true }
    ],
    'Missing Assignments': [
      { id: 's5', name: 'Rahul Varma', course: 'Express API Design', reason: 'Pending: Final Project Outline (2 days overdue)', badge: 'High Priority', critical: true }
    ],
    'Low Quiz Scores': [
      { id: 's2', name: 'Sneha Patil', course: 'Java Full Stack', reason: 'Scored 45% in Java Basics Quiz', badge: 'High Priority', critical: true }
    ],
    'Attendance Issues': [
      { id: 's3', name: 'Karan Malhotra', course: 'React Development', reason: 'Missed last 3 consecutive live sessions (65% rate)', badge: 'High Priority', critical: true }
    ],
    'Outstanding Performance': [
      { id: 's4', name: 'Meera Deshmukh', course: 'React Development', reason: 'Maintains 96% quiz average and finished 100% course path', badge: 'Normal', critical: false }
    ],
    'Needs Feedback': [
      { id: 's6', name: 'Priya Sen', course: 'Java Full Stack', reason: 'Submitted Java Streams Code: Awaiting review', badge: 'Medium Priority', critical: false }
    ]
  }), []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col gap-6 select-none bg-[#080B11] pb-10">
      
      {/* 1. QUICK ACTION BAR - WHATSAPP STYLE HORIZONTAL NAVIGATION */}
      <div className="flex items-center justify-between bg-[#0D1021] border border-[#1A1F35] rounded-xl p-2 relative overflow-visible">
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
                    className="block px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-255 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    Make Announcement
                  </Link>
                  <Link
                    href="/instructor/reports"
                    onClick={() => setMoreActionsOpen(false)}
                    className="block px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-255 hover:bg-white/[0.03] rounded-lg transition"
                  >
                    View Reports
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. ROW 1: MY COURSES | CALENDAR | MESSAGES & NEWS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* PANEL 1: MY COURSES (DYNAMIC DENSITY) */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">My Courses ({coursesData.length})</h2>
            <Link href="/instructor/courses" className="text-[10px] font-black text-orange-400 hover:text-orange-355 transition">
              View All
            </Link>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-0.5">
            {coursesData.map((course) => {
              const summaries = getCourseActionSummaries(course);
              return (
                <div key={course.id} className="p-4 rounded-xl bg-white/[0.01] border border-[#1A1F35] flex flex-col gap-3.5 transition hover:border-slate-800">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-200 truncate pr-2">{course.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          course.status === 'Published' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450' 
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-455'
                        }`}>
                          {course.status}
                        </span>
                        <span className="text-[9px] text-slate-500 font-extrabold">{course.batch || 'Batch A'} &bull; {course.studentsCount || 145} Enrolled</span>
                      </div>
                    </div>
                    {/* Thumbnail placeholder */}
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-600/30 to-pink-600/30 border border-orange-550/20 flex items-center justify-center shrink-0">
                      <span className="text-xs">📚</span>
                    </div>
                  </div>

                  {/* Course Completion Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-455">
                      <span>Course Completion Progress</span>
                      <span>72%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>

                  {/* Dynamic Actionable Summaries */}
                  <div className="p-3 rounded-lg bg-white/[0.01] border border-[#1A1F35] space-y-1.5 text-[10px] font-bold text-slate-350 leading-relaxed">
                    {summaries.map((summary, idx) => (
                      <p key={idx} className="flex items-start gap-1">
                        <span className="text-orange-450 shrink-0">&bull;</span>
                        <span>{summary}</span>
                      </p>
                    ))}
                  </div>

                  {/* Dynamic Concept Analytics Table */}
                  <div className="mt-1 border-t border-[#1A1F35]/50 pt-2.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider font-mono">Concept Analytics</p>
                      <Link href={`/instructor/reports?courseId=${course.id}`} className="text-[8.5px] font-black text-slate-500 hover:text-slate-300">
                        View All Analytics &rarr;
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {(conceptAnalytics[course.id] || conceptAnalytics.c1).map((concept, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#080B11] border border-white/5 flex flex-col gap-1 text-[9.5px]">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-250 truncate max-w-[150px]">{concept.name}</span>
                            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                              concept.status === 'Needs Review' 
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                            }`}>
                              {concept.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-semibold mt-0.5">
                            <span>{concept.attempts} Attempts</span>
                            <span>Avg Score: {concept.averageScore}%</span>
                            <span className="text-orange-450">Success: {concept.successRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Course Navigation */}
                  <div className="pt-2 border-t border-[#1A1F35]/30">
                    <Link href={`/instructor/courses/${course.id}`} className="w-full flex items-center justify-center py-2.5 rounded-xl bg-orange-500 hover:bg-orange-405 text-white text-[10.5px] font-black transition text-center shadow-lg shadow-orange-500/10">
                      View Course &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: DYNAMIC CALENDAR EMPHASIZING TODAY */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Calendar Schedule</h2>
            <Link href="/instructor/calendar" className="text-[10px] font-black text-orange-400 hover:text-orange-355 transition">
              Open Scheduling Page
            </Link>
          </div>

          {/* Dynamic Grouping */}
          <div className="space-y-4 overflow-y-auto max-h-[480px] pr-0.5 my-1">
            {Object.entries(dynamicCalendarScheduleGrouped).map(([group, events]) => (
              <div key={group} className="space-y-2">
                <h3 className={`text-[9px] font-black uppercase tracking-widest border-b border-[#1A1F35] pb-1 font-mono ${
                  group === 'TODAY' ? 'text-orange-450' : 'text-slate-500'
                }`}>
                  {group} ({events.length})
                </h3>
                <div className="space-y-2">
                  {events.map((event, idx) => (
                    <Link href="/instructor/calendar" key={idx} className="block p-3 bg-white/[0.01] border border-[#1A1F35] rounded-xl transition hover:border-slate-800 hover:bg-white/[0.02]">
                      <div className="flex justify-between items-center text-[8.5px] font-black">
                        <span className="text-slate-500">{event.time}</span>
                        <span className={`px-1.5 py-0.5 rounded ${
                          event.status === 'Upcoming' ? 'bg-orange-500/10 text-orange-455' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-black text-slate-200 mt-1.5 leading-snug">{event.title}</h4>
                      <div className="flex justify-between items-center text-[9px] text-slate-600 font-semibold mt-1">
                        <span>{event.course} &bull; {event.batch}</span>
                        <span>📍 {event.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3: DYNAMIC MESSAGES & NEWS (ACCORDIONS WITH REAL UNREADS) */}
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
          <div className="border-b border-[#1A1F35] pb-3">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Messages & News</h2>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[480px] pr-0.5">
            
            {/* Accordion 1: Student Messages */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('messages')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-250 flex items-center gap-1.5">
                  💬 Unread Student Messages {conversations.filter(c => c.unread > 0).length > 0 && `(${conversations.filter(c => c.unread > 0).length})`}
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.messages ? '▲' : '▼'}</span>
              </button>
              {openAccordions.messages && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2.5 animate-in slide-in-from-top-1 duration-150">
                  {conversations.length > 0 ? (
                    conversations.slice(0, 3).map((conv) => (
                      <Link key={conv.id} href="/instructor/messages" className="block p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-350">
                          <span>{conv.name || 'Student Query'}</span>
                          {conv.unread > 0 ? (
                            <span className="text-orange-450 font-black">Unread</span>
                          ) : (
                            <span className="text-slate-655 font-bold">Read</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-snug mt-1">{conv.lastMessage || 'Message preview...'}</p>
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link href="/instructor/messages" className="block p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition">
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-350">
                          <span>Amit S. (Java Stack)</span>
                          <span className="text-orange-450 font-black">Unread</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate leading-snug mt-1">"Can you please check my Quiz 2 submission?"</p>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Institute Announcements */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('announcements')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-250 flex items-center gap-1.5">
                  📢 Institute Announcements
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.announcements ? '▲' : '▼'}</span>
              </button>
              {openAccordions.announcements && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2 animate-in slide-in-from-top-1 duration-150">
                  <Link href="/instructor/announcements" className="block text-[10px] p-2.5 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-[#1A1F35]/10 leading-relaxed">
                    <p className="font-extrabold text-slate-300">System Maintenance Notice</p>
                    <p className="text-slate-500 mt-0.5">LMS server will undergo maintenance this Sunday from 02:00 AM.</p>
                  </Link>
                </div>
              )}
            </div>

            {/* Accordion 3: System Notifications */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('notifications')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-250 flex items-center gap-1.5">
                  🔔 System Notifications ({notifications.length})
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.notifications ? '▲' : '▼'}</span>
              </button>
              {openAccordions.notifications && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2 animate-in slide-in-from-top-1 duration-150">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-white/[0.01] text-[9.5px] text-slate-550 border border-white/5">
                        <p className="text-slate-350">{n.title || n.message}</p>
                        <span className="text-[8px] text-slate-600 block mt-0.5">{n.time || 'Recently'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-lg bg-white/[0.01] text-[9.5px] text-slate-550 border border-white/5">
                      <p className="text-slate-350">Quiz "Java Basics Quiz" generated 45 reviews.</p>
                      <span className="text-[8px] text-slate-600 block mt-0.5">4 hours ago</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 4: Course Updates */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('updates')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-250 flex items-center gap-1.5">
                  🔄 Course Updates ({modules.length})
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.updates ? '▲' : '▼'}</span>
              </button>
              {openAccordions.updates && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2 animate-in slide-in-from-top-1 duration-150">
                  {modules.length > 0 ? (
                    modules.slice(0, 2).map((m) => (
                      <div key={m.id} className="p-2 rounded-lg bg-white/[0.01] text-[9.5px] text-slate-550 border border-white/5">
                        <p className="text-slate-355 font-bold">{m.title || m.name}</p>
                        <p className="text-slate-500 mt-0.5">Updated module details</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-lg bg-white/[0.01] text-[9.5px] text-slate-550 border border-white/5">
                      <p className="text-slate-355 font-bold">"Express API Design"</p>
                      <p className="text-slate-500 mt-0.5">Added Module 3: Security Basics</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 5: Recent Student Feedback */}
            <div className="border border-[#1A1F35] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('feedback')}
                className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition text-left cursor-pointer"
              >
                <span className="text-[10.5px] font-black text-slate-250 flex items-center gap-1.5">
                  ⭐ Recent Student Feedback
                </span>
                <span className="text-slate-500 text-xs">{openAccordions.feedback ? '▲' : '▼'}</span>
              </button>
              {openAccordions.feedback && (
                <div className="p-3 bg-transparent border-t border-[#1A1F35] space-y-2 animate-in slide-in-from-top-1 duration-150">
                  <Link href="/instructor/reports" className="block p-2 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.02] transition">
                    <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-350">
                      <span>Anonymous Student</span>
                      <span className="text-emerald-450 font-black">★★★★★</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-1">"Excellent explanation of Streams map & reduce."</p>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 3. ROW 2: CONTINUE WORKING - DYNAMICALLY MUTATED BY PUBLISH ACTION */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#1A1F35] pb-3">
          <div className="h-3 w-0.5 rounded-full bg-orange-400" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Continue Working</h2>
        </div>

        {/* Tabs Selector */}
        <div className="flex gap-2.5 border-b border-[#1A1F35] pb-1">
          {['Lecture', 'Assignment', 'Quiz'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePrepTab(tab)}
              className={`pb-2.5 px-1 text-xs font-black transition relative cursor-pointer ${
                activePrepTab === tab ? 'text-orange-400' : 'text-slate-500 hover:text-slate-355'
              }`}
            >
              {tab} Preparation
              {activePrepTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Prioritized list items */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-1">
          {sortedPrepItems.map((work) => (
            <div key={work.id} className="p-4 bg-white/[0.01] border border-[#1A1F35] rounded-xl flex flex-col justify-between min-h-[155px] transition hover:border-slate-800">
              <div>
                <div className="flex justify-between items-start gap-1">
                  <h3 className="text-xs font-extrabold text-slate-200 leading-snug">{work.title}</h3>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    work.status === 'Published'
                      ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                      : work.status === 'Urgent' || work.status === 'Overdue'
                      ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                      : work.status === 'Due Today'
                      ? 'bg-orange-500/10 text-orange-455 border border-orange-500/20'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>{work.status}</span>
                </div>
                
                <div className="flex flex-col gap-0.5 mt-2.5 text-[9px] text-slate-500 font-bold">
                  <p className="truncate">{work.course}</p>
                  <p>Last Updated: {work.lastUpdated}</p>
                  <p className="text-orange-450 mt-0.5">Estimated Time Remaining: {work.estTimeRemaining}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-1 mt-3.5">
                <button className="flex items-center justify-center p-1.5 rounded-lg bg-orange-500 hover:bg-orange-405 text-white text-[9px] font-black transition cursor-pointer">
                  Continue
                </button>
                <button className="flex items-center justify-center p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black transition text-slate-200 cursor-pointer">
                  Preview
                </button>
                <Link href={`/instructor/${activePrepTab.toLowerCase()}s`} className="flex items-center justify-center p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black transition text-slate-200 text-center">
                  Edit
                </Link>
                <button
                  onClick={() => handlePublishWork(work.id)}
                  disabled={work.status === 'Published'}
                  className={`flex items-center justify-center p-1.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                    work.status === 'Published'
                      ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  {work.status === 'Published' ? 'Done' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ROW 3: DYNAMIC CATEGORIZED RECENT ACTIVITY */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Recent Activity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(dynamicCategorizedActivities).map(([timeframe, items]) => (
            <div key={timeframe} className="space-y-3">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-[#1A1F35] pb-1.5 mb-2 font-mono">
                {timeframe}
              </h3>
              <div className="space-y-2">
                {items.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-white/[0.01] border border-[#1A1F35] flex flex-col gap-1.5 justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase">
                        <span>{act.type}</span>
                        <span>{act.time}</span>
                      </div>
                      <p className="text-[10.5px] font-bold text-slate-350 mt-1 leading-snug">{act.desc}</p>
                      <p className="text-[8.5px] text-orange-455 font-bold mt-0.5">{act.course}</p>
                    </div>
                    <Link href={act.href || '/instructor/courses/c1'} className="self-end text-[9px] font-black text-slate-455 hover:text-slate-200 flex items-center gap-0.5 mt-1 border-t border-white/5 pt-1.5 w-full justify-end">
                      Open Details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. COURSE PERFORMANCE - DYNAMIC ACTION INSIGHTS */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1A1F35] pb-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Course Performance</h2>
          <Link href="/instructor/reports" className="text-[10px] font-black text-orange-400 hover:text-orange-355 transition">
            View All Reports &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coursesData.slice(0, 2).map((course) => {
            const insights = coursePerformanceInsights[course.id] || coursePerformanceInsights.c1;
            return (
              <div key={course.id} className="p-4 bg-white/[0.01] border border-[#1A1F35] rounded-xl flex flex-col gap-3">
                <h4 className="text-xs font-black text-slate-200 border-b border-[#1A1F35] pb-2">{course.title}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-1">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#080B11] border border-white/5">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-wider">{insight.label}</p>
                      <p className="text-[10px] font-black text-slate-200 mt-1 leading-snug">{insight.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Link href={`/instructor/reports?courseId=${course.id}`} className="text-[9.5px] font-black text-orange-455 hover:text-orange-400 flex items-center gap-0.5">
                    View Report &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DYNAMIC AI OPERATIONAL INSIGHTS */}
      {dynamicAiInsights.length > 0 && (
        <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1F35]">
            <div className="flex items-center gap-2">
              <Bot size={13} className="text-purple-400" />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">AI Operational Insights</h2>
            </div>
            <span className="text-[9px] text-slate-500 font-bold">{dynamicAiInsights.length} active suggestions</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-1">
            {dynamicAiInsights.map((insight) => (
              <div key={insight.id} className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex flex-col justify-between min-h-[110px]">
                <p className="text-[10px] font-black text-slate-200 leading-relaxed">{insight.text}</p>
                <div className="flex justify-between items-center mt-2 border-t border-purple-500/10 pt-1.5">
                  <Link href={insight.href} className="text-[9px] font-black text-purple-400 hover:text-purple-300">
                    Action: {insight.actionLabel} &rarr;
                  </Link>
                  <button
                    onClick={() => setDismissedInsights(prev => [...prev, insight.id])}
                    className="text-[8px] text-slate-500 hover:text-slate-300 font-bold"
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

      {/* 7. STUDENT INSIGHTS GROUPED BY ATTENTION CATEGORIES */}
      <div className="bg-[#0D1021] border border-[#1A1F35] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#1A1F35] pb-3">
          <div className="h-3 w-0.5 rounded-full bg-orange-400" />
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Student Insights (Attention Required)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(studentInsightsGrouped).map(([category, items]) => {
            const insight = items[0]; 
            return (
              <div 
                key={category} 
                className={`p-3.5 rounded-xl flex flex-col justify-between min-h-[155px] transition ${
                  insight.critical 
                    ? 'bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/30' 
                    : 'bg-white/[0.01] border border-[#1A1F35] hover:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider font-mono">{category}</span>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${
                      insight.critical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`} />
                  </div>
                  
                  <div className="mt-2.5">
                    <p className="text-[10.5px] font-black text-slate-200 truncate">{insight.name}</p>
                    <p className="text-[8px] font-extrabold text-slate-655 truncate mt-0.5">{insight.course}</p>
                    <p className="text-[9.5px] font-extrabold text-slate-350 leading-snug mt-1.5">{insight.reason}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-3 pt-2 border-t border-white/5">
                  <Link href={`/instructor/students?studentId=${insight.id}`} className="text-center py-1 rounded bg-white/5 hover:bg-white/10 text-[8.5px] font-black text-slate-300">
                    Profile &rarr;
                  </Link>
                  <Link href={`/instructor/messages?studentId=${insight.id}`} className="text-center py-1 rounded bg-orange-500/10 hover:bg-orange-500/15 border border-orange-550/20 text-[8.5px] font-black text-orange-455">
                    Message &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
