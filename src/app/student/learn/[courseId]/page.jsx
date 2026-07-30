"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  X, Bell, MessageSquare, ArrowLeft, BookOpen, Clock3,
  ChevronDown, ChevronRight, ChevronLeft, PlayCircle,
  CheckCheck, HelpCircle, Star, CheckCircle2, FileText, Download,
  AlignLeft, StickyNote, Paperclip, Bookmark, BookmarkCheck, ClipboardList
} from "lucide-react";
import { FaSignOutAlt } from "react-icons/fa";

import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import VideoPlayer from "@/components/student/learning/VideoPlayer";
import TranscriptPanel from "@/components/student/learning/TranscriptPanel";
import LessonTabs from "@/components/student/learning/LessonTabs";
import CourseContentAccordion from "@/components/student/learning/CourseContentAccordion";
import useCompleteLesson from "@/hooks/queries/student/useCompleteLesson";
import { useCourse, useStudentState, useUpdateStudentState } from "@/hooks/queries/student";
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "@/hooks/queries/student/useBookmarks";
import useProgress from "@/hooks/queries/student/useProgress";
import useTranscript from "@/hooks/queries/student/useTranscript";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { trackCourseAccess } from "@/services/enrollment.service";
import { ChatWidget } from "@/components/chat";
import { createConversation } from "@/features/chat/api/chat.api";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { useNotification } from "@/context/NotificationContext";

export default function LearnPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useCourse(courseId);
  const { data: stateData, isLoading: isStateLoading } = useStudentState();
  const updateStateMutation = useUpdateStudentState();
  const completeLessonMutation = useCompleteLesson();
  const { data: progressData } = useProgress();
  const courseProgress = useMemo(() => {
    if (!progressData?.courses) return 0;
    const match = progressData.courses.find((c) => c.id === courseId);
    return match ? Math.round(match.progress) : 0;
  }, [progressData, courseId]);
  const courseProgressDetail = useMemo(() => {
    const match = progressData?.courses?.find((c) => c.id === courseId);
    return {
      completedLessons: match?.completedLessons || 0,
      totalLessons: match?.totalLessons || 0,
    };
  }, [progressData, courseId]);

  const { logout } = useAuth();
  const { toggleChat, isOpen: chatOpen, chatUnreadCount, conversations = [], setConversations, setActiveConversation, setIsOpen } = useChat();
  const { notifications, markAllRead, markAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  // Course Content Sidebar toggle state
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false);

  const videoPlayerRef = useRef(null);

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
  const [videoDuration, setVideoDuration] = useState(0);
  const [stateRestored, setStateRestored] = useState(false);
  const [expandedModules, setExpandedModules] = useState([]);

  // Embedded (non-drawer) Course Content accordion state — independent of the
  // desktop sidebar so only one module is expanded at a time on mobile/tablet,
  // always the module containing the lesson currently playing.
  const [activeModuleId, setActiveModuleId] = useState(null);
  const toggleMobileModule = (moduleId) => {
    setActiveModuleId((prev) => (prev === moduleId ? null : moduleId));
  };
  const [mobileContentCollapsed, setMobileContentCollapsed] = useState(false);

  // Mobile tab strip (Overview/Transcript/Notes/Resources/Query/Feedback/Quiz) —
  // desktop shows the same content stacked, unconditionally, via xl: overrides.
  const [activeContentTab, setActiveContentTab] = useState("overview");

  const { data: bookmarks = [] } = useBookmarks();
  const createBookmarkMutation = useCreateBookmark();
  const deleteBookmarkMutation = useDeleteBookmark();
  const isLessonBookmarked =
    bookmarks?.some((b) => b.lessonId === selectedLesson?.id && b.type === "Lesson") || false;

  const handleBookmarkLesson = async () => {
    if (!selectedLesson) return;
    if (isLessonBookmarked) {
      const bookmark = bookmarks?.find(
        (b) => b.lessonId === selectedLesson?.id && b.type === "Lesson"
      );
      if (bookmark) {
        try {
          await deleteBookmarkMutation.mutateAsync(bookmark.id);
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      try {
        await createBookmarkMutation.mutateAsync({
          type: "Lesson",
          title: selectedLesson.title,
          detail: course?.title || "",
          courseId: course?.id || "",
          lessonId: selectedLesson.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Compute lesson index and navigation targets
  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === selectedLesson?.id);
  }, [lessons, selectedLesson]);

  const previousLesson = useMemo(() => {
    return currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  }, [lessons, currentLessonIndex]);

  const nextLesson = useMemo(() => {
    return currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;
  }, [lessons, currentLessonIndex]);

  // Does finishing the current lesson cross into a new module?
  const nextModule = useMemo(() => {
    if (!nextLesson || !selectedLesson || nextLesson.moduleId === selectedLesson.moduleId) {
      return null;
    }
    return course?.modules?.find((m) => m.id === nextLesson.moduleId) || null;
  }, [nextLesson, selectedLesson, course]);

  const handleVideoEnded = () => {
    markComplete();
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  // Auto-expand modules when course loads (desktop sidebar)
  useEffect(() => {
    if (course?.modules) {
      setExpandedModules(course.modules.map((m) => m.id));
    }
  }, [course]);

  // Embedded Course Content accordion: keep the current lesson's module
  // expanded and every other module collapsed, so switching lessons never
  // requires manually opening/closing sections.
  useEffect(() => {
    if (selectedLesson?.moduleId) {
      setActiveModuleId(selectedLesson.moduleId);
    }
  }, [selectedLesson?.moduleId]);

  // Track course access
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
    completeLessonMutation.mutate({ lessonId: selectedLesson.id });
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

  const { segments: transcriptSegments, status: transcriptStatus } = useTranscript(selectedLesson?.id);

  const handleTranscriptSeek = (seconds) => {
    videoPlayerRef.current?.seekTo(seconds);
  };

  const instructorAttachments = useMemo(() => {
    return (selectedLesson?.contents || []).filter(
      (c) => c.type === "FILE" || c.type === "DOCUMENT" || c.type === "HTML" || Boolean(c.fileUrl)
    );
  }, [selectedLesson]);

  const formatResumeTime = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // "About this lesson" clamps to 3 lines by default so it reads as a
  // compact paragraph instead of pushing the video/tabs further down; a
  // Read More toggle reveals the rest. Collapses again on every new lesson.
  const overviewDescription = selectedLesson?.description || "No specific lesson objectives provided.";
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  useEffect(() => {
    setOverviewExpanded(false);
  }, [selectedLesson?.id]);

  // Mobile tab strip definition — mirrors the desktop stacked sections 1:1,
  // just presented one-at-a-time instead of all at once.
  const contentTabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "transcript", label: "Transcript", icon: AlignLeft },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "resources", label: "Resources", icon: Paperclip },
    { id: "query", label: "Query", icon: HelpCircle },
    { id: "feedback", label: "Feedback", icon: Star },
    { id: "quiz", label: "Quiz", icon: ClipboardList },
  ];

  // Tap-to-scroll controls for the tab strip, so reaching hidden tabs doesn't
  // require a swipe gesture.
  const tabStripRef = useRef(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  const updateTabScrollState = () => {
    const el = tabStripRef.current;
    if (!el) return;
    setCanScrollTabsLeft(el.scrollLeft > 4);
    setCanScrollTabsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    // isLoading gates whether the tab strip is even in the DOM yet (it's
    // replaced by <Loader /> until the course loads), so re-measure once
    // that flips instead of only once on this component's very first mount.
    updateTabScrollState();
  }, [isLoading, selectedLesson]);

  const scrollContentTabs = (direction) => {
    tabStripRef.current?.scrollBy({ left: direction * 160, behavior: "smooth" });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return <Card className="text-slate-300">Course not found.</Card>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Each tab's content is defined exactly once here, then referenced both by
  // the mobile shared content panel (conditional render, one at a time) and
  // by the desktop stacked layout (all shown at once) — so there is a single
  // source of truth per tab, not two copies that can drift out of sync.
  const overviewPanel = (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl p-4 sm:p-5 space-y-3">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">About this lesson</h4>
      <div className="space-y-1.5">
        <p
          className={`text-xs text-slate-300 leading-relaxed font-medium ${
            overviewExpanded ? "" : "line-clamp-3"
          }`}
        >
          {overviewDescription}
        </p>
        {overviewDescription.length > 180 && (
          <button
            type="button"
            onClick={() => setOverviewExpanded((prev) => !prev)}
            className="text-[10px] font-black uppercase tracking-wider text-orange-400 hover:text-orange-300 transition cursor-pointer bg-transparent border-0 outline-none min-h-[36px]"
          >
            {overviewExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>

      {initialTime > 3 && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <PlayCircle size={14} className="text-orange-400 shrink-0" />
            <span className="text-xs font-bold text-orange-300">
              Continue Learning — you left at {formatResumeTime(initialTime)}
            </span>
          </div>
          {videoDuration > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((initialTime / videoDuration) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-orange-400 shrink-0">
                {Math.min(100, Math.round((initialTime / videoDuration) * 100))}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const resourcesPanel = (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
          <FileText size={14} className="text-orange-500" />
          <span>Resources</span>
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">{instructorAttachments.length} file(s)</span>
      </div>

      {instructorAttachments.length > 0 ? (
        <div className="space-y-2">
          {instructorAttachments.map((file, idx) => (
            <div
              key={file.id || idx}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-orange-500/40 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Download size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition">
                    {file.title || "Class Attachment"}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{file.type || "FILE"}</span>
                </div>
              </div>
              {file.fileUrl ? (
                <a
                  href={
                    file.fileUrl.startsWith("http")
                      ? file.fileUrl
                      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${file.fileUrl}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-2 min-h-[44px] flex items-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-[10px] uppercase tracking-wider transition shadow-md shrink-0 cursor-pointer"
                >
                  <Download size={11} />
                  <span>Get</span>
                </a>
              ) : (
                <span className="text-[10px] text-slate-500 italic shrink-0">No File</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
          No downloadable resources for this lesson.
        </div>
      )}
    </div>
  );

  const queryPanel = (
    <button
      onClick={async () => {
        const instId = course?.creatorId || course?.creator?.id || course?.creator?._id;
        if (!instId) {
          console.warn("Instructor ID not found for this course.");
          return;
        }
        const matched = conversations.find(c =>
          !c.isGroup && c.participants?.some(p => {
            const pId = p.userId || p.user?.id || p.id;
            return pId === instId;
          })
        );
        if (matched) {
          setActiveConversation(matched);
          setIsOpen(true);
        } else {
          try {
            const res = await createConversation({
              name: course?.creator?.name || "Instructor",
              participantIds: [instId],
              courseId: course.id,
              isGroup: false
            });
            const newConv = res.data || res;
            if (newConv) {
              setConversations(prev => [newConv, ...prev]);
              setActiveConversation(newConv);
            }
            setIsOpen(true);
          } catch (err) {
            console.error("Failed to auto-create conversation with instructor:", err);
          }
        }
      }}
      className="w-full p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-orange-500/40 transition duration-300 group cursor-pointer text-left shadow-lg relative overflow-hidden min-h-[44px]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-400 shrink-0">
            <HelpCircle size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-100 group-hover:text-white transition truncate">Ask Instructor</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">Instructor Active • Avg response &lt; 2 hrs</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors shrink-0" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-bold flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-orange-400 font-mono">3 Active Discussions</span>
        <span>Direct Q&amp;A Chat</span>
      </div>
    </button>
  );

  const feedbackPanel = (
    <div className="space-y-4">
      <Link
        href={`/student/feedback?courseId=${course.id}`}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700/80 transition duration-300 group cursor-pointer text-left min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 shrink-0">
            <MessageSquare size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-white transition truncate">Feedback</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">Share your feedback to help us improve.</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0 ml-2" />
      </Link>

      <Link
        href={`/student/reviews?courseId=${course.id}`}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700/80 transition duration-300 group cursor-pointer text-left min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-blue-500/15 bg-blue-500/5 text-blue-400 shrink-0">
            <Star size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-white transition truncate">Reviews</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">Rate this course and see what others think.</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors shrink-0 ml-2" />
      </Link>
    </div>
  );

  const quizPanel = (
    <div className="rounded-3xl border border-slate-800/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl p-4 sm:p-5 space-y-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
        <ClipboardList size={14} className="text-orange-500" />
        <span>Assessment Quiz</span>
      </h4>
      {course?.quizzes?.length ? (
        <div className="space-y-3">
          {course.quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold text-white">{quiz.title}</h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {quiz.description || "Self-assessment to verify concept mastery."}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                  <span>Passing: {quiz.passingScore}%</span>
                  <span>&bull;</span>
                  <span>{quiz.questions?.length || 0} Questions</span>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shrink-0"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800 text-center text-slate-500 text-xs italic">
          No quiz assigned for this course.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07080f] text-white flex overflow-x-hidden font-sans relative">

      {/* ========================================================================= */}
      {/* COURSE CONTENT SIDEBAR — desktop only (xl+). Below xl, Course Content is  */}
      {/* embedded directly in the page flow instead (see CourseContentAccordion),  */}
      {/* so there is no drawer/overlay to open or close on mobile or tablet.       */}
      {/* ========================================================================= */}
      <aside
        className={`hidden xl:flex xl:relative h-screen bg-[#0d0e16] border-r border-[#1e2030] flex-shrink-0 flex-col z-50 overflow-y-auto select-none transition-all duration-300 ${
          courseSidebarOpen ? "xl:w-80" : "xl:w-18"
        }`}
      >
        {/* Header Block */}
        <div className="p-4 flex items-center justify-between min-h-[64px] border-b border-[#1e2030]/40">
          {courseSidebarOpen ? (
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate uppercase tracking-wider">
                Course Content
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {course.modules?.length || 0} Modules
              </p>
            </div>
          ) : (
            <button
              onClick={() => setCourseSidebarOpen(true)}
              className="mx-auto text-slate-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer bg-transparent border-0 outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Expand Course Content"
            >
              <BookOpen size={20} className="text-orange-500 animate-pulse" />
            </button>
          )}

          {courseSidebarOpen && (
            <button
              onClick={() => setCourseSidebarOpen(false)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            >
              <X size={18} />
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
                className="w-11 h-11 rounded-full bg-slate-800/80 hover:bg-orange-500/20 border border-slate-700/60 hover:border-orange-500/50 flex items-center justify-center text-xs font-bold text-orange-400 transition-all cursor-pointer outline-none"
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
                    className="flex w-full items-center justify-between px-4 py-3.5 transition hover:bg-slate-850 bg-transparent border-0 outline-none cursor-pointer min-h-[44px]"
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
                            onClick={() => setSelectedLesson({ ...lesson, moduleId: module.id })}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer border-0 outline-none min-h-[44px] ${
                              active
                                ? "bg-orange-500 text-white font-medium shadow-lg shadow-orange-600/10"
                                : "hover:bg-slate-800/40 text-slate-300 bg-transparent"
                            }`}
                          >
                            <PlayCircle size={15} className={active ? "text-white shrink-0" : "text-orange-500 shrink-0"} />
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
      </aside>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#07080f] min-w-0">
        
        {/* ========================================================== */}
        {/* TOP NAVBAR / HEADER */}
        {/* ========================================================== */}
        <header className="sticky top-0 bg-[#07080f]/80 backdrop-blur-md border-b border-[#1e2030]/40 py-3 px-4 sm:px-6 flex items-center justify-between z-30 select-none">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
              LEARNING WORKSPACE
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative shrink-0">
            {/* Messages button */}
            <button
              onClick={toggleChat}
              className={`p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition relative flex items-center justify-center border-0 cursor-pointer outline-none ${
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
                className={`p-2.5 min-h-[44px] min-w-[44px] rounded-xl transition relative flex items-center justify-center border-0 cursor-pointer outline-none ${
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

                  <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-800 bg-[#0d0e16]/95 backdrop-blur-md p-4 shadow-2xl text-slate-200">
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
              className="bg-red-600/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white transition p-2.5 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center cursor-pointer outline-none"
              title="Sign Out"
            >
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </header>

        {/* ========================================================== */}
        {/* FLUID RESPONSIVE WORKSPACE CONTAINER */}
        {/* ========================================================== */}
        <div className="p-4 sm:p-6 md:p-8 min-w-0">
          {/*
            Priority-driven order: below xl the student only sees one column, so every
            block that comes before the video costs them a scroll. DOM order follows
            what a returning learner needs, in sequence: Video → Overview → Course
            Content (embedded module/lesson navigator) → Transcript → Resources →
            Sticky Notes → Query → Feedback, then the course banner and Lesson Tabs
            (orientation/reference, not learning actions), and finally Previous/Next
            Lesson as the bottom-of-page call to action. At xl+ both halves of the
            page are visible at once, so explicit grid placement restores the
            original two-column arrangement regardless of DOM order.
          */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">

            {/* VIDEO — the primary learning action: first below xl, row 2 of the left column on desktop */}
            <div className="space-y-4 min-w-0 row-start-1 xl:col-start-1 xl:row-start-2">
              {/* Mobile-only utility row: back navigation + bookmark, no functionless "more" menu */}
              <div className="flex items-center justify-between xl:hidden -mt-1">
                <Link
                  href="/student/my-courses"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition cursor-pointer -ml-2"
                  title="Back to My Courses"
                >
                  <ArrowLeft size={18} />
                </Link>
                <button
                  type="button"
                  onClick={handleBookmarkLesson}
                  className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition cursor-pointer border-0 outline-none -mr-2 ${
                    isLessonBookmarked ? "text-orange-400" : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                  title={isLessonBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
                >
                  {isLessonBookmarked ? (
                    <BookmarkCheck size={18} className="fill-current" />
                  ) : (
                    <Bookmark size={18} />
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider text-orange-400">
                      Lesson {currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1} of {lessons.length || 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock3 size={11} className="text-orange-500" />
                      ~12 mins
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 tracking-wide truncate">
                    <PlayCircle className="text-orange-500 shrink-0" size={18} />
                    <span className="truncate">{selectedLesson?.title || "Loading Lesson..."}</span>
                  </h3>
                </div>

                {/* Mark as Complete Action — desktop only; mobile has a small
                    version of this in the row below the player instead. */}
                <button
                  type="button"
                  onClick={markComplete}
                  className="hidden xl:inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-orange-500 hover:text-slate-950 border border-slate-800 hover:border-orange-400 text-xs font-black uppercase tracking-wider text-slate-200 transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <CheckCircle2 size={15} className="text-emerald-400 group-hover:text-slate-950" />
                  <span>Mark Complete</span>
                </button>
              </div>

              <VideoPlayer
                ref={videoPlayerRef}
                content={selectedLesson?.contents?.[0]}
                onTimeUpdate={setCurrentTimestamp}
                onDurationChange={setVideoDuration}
                onEnded={handleVideoEnded}
                initialTime={initialTime}
              />

              {/* Compact Previous / Complete / Next — mobile & tablet only, right
                  under the player. Small on purpose: the video stays the focus,
                  these are just quick actions, not another card competing for
                  attention. Desktop keeps its own Mark Complete + fuller bar. */}
              <div className="flex items-center gap-1.5 xl:hidden">
                <button
                  type="button"
                  disabled={!previousLesson}
                  onClick={() => {
                    if (previousLesson) setSelectedLesson(previousLesson);
                  }}
                  className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border border-slate-700 font-bold text-[10px] uppercase tracking-wide text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
                    !previousLesson ? "opacity-30 cursor-not-allowed hover:border-slate-700 hover:text-slate-300" : ""
                  }`}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <button
                  type="button"
                  onClick={markComplete}
                  className="relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl border border-emerald-500/30 text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 font-bold text-[10px] uppercase tracking-wide transition cursor-pointer bg-transparent before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0"
                >
                  <CheckCircle2 size={14} />
                  <span>Complete</span>
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => {
                    markComplete();
                    if (nextLesson) setSelectedLesson(nextLesson);
                  }}
                  className={`relative flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-[10px] uppercase tracking-wide text-slate-950 transition cursor-pointer before:content-[''] before:absolute before:-inset-y-[8px] before:inset-x-0 ${
                    !nextLesson ? "opacity-40 cursor-not-allowed bg-orange-500/40 text-slate-400" : ""
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* CONTENT TAB STRIP — mobile & tablet only. Desktop shows every
                section stacked at once (below), so switching tabs would just
                add a tap for no benefit there. Left/right arrows let a student
                reach the hidden tabs with a tap instead of a swipe. */}
            <div className="row-start-2 xl:hidden">
              <div className="flex items-center gap-1 border-b border-slate-800/60">
                <button
                  type="button"
                  onClick={() => scrollContentTabs(-1)}
                  disabled={!canScrollTabsLeft}
                  className="shrink-0 min-h-[44px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer border-0 bg-transparent outline-none"
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft size={16} />
                </button>

                <div
                  ref={tabStripRef}
                  onScroll={updateTabScrollState}
                  className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0"
                >
                  {contentTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeContentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`flex flex-col items-center gap-1 px-3.5 py-2 min-h-[44px] text-[11px] font-bold uppercase tracking-wide transition cursor-pointer border-0 border-b-2 outline-none shrink-0 bg-transparent ${
                          isActive
                            ? "text-orange-400 border-orange-500"
                            : "text-slate-300 border-transparent hover:text-white"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollContentTabs(1)}
                  disabled={!canScrollTabsRight}
                  className="shrink-0 min-h-[44px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer border-0 bg-transparent outline-none"
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* SHARED CONTENT PANEL — mobile & tablet only. Exactly one branch
                renders at a time based on activeContentTab: true conditional
                rendering (if/else), not a CSS show/hide toggle across parallel
                siblings. This is the one container every tab — Overview,
                Transcript, Resources, Notes, Query, Feedback, and Quiz alike —
                renders into below xl. Nothing else moves when it changes. */}
            <div className="row-start-3 xl:hidden min-w-0">
              {activeContentTab === "overview" && overviewPanel}

              {activeContentTab === "transcript" && (
                <TranscriptPanel
                  segments={transcriptSegments}
                  status={transcriptStatus}
                  currentTime={currentTimestamp}
                  onSeek={handleTranscriptSeek}
                />
              )}

              {activeContentTab === "resources" && resourcesPanel}

              {activeContentTab === "notes" && (
                <StickyNotesPanel
                  lessonId={selectedLesson?.id}
                  currentTimestamp={currentTimestamp}
                  onSeek={handleTranscriptSeek}
                />
              )}

              {activeContentTab === "query" && queryPanel}

              {activeContentTab === "feedback" && feedbackPanel}

              {activeContentTab === "quiz" && quizPanel}
            </div>

            {/* Desktop (xl+): no tab switching — every section stays mounted and
                visible at once, stacked, each in its own row (unchanged from
                before this refactor). */}
            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-3">{overviewPanel}</div>

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-4">
              <TranscriptPanel
                segments={transcriptSegments}
                status={transcriptStatus}
                currentTime={currentTimestamp}
                onSeek={handleTranscriptSeek}
              />
            </div>

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-5">{resourcesPanel}</div>

            <div className="hidden xl:flex xl:flex-col xl:gap-6 min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-8 xl:sticky xl:top-24 xl:h-fit">
              <div className="xl:order-2">
                <StickyNotesPanel
                  lessonId={selectedLesson?.id}
                  currentTimestamp={currentTimestamp}
                  onSeek={handleTranscriptSeek}
                />
              </div>
              <div className="xl:order-1">{queryPanel}</div>
              <div className="xl:order-3">{feedbackPanel}</div>
            </div>

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-6">{quizPanel}</div>

            {/* COURSE CONTENT — embedded module/lesson navigator, mobile & tablet
                only (below xl). Desktop keeps the fixed sidebar, so this would be
                a duplicate navigator there. Always visible, not tab-gated. */}
            <div className="min-w-0 row-start-4 xl:hidden">
              <CourseContentAccordion
                modules={course.modules || []}
                activeModuleId={activeModuleId}
                onToggleModule={toggleMobileModule}
                selectedLessonId={selectedLesson?.id}
                onSelectLesson={(lesson, module) => setSelectedLesson({ ...lesson, moduleId: module.id })}
                courseProgress={courseProgress}
                completedLessons={courseProgressDetail.completedLessons}
                totalLessons={courseProgressDetail.totalLessons}
                collapsed={mobileContentCollapsed}
                onToggleCollapsed={() => setMobileContentCollapsed((prev) => !prev)}
              />
            </div>

            {/* COURSE INFO — desktop only. On mobile this duplicates what's already
                in the header (back arrow) and Course Content (progress %), and it
                isn't part of the tabbed flow you're designing toward there. */}
            <div className="hidden xl:block space-y-4 min-w-0 xl:col-start-1 xl:row-start-1">
              <Link
                href="/student/my-courses"
                className="inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-orange-500 font-bold uppercase tracking-wider min-h-[36px]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to My Courses
              </Link>

              {/* Minimal inline progress bar */}
              <div className="flex items-center gap-3 w-full sm:w-64 text-[10px] font-bold text-slate-500 pb-1">
                <span className="uppercase tracking-widest text-[9px]">Progress</span>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${courseProgress}%` }} />
                </div>
                <span className="text-orange-400 font-extrabold">{courseProgress}%</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                {course.thumbnailUrl && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="object-contain w-12 h-12 sm:w-14 sm:h-14"
                    />
                  </div>
                )}
                <div className="space-y-2 min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide leading-tight break-words">
                    {course.title}
                  </h1>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold break-words">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-orange-500" />
                      <span>{course.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4 text-orange-500" />
                      <span>12h 30m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LESSON TABS — desktop only. Quiz was removed from inside this
                component (see comment above); what's left (bookmark, personal
                scratchpad notes) isn't part of the 7-tab set, so it stays as
                supplementary reference material rather than a tab of its own. */}
            <div className="hidden xl:block pt-6 border-t border-slate-900/80 min-w-0 xl:col-start-1 xl:row-start-7">
              <LessonTabs
                lesson={selectedLesson}
                course={course}
              />
            </div>

            {/* PREVIOUS / NEXT LESSON — desktop only. Mobile has the compact pair
                right under the video player instead; "Continue to Next Module"
                lives here where there's room for the fuller label. */}
            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0d0e16]/80 border border-[#1e2030] shadow-xl backdrop-blur-md min-w-0">
                <button
                  disabled={!previousLesson}
                  onClick={() => {
                    if (previousLesson) setSelectedLesson(previousLesson);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-700 font-extrabold text-xs text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer ${
                    !previousLesson ? "opacity-30 cursor-not-allowed hover:border-slate-700 text-slate-500" : ""
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>Previous Lesson</span>
                </button>

                <div className="text-center font-mono py-1 sm:py-0 truncate max-w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Active Lesson Pathway
                  </span>
                  <p className="text-xs font-bold text-orange-400 truncate max-w-[200px] sm:max-w-[280px]">
                    {selectedLesson?.title || "Course Lesson"}
                  </p>
                </div>

                <button
                  disabled={!nextLesson}
                  onClick={() => {
                    markComplete();
                    if (nextLesson) setSelectedLesson(nextLesson);
                  }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 font-black text-xs text-slate-950 transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer ${
                    !nextLesson ? "opacity-40 cursor-not-allowed bg-orange-500/40 text-slate-400" : ""
                  }`}
                >
                  <span>
                    {nextLesson
                      ? nextModule
                        ? `Continue to ${nextModule.title}`
                        : "Next Lesson"
                      : "Course Completed 🎉"}
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}