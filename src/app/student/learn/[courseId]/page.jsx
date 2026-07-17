"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Bell, MessageSquare, ArrowLeft, BookOpen, Clock3, 
  ChevronDown, ChevronRight, PlayCircle, CheckCircle2,
  Menu, Sparkles, CheckCheck
} from "lucide-react";
import { 
  FaTachometerAlt, FaGraduationCap, FaBook, FaVideo, 
  FaClipboardList, FaQuestionCircle, FaFileAlt, FaBookmark, 
  FaTrophy, FaCog, FaBars, FaSignOutAlt, FaEnvelope 
} from "react-icons/fa";
import { PiOrangeDuotone } from "react-icons/pi";

import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import VideoPlayer from "@/components/student/learning/VideoPlayer";
import LessonTabs from "@/components/student/learning/LessonTabs";
import LessonNavigation from "@/components/student/learning/LessonNavigation";
import useCompleteLesson from "@/hooks/queries/student/useCompleteLesson";
import { useCourse, useStudentState, useUpdateStudentState } from "@/hooks/queries/student";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/student/courses/ProgressBar";
import { trackCourseAccess } from "@/services/enrollment.service";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { useNotification } from "@/context/NotificationContext";
import { SIDEBAR_ITEMS } from "@/constants/sidebar";

export default function LearnPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { data, isLoading, isError } = useCourse(courseId);
  const { data: stateData, isLoading: isStateLoading } = useStudentState();
  const updateStateMutation = useUpdateStudentState();
  const completeLessonMutation = useCompleteLesson();

  const { logout, user: currentUser } = useAuth();
  const { toggleChat, isOpen: chatOpen, chatUnreadCount } = useChat();
  const { notifications, markAllRead, clearAll, markAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  // Double Sidebar Toggles
  const [mainSidebarOpen, setMainSidebarOpen] = useState(true);
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false);

  const course = data?.data || data;

  const lessons = useMemo(() => {
    const modules = course?.modules || [];
    return modules.flatMap((module) =>
      (module.lessons || []).map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        duration: lesson.duration || "N/A",
      }))
    );
  }, [course]);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [stateRestored, setStateRestored] = useState(false);
  const [expandedModules, setExpandedModules] = useState([]);

  // Auto-expand modules when course loads
  useEffect(() => {
    if (course?.modules) {
      setExpandedModules(course.modules.map((m) => m.id));
    }
  }, [course]);

  // Track course access — stamps lastAccessedAt on the enrollment once on mount
  useEffect(() => {
    if (courseId) {
      trackCourseAccess(courseId);
    }
  }, [courseId]);

  // Restore state from DB on load
  useEffect(() => {
    if (isStateLoading || isLoading || stateRestored) return;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLessonId = urlParams.get("lessonId");
      if (queryLessonId) {
        const matchedLesson = lessons.find((l) => l.id === queryLessonId);
        if (matchedLesson) {
          setSelectedLesson(matchedLesson);
          setStateRestored(true);
          return;
        }
      }
    }

    const savedState = stateData?.data || stateData;
    if (savedState && savedState.courseId === courseId && savedState.lessonId) {
      const matchedLesson = lessons.find((l) => l.id === savedState.lessonId);
      if (matchedLesson) {
        setSelectedLesson(matchedLesson);
        if (savedState.timestamp) {
          setInitialTime(savedState.timestamp);
          setCurrentTimestamp(savedState.timestamp);
        }
        setStateRestored(true);
        return;
      }
    }

    if (!selectedLesson && lessons.length > 0) {
      setSelectedLesson(lessons[0]);
      setStateRestored(true);
    }
  }, [lessons, selectedLesson, stateData, isStateLoading, isLoading, courseId, stateRestored]);

  // Reset initialTime to 0 when selectedLesson changes, except on mount restore
  useEffect(() => {
    if (stateRestored) {
      setInitialTime(0);
    }
  }, [selectedLesson, stateRestored]);

  // Sync state back to DB on change (debounced)
  useEffect(() => {
    if (!selectedLesson?.id || !stateRestored) return;

    const timer = setTimeout(() => {
      updateStateMutation.mutate({
        courseId,
        moduleId: selectedLesson.moduleId || null,
        lessonId: selectedLesson.id,
        contentId: selectedLesson.contents?.[0]?.id || null,
        timestamp: currentTimestamp,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [selectedLesson, currentTimestamp, courseId, stateRestored]);

  const markComplete = async () => {
    if (!selectedLesson?.id) return;
    completeLessonMutation.mutate(selectedLesson.id);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Sticky Notes constraint: hide if both sidebars are open, show if one or both are closed
  const showStickyNotes = !(mainSidebarOpen && courseSidebarOpen);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return <Card className="text-slate-300">Course not found.</Card>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalLessons = course.modules?.reduce(
    (total, module) => total + (module.lessons?.length || 0),
    0
  ) || 0;

  // Add messages sidebar item dynamically to match the mockup
  const sidebarItems = [
    ...(SIDEBAR_ITEMS.STUDENT || []),
    {
      title: "Messages",
      icon: FaEnvelope,
      href: "/student/messages"
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* SIDEBAR 1: MAIN NAVIGATION */}
      {/* ========================================================================= */}
      <motion.aside
        animate={{ width: mainSidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-[#0d0e16] border-r border-[#1e2030] flex-shrink-0 flex flex-col z-20 overflow-y-auto relative select-none"
      >
        {/* Header Block */}
        <div className="p-4 flex items-center justify-between min-h-[64px] border-b border-[#1e2030]/40">
          {mainSidebarOpen ? (
            <div className="flex items-center gap-3">
              <PiOrangeDuotone className="text-2xl text-orange-500" />
              <h1 className="text-base font-bold text-orange-500 tracking-wide truncate">
                Orange Tree LMS
              </h1>
            </div>
          ) : (
            <button 
              onClick={() => setMainSidebarOpen(true)}
              className="mx-auto text-2xl text-orange-500 hover:scale-105 transition cursor-pointer font-semibold bg-transparent border-0 outline-none"
            >
              <PiOrangeDuotone />
            </button>
          )}

          {mainSidebarOpen && (
            <button
              onClick={() => setMainSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="py-4 px-2 space-y-1.5 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isMyLearning = item.title === "My Learning";
            const isActive = isMyLearning; // Highlight My Learning as parent of learn player
            
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  !mainSidebarOpen ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-slate-800/80 text-white border-l-4 border-orange-500 font-semibold shadow-inner"
                    : "border-l-4 border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                }`}
                title={!mainSidebarOpen ? item.title : ""}
              >
                <Icon className={`text-lg transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-200"
                }`} />
                {mainSidebarOpen && (
                  <span className="text-sm tracking-wide truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* ========================================================================= */}
      {/* SIDEBAR 2: COURSE CONTENT */}
      {/* ========================================================================= */}
      <motion.aside
        animate={{ width: courseSidebarOpen ? 320 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-[#0d0e16] border-r border-[#1e2030] flex-shrink-0 flex flex-col z-10 overflow-y-auto relative select-none"
      >
        {/* Header Block */}
        <div className="p-4 flex items-center justify-between min-h-[64px] border-b border-[#1e2030]/40">
          {courseSidebarOpen ? (
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-sm font-semibold text-white truncate">
                Course Content
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {course.modules?.length || 0} Modules
              </p>
            </div>
          ) : (
            <button 
              onClick={() => setCourseSidebarOpen(true)}
              className="mx-auto text-slate-400 hover:text-white p-1 rounded-lg transition-all cursor-pointer bg-transparent border-0 outline-none"
              title="Expand Course Content"
            >
              <BookOpen size={20} className="text-orange-500 animate-pulse" />
            </button>
          )}

          {courseSidebarOpen && (
            <button
              onClick={() => setCourseSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Collapsed view modules list */}
        {!courseSidebarOpen ? (
          <div className="py-6 flex flex-col items-center gap-4">
            {course.modules?.map((module, idx) => (
              <button
                key={module.id}
                onClick={() => setCourseSidebarOpen(true)}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-orange-500/20 border border-slate-700/60 hover:border-orange-500/50 flex items-center justify-center text-xs font-bold text-orange-400 transition-all cursor-pointer outline-none"
                title={`Module ${idx + 1}: ${module.title}`}
              >
                M{idx + 1}
              </button>
            ))}
          </div>
        ) : (
          /* Expanded Accordion list */
          <div className="divide-y divide-slate-800/60 flex-1 overflow-y-auto">
            {course.modules?.map((module, moduleIndex) => {
              const expanded = expandedModules.includes(module.id);
              return (
                <div key={module.id} className="bg-slate-900/10">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5 transition hover:bg-slate-850 bg-transparent border-0 outline-none cursor-pointer"
                  >
                    <div className="text-left min-w-0 flex-1 pr-2">
                      <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                        Module {moduleIndex + 1}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-slate-350 truncate">
                        {module.title}
                      </p>
                    </div>
                    {expanded ? (
                      <ChevronDown size={14} className="text-slate-450 flex-shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-450 flex-shrink-0" />
                    )}
                  </button>

                  {expanded && (
                    <div className="space-y-1 pb-3 px-2">
                      {(module.lessons || []).map((lesson, lessonIndex) => {
                        const active = selectedLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all cursor-pointer border-0 outline-none ${
                              active
                                ? "bg-orange-500 text-white font-medium shadow-lg shadow-orange-600/10"
                                : "hover:bg-slate-800/40 text-slate-300 bg-transparent"
                            }`}
                          >
                            <PlayCircle size={15} className={active ? "text-white" : "text-orange-500"} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">
                                Lesson {lessonIndex + 1}
                              </p>
                              <p className={`truncate text-[10px] ${active ? "text-orange-100" : "text-slate-400"}`}>
                                {lesson.title}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      {module.lessons?.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-500 italic">
                          No lessons available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.aside>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#07080f]">
        
        {/* ========================================================== */}
        {/* TOP NAVBAR / HEADER */}
        {/* ========================================================== */}
        <header className="sticky top-0 bg-[#07080f]/80 backdrop-blur-md border-b border-[#1e2030]/40 py-3.5 px-6 flex items-center justify-between z-30 select-none">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Messages button */}
            <button
              onClick={toggleChat}
              className={`p-2.5 rounded-xl transition relative flex items-center justify-center border-0 cursor-pointer outline-none ${
                chatOpen
                  ? "bg-slate-800 text-orange-500"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
              title="Messages"
            >
              <MessageSquare size={16} />
              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                  {chatUnreadCount}
                </span>
              )}
            </button>

            {/* Notification button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition relative flex items-center justify-center border-0 cursor-pointer outline-none ${
                  showNotifications
                    ? "bg-slate-800 text-orange-500"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications drop panel */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowNotifications(false)}
                  />

                  <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-800 bg-[#0d0e16]/95 backdrop-blur-md p-4 shadow-2xl text-slate-200">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
                      <h3 className="font-bold text-xs text-white flex items-center gap-2">
                        <Bell size={14} className="text-orange-500" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                        >
                          <CheckCheck size={12} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto mt-2 space-y-2 pr-1 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              setShowNotifications(false);
                            }}
                            className={`flex gap-3 p-2.5 rounded-xl transition border text-left cursor-pointer ${
                              n.read
                                ? "bg-slate-900/10 hover:bg-slate-900/30 border-transparent"
                                : "bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/10"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-white truncate">
                                {n.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed break-words">
                                {n.message}
                              </p>
                            </div>
                            {!n.read && (
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 self-center flex-shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="bg-red-600/10 hover:bg-red-650 border border-red-500/20 text-red-400 hover:text-white transition p-2.5 rounded-xl flex items-center justify-center cursor-pointer outline-none"
              title="Sign Out"
            >
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </header>

        {/* ========================================================== */}
        {/* COURSE DETAILS / INFO BANNER */}
        {/* ========================================================== */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <Link
              href="/student/my-courses"
              className="inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-orange-400"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to My Courses
            </Link>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left Info */}
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                  {course.title}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-orange-500" />
                    <span>{course.modules?.length || 0} Modules</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-orange-500" />
                    <span>{totalLessons} Lessons</span>
                  </div>
                </div>
              </div>

              {/* Right Progress */}
              <div className="w-full md:w-64 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Course Progress</span>
                  <span className="font-bold text-orange-400">0%</span>
                </div>
                <ProgressBar value={0} />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Complete every lesson to finish this course.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* COURSE CONTENT VIDEO PLAYER AND STICKY NOTES */}
          {/* ========================================================== */}
          <div className={`grid gap-6 ${showStickyNotes ? "grid-cols-1 xl:grid-cols-[1fr_360px]" : "grid-cols-1"}`}>
            
            {/* Left Player Area */}
            <div className="space-y-6">
              <VideoPlayer
                content={selectedLesson?.contents?.[0]}
                onTimeUpdate={setCurrentTimestamp}
                initialTime={initialTime}
              />
            </div>

            {/* Right Sticky Notes Area (Hidden when both sidebars are open) */}
            {showStickyNotes && (
              <div className="w-full">
                <StickyNotesPanel
                  lessonId={selectedLesson?.id}
                  currentTimestamp={currentTimestamp}
                />
              </div>
            )}
          </div>

          {/* ========================================================== */}
          {/* TABS & NAVIGATION */}
          {/* ========================================================== */}
          <div className="pt-6 border-t border-slate-900 space-y-6">
            <LessonTabs
              lesson={selectedLesson}
              course={course}
            />

            <LessonNavigation
              activeLesson={selectedLesson}
              previousLesson={null}
              nextLesson={null}
              onPrevious={() => {}}
              onNext={() => {}}
              onComplete={markComplete}
              isCompleting={completeLessonMutation.isPending}
            />
          </div>
        </div>

      </div>
    </div>
  );
}