"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Clock3, ChevronRight, ChevronLeft, PlayCircle,
  CheckCircle2, MessageSquare, Star, Bookmark, BookmarkCheck, PanelRightOpen, PanelRightClose,
} from "lucide-react";

import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import TranscriptPanel from "@/components/student/learning/TranscriptPanel";
import LessonTabs from "@/components/student/learning/LessonTabs";
import CourseContentAccordion from "@/components/student/learning/CourseContentAccordion";
import LessonContentBlock from "@/components/student/learning/LessonContentBlock";
import LessonOverviewPanel from "@/components/student/learning/LessonOverviewPanel";
import LessonResourcesPanel from "@/components/student/learning/LessonResourcesPanel";
import LessonQuizPanel from "@/components/student/learning/LessonQuizPanel";
import AskInstructorCard from "@/components/student/learning/AskInstructorCard";
import LessonNavigationControls from "@/components/student/learning/LessonNavigationControls";
import LearnPageHeader from "@/components/student/learning/LearnPageHeader";
import ProgressBar from "@/components/student/courses/ProgressBar";

import { groupLessonContentForDocumentView } from "@/lib/contentDocument";
import { getDisplayUrl } from "@/lib/blob";
import { CourseStructureSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { normalizeCourseHierarchy } from "@/lib/courseMapper";
import { LEARN_PAGE_CONTENT_TABS } from "@/features/student/constants/learnPageConfig";

import useCompleteLesson from "@/hooks/queries/student/useCompleteLesson";
import useMarkContentVisited from "@/hooks/queries/student/useMarkContentVisited";
import { useCourse, useStudentState, useUpdateStudentState } from "@/hooks/queries/student";
import useLessonBookmarkToggle from "@/hooks/queries/student/useLessonBookmarkToggle";
import useProgress from "@/hooks/queries/student/useProgress";
import useTranscript from "@/hooks/queries/student/useTranscript";
import useTrackCourseAccess from "@/hooks/queries/student/useTrackCourseAccess";
import useLearningStateSync from "@/hooks/queries/student/useLearningStateSync";
import useLessonNavigation from "@/hooks/queries/student/useLessonNavigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { ChatWidget } from "@/components/chat";

import useAuth from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";
import { useNotification } from "@/context/NotificationContext";

export default function LearnPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const { data: rawCourseData, isLoading, isError } = useCourse(courseId);
  const course = useMemo(() => normalizeCourseHierarchy(rawCourseData) || {}, [rawCourseData]);
  const { data: stateData, isLoading: isStateLoading } = useStudentState();
  const updateStateMutation = useUpdateStudentState();
  const completeLessonMutation = useCompleteLesson();
  const markContentVisitedMutation = useMarkContentVisited();
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
  const { toggleChat, isOpen: chatOpen, chatUnreadCount, setIsOpen } = useChat();
  const { notifications, markAllRead, markAsRead } = useNotification();

  // Course Content Sidebar toggle state
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(false);

  // Right-hand utility column (Ask Instructor / Sticky Notes / Feedback)
  // collapse state — desktop only, mirrors the left Course Map sidebar's
  // collapse behavior.
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const videoPlayerRef = useRef(null);

  // Resume-where-you-left-off (URL ?lessonId / DB-saved state / first-lesson
  // fallback) + debounced persistence of playback position back to the DB.
  const {
    selectedLesson,
    setSelectedLesson,
    currentTimestamp,
    setCurrentTimestamp,
    initialTime,
  } = useLearningStateSync({
    courseId,
    course,
    isLoading,
    stateData,
    isStateLoading,
    updateStateMutation,
  });

  // Lesson list, completion, and prev/next/module derivations, plus the
  // single gated entry point (selectLesson) every navigation control below
  // routes through so a locked lesson can never become selected.
  const {
    lessons,
    completedLessonIds,
    currentLessonIndex,
    previousLesson,
    nextLesson,
    nextModule,
    selectLesson,
  } = useLessonNavigation(course, selectedLesson, setSelectedLesson);

  // Derived from completedLessonIds (freshly recomputed from course data on
  // every refetch) rather than selectedLesson.completed directly —
  // selectedLesson is a state snapshot taken at selection time, so it never
  // picks up the completed:true flip that lands after markComplete's mutation
  // invalidates and refetches the course query.
  const isSelectedLessonCompleted = selectedLesson?.id
    ? completedLessonIds.includes(selectedLesson.id)
    : false;

  const [pendingTopicScroll, setPendingTopicScroll] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);

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

  const { isLessonBookmarked, toggleLessonBookmark } = useLessonBookmarkToggle(selectedLesson, course);

  // Stable across renders (depends only on the mutation's stable `mutate`
  // reference) so LessonContentBlock's IntersectionObserver — keyed on this
  // callback's identity — isn't torn down and resubscribed on every parent
  // re-render (e.g. every currentTimestamp tick while a video is playing).
  const handleContentVisited = useCallback(
    (contentIds) => {
      if (!contentIds || contentIds.length === 0) return;
      markContentVisitedMutation.mutate(contentIds);
    },
    [markContentVisitedMutation.mutate]
  );

  // Watching a video to the end is a "visited" signal for that one piece of
  // content, not an unconditional lesson completion — the lesson only
  // auto-completes once every content block in it (video and non-video
  // alike) has been visited. See handleContentVisited / LessonContentBlock.
  const handleVideoEnded = () => {
    handleContentVisited(documentGroupedContents?.[0]?.contentIds);
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  // Embedded Course Content accordion: keep the current lesson's module
  // expanded and every other module collapsed, so switching lessons never
  // requires manually opening/closing sections.
  useEffect(() => {
    if (selectedLesson?.moduleId) {
      setActiveModuleId(selectedLesson.moduleId);
    }
  }, [selectedLesson?.moduleId]);

  const trackAccessMutation = useTrackCourseAccess();
  // Track course access
  useEffect(() => {
    if (courseId) {
      trackAccessMutation.mutate(courseId);
    }
  }, [courseId]);

  // Scroll-to-topic: sidebar topic/content clicks set the target topicId here;
  // once the (possibly newly-selected) lesson's content anchors are in the DOM,
  // jump to the matching one.
  useEffect(() => {
    if (!pendingTopicScroll) return;
    const el = document.querySelector(`[data-topic-anchor="${pendingTopicScroll}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingTopicScroll(null);
    }
  }, [pendingTopicScroll, selectedLesson]);

  // Content now nests under Topic (Lesson -> Topic -> Content), so flatten
  // every topic's contents back into the flat list this page's UI expects.
  const selectedLessonContents = useMemo(() => {
    return (selectedLesson?.topics || []).flatMap((topic) => topic.contents || []);
  }, [selectedLesson]);

  // Imported courses store each markdown block (heading/paragraph/table/...)
  // as its own HTML content row — dozens per lesson. Merge consecutive HTML
  // rows into one flowing document item instead of showing (or dropping) one
  // generic card per block; every other content type is untouched.
  const documentGroupedContents = useMemo(
    () => groupLessonContentForDocumentView(selectedLessonContents),
    [selectedLessonContents]
  );

  const markComplete = async () => {
    if (!selectedLesson?.id) return;
    completeLessonMutation.mutate({ lessonId: selectedLesson.id });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const { segments: transcriptSegments, status: transcriptStatus } = useTranscript(selectedLesson?.id);

  const handleTranscriptSeek = (seconds) => {
    videoPlayerRef.current?.seekTo(seconds);
  };

  // HTML-type rows are the lesson's written document body (rendered inline
  // by the content viewer above, not listed here) — Resources only lists
  // genuine downloadable files.
  const instructorAttachments = useMemo(() => {
    return selectedLessonContents.filter(
      (c) => c.type === "FILE" || c.type === "DOCUMENT" || Boolean(c.fileUrl)
    );
  }, [selectedLessonContents]);

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
    return <Card className="text-foreground">Course not found.</Card>;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Each tab's content is defined exactly once here, then referenced both by
  // the mobile shared content panel (conditional render, one at a time) and
  // by the desktop stacked layout (all shown at once) — so there is a single
  // source of truth per tab, not two copies that can drift out of sync.
  const overviewPanel = (
    <LessonOverviewPanel lesson={selectedLesson} initialTime={initialTime} videoDuration={videoDuration} />
  );

  const resourcesPanel = <LessonResourcesPanel attachments={instructorAttachments} />;

  const askInstructorCard = <AskInstructorCard course={course} setIsOpen={setIsOpen} />;

  const feedbackPanel = (
    <div className="space-y-4">
      <Link
        href={`/student/feedback?courseId=${course.id}`}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-transparent bg-background/40 hover:bg-background/60 hover:border-transparent/80 transition duration-300 group cursor-pointer text-left min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 shrink-0">
            <MessageSquare size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-foreground group-hover:text-foreground transition truncate">Feedback</h4>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">Share your feedback to help us improve.</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-primary transition-colors shrink-0 ml-2" />
      </Link>

      <Link
        href={`/student/reviews?courseId=${course.id}`}
        className="w-full flex items-center justify-between p-4 sm:p-5 rounded-3xl border border-transparent bg-background/40 hover:bg-background/60 hover:border-transparent/80 transition duration-300 group cursor-pointer text-left min-h-[44px]"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-blue-500/15 bg-blue-500/5 text-blue-400 shrink-0">
            <Star size={18} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-foreground group-hover:text-foreground transition truncate">Reviews</h4>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">Rate this course and see what others think.</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-primary transition-colors shrink-0 ml-2" />
      </Link>
    </div>
  );

  const quizPanel = (
    <LessonQuizPanel quizzes={course?.quizzes || []} courseId={courseId} currentLessonId={selectedLesson?.id} />
  );

  return (
    <div className="min-h-screen bg-[#07080f] text-foreground flex overflow-x-hidden font-sans relative">

      {/* ========================================================================= */}
      {/* COURSE CONTENT SIDEBAR — desktop only (xl+). Below xl, Course Content is  */}
      {/* ========================================================================= */}
      {/* COURSE MAP SIDEBAR — matching Instructor Course View                      */}
      {/* ========================================================================= */}
      <div className={`hidden xl:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${courseSidebarOpen ? "w-full xl:w-[320px]" : "w-full xl:w-0"}`}>
        <CourseStructureSidebar
          modules={course.modules || []}
          completedLessonIds={completedLessonIds}
          composerMode={selectedLesson ? "lesson" : "course"}
          composeLessonId={selectedLesson?.id}
          composeModuleId={selectedLesson?.moduleId}
          isOpen={courseSidebarOpen}
          onToggleOpen={() => setCourseSidebarOpen(false)}
          onSelectCourseOverview={() => {}}
          onSelectLesson={(lessonId) => {
            const match = lessons.find((l) => l.id === lessonId);
            selectLesson(match);
          }}
          onSelectModule={(mod) => {
            selectLesson(mod.lessons?.[0]);
          }}
          onSelectTopic={(topicId, lessonId) => {
            const match = lessons.find((l) => l.id === lessonId);
            if (!match) return;
            selectLesson(match);
            if (!match.locked) setPendingTopicScroll(topicId);
          }}
          onSelectContent={(content, topic, lesson) => {
            const match = lesson?.id ? lessons.find((l) => l.id === lesson.id) : null;
            if (match) selectLesson(match);
            if (topic?.id && !match?.locked) setPendingTopicScroll(topic.id);
          }}
          role="STUDENT"
        />
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#07080f] min-w-0">

        <LearnPageHeader
          courseSidebarOpen={courseSidebarOpen}
          onOpenSidebar={() => setCourseSidebarOpen(true)}
          selectedLesson={selectedLesson}
          course={course}
          chatOpen={chatOpen}
          chatUnreadCount={chatUnreadCount}
          onToggleChat={toggleChat}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onNotificationItemClick={(n) => markAsRead(n.id)}
          onLogout={handleLogout}
        />

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
          <div
            className={`grid grid-cols-1 gap-6 lg:gap-8 transition-[grid-template-columns] duration-300 ease-in-out ${
              rightPanelOpen ? "xl:grid-cols-[1fr_360px]" : "xl:grid-cols-[1fr_48px]"
            }`}
          >

            {/* VIDEO — the primary learning action: first below xl, row 2 of the left column on desktop */}
            <div className="space-y-4 min-w-0 row-start-1 xl:col-start-1 xl:row-start-2">
              {/* Mobile-only utility row: back navigation + bookmark, no functionless "more" menu */}
              <div className="flex items-center justify-between xl:hidden -mt-1">
                <Link
                  href="/student/my-courses"
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/60 transition cursor-pointer -ml-2"
                  title="Back to My Courses"
                >
                  <ArrowLeft size={18} />
                </Link>
                <button
                  type="button"
                  onClick={toggleLessonBookmark}
                  className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition cursor-pointer border-0 outline-none -mr-2 ${
                    isLessonBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-transparent/60 pb-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
                      Lesson {currentLessonIndex >= 0 ? currentLessonIndex + 1 : 1} of {lessons.length || 1}
                    </span>
                    {selectedLesson?.duration && selectedLesson.duration !== "N/A" && (
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock3 size={11} className="text-primary" />
                        {selectedLesson.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2 tracking-wide truncate">
                    <PlayCircle className="text-primary shrink-0" size={18} />
                    <span className="truncate">{selectedLesson?.title || "Loading Lesson..."}</span>
                  </h3>
                </div>

                {/* Mark as Complete Action — desktop only; mobile has a small
                    version of this in the row below the player instead. */}
                <button
                  type="button"
                  disabled={isSelectedLessonCompleted}
                  onClick={markComplete}
                  className={`hidden xl:inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 self-start sm:self-auto ${
                    isSelectedLessonCompleted
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                      : "bg-background hover:bg-primary hover:text-slate-950 border-transparent hover:border-orange-400 text-foreground cursor-pointer"
                  }`}
                >
                  <CheckCircle2 size={15} className={isSelectedLessonCompleted ? "text-emerald-400" : "text-emerald-400 group-hover:text-slate-950"} />
                  <span>{isSelectedLessonCompleted ? "Completed" : "Mark Complete"}</span>
                </button>
              </div>

              <LessonContentBlock
                item={documentGroupedContents?.[0]}
                onVisited={handleContentVisited}
                videoPlayerRef={videoPlayerRef}
                onTimeUpdate={setCurrentTimestamp}
                onDurationChange={setVideoDuration}
                onEnded={handleVideoEnded}
                initialTime={initialTime}
              />

              {/* Remaining lesson content beyond the primary block above — e.g. a
                  video intro followed by a full written lecture, or several
                  documents/links in one lesson. Each keeps its own natural
                  rendering (document flow, embedded file, link card) and simply
                  stacks below rather than being dropped or shown as a card grid. */}
              {documentGroupedContents.length > 1 && (
                <div className="space-y-4">
                  {documentGroupedContents.slice(1).map((item, idx) => (
                    <LessonContentBlock key={item.id || idx} item={item} onVisited={handleContentVisited} />
                  ))}
                </div>
              )}

              {/* Compact Previous / Complete / Next — mobile & tablet only, right
                  under the player. Small on purpose: the video stays the focus,
                  these are just quick actions, not another card competing for
                  attention. Desktop keeps its own Mark Complete + fuller bar. */}
              <LessonNavigationControls
                variant="compact"
                previousLesson={previousLesson}
                nextLesson={nextLesson}
                isSelectedLessonCompleted={isSelectedLessonCompleted}
                onSelectPrevious={() => {
                  if (previousLesson) setSelectedLesson(previousLesson);
                }}
                onMarkComplete={markComplete}
                onSelectNext={() => {
                  markComplete();
                  if (nextLesson) setSelectedLesson(nextLesson);
                }}
              />
            </div>

            {/* CONTENT TAB STRIP — mobile & tablet only. Desktop shows every
                section stacked at once (below), so switching tabs would just
                add a tap for no benefit there. Left/right arrows let a student
                reach the hidden tabs with a tap instead of a swipe. */}
            <div className="row-start-2 xl:hidden">
              <div className="flex items-center gap-1 border-b border-transparent/60">
                <button
                  type="button"
                  onClick={() => scrollContentTabs(-1)}
                  disabled={!canScrollTabsLeft}
                  className="shrink-0 min-h-[44px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer border-0 bg-transparent outline-none"
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft size={16} />
                </button>

                <div
                  ref={tabStripRef}
                  onScroll={updateTabScrollState}
                  className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0"
                >
                  {LEARN_PAGE_CONTENT_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeContentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveContentTab(tab.id)}
                        className={`flex flex-col items-center gap-1 px-3.5 py-2 min-h-[44px] text-[11px] font-bold uppercase tracking-wide transition cursor-pointer border-0 border-b-2 outline-none shrink-0 bg-transparent ${
                          isActive
                            ? "text-primary border-primary"
                            : "text-foreground border-transparent hover:text-foreground"
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
                  className="shrink-0 min-h-[44px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer border-0 bg-transparent outline-none"
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

              {activeContentTab === "query" && askInstructorCard}

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

            <div
              className={`hidden xl:flex xl:flex-col xl:gap-6 min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-8 xl:sticky xl:top-24 xl:h-fit transition-[width] duration-300 ease-in-out ${
                rightPanelOpen ? "w-full xl:w-[360px]" : "w-full xl:w-12"
              }`}
            >
              {rightPanelOpen ? (
                <>
                  <button
                    type="button"
                    onClick={() => setRightPanelOpen(false)}
                    className="self-end flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground bg-background/60 hover:bg-muted border border-transparent transition cursor-pointer"
                    title="Hide side panel"
                    aria-label="Hide side panel"
                  >
                    <PanelRightClose size={14} />
                    <span>Hide</span>
                  </button>
                  <div className="order-2">
                    <StickyNotesPanel
                      lessonId={selectedLesson?.id}
                      currentTimestamp={currentTimestamp}
                      onSeek={handleTranscriptSeek}
                    />
                  </div>
                  <div className="order-1">{askInstructorCard}</div>
                  <div className="order-3">{feedbackPanel}</div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setRightPanelOpen(true)}
                  className="flex flex-col items-center gap-3 w-12 rounded-2xl border border-transparent/80 bg-[#0d0e16]/60 backdrop-blur-md shadow-xl py-4 hover:border-primary/40 hover:bg-background text-muted-foreground hover:text-primary transition cursor-pointer"
                  title="Show side panel"
                  aria-label="Show side panel"
                >
                  <PanelRightOpen size={16} className="shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest [writing-mode:vertical-rl]">
                    Panel
                  </span>
                </button>
              )}
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
                onSelectLesson={(lesson, module) => selectLesson({ ...lesson, moduleId: module.id })}
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
                className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-primary font-bold uppercase tracking-wider min-h-[36px]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to My Courses
              </Link>

              {/* Minimal inline progress bar */}
              <div className="flex items-center gap-3 w-full sm:w-64 text-[10px] font-bold text-muted-foreground pb-1">
                <span className="uppercase tracking-widest text-[9px]">Progress</span>
                <div className="flex-1">
                  <ProgressBar value={courseProgress} size="xs" variant="gradient" />
                </div>
                <span className="text-primary font-extrabold">{courseProgress}%</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                {course.thumbnailUrl && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-transparent bg-background/60 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getDisplayUrl(course.thumbnailUrl)}
                      alt={course.title}
                      className="object-contain w-12 h-12 sm:w-14 sm:h-14"
                    />
                  </div>
                )}
                <div className="space-y-2 min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-wide leading-tight break-words">
                    {course.title}
                  </h1>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold break-words">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>{course.modules?.length || 0} Modules</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LESSON TABS — desktop only. Quiz was removed from inside this
                component (see comment above); what's left (bookmark, personal
                scratchpad notes) isn't part of the 7-tab set, so it stays as
                supplementary reference material rather than a tab of its own. */}
            <div className="hidden xl:block pt-6 border-t border-transparent/80 min-w-0 xl:col-start-1 xl:row-start-7">
              <LessonTabs
                lesson={selectedLesson}
                course={course}
              />
            </div>

            {/* PREVIOUS / NEXT LESSON — desktop only. Mobile has the compact pair
                right under the video player instead; "Continue to Next Module"
                lives here where there's room for the fuller label. */}
            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-8">
              <LessonNavigationControls
                variant="full"
                previousLesson={previousLesson}
                nextLesson={nextLesson}
                nextModule={nextModule}
                selectedLesson={selectedLesson}
                onSelectPrevious={() => {
                  if (previousLesson) setSelectedLesson(previousLesson);
                }}
                onSelectNext={() => {
                  markComplete();
                  if (nextLesson) setSelectedLesson(nextLesson);
                }}
              />
            </div>

          </div>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}