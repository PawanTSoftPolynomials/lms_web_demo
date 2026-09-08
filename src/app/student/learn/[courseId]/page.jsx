"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  MessageSquare, Star, Bookmark, BookmarkCheck, PanelRightOpen, PanelRightClose,
  PanelLeftOpen, StickyNote,
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

import { groupLessonContentForDocumentView } from "@/lib/contentDocument";
import { CourseStructureSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { normalizeCourseHierarchy } from "@/lib/courseMapper";
import { LEARN_PAGE_CONTENT_TABS } from "@/features/student/constants/learnPageConfig";

import { useCourse, useStudentState, useUpdateStudentState } from "@/hooks/queries/student";
import useLessonBookmarkToggle from "@/hooks/queries/student/useLessonBookmarkToggle";
import useTranscript from "@/hooks/queries/student/useTranscript";
import useTrackCourseAccess from "@/hooks/queries/student/useTrackCourseAccess";
import useLearningStateSync from "@/hooks/queries/student/useLearningStateSync";
import useLessonNavigation from "@/hooks/queries/student/useLessonNavigation";
import useTopicNavigation from "@/hooks/queries/student/useTopicNavigation";

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

  const { logout } = useAuth();
  const { toggleChat, isOpen: chatOpen, chatUnreadCount, setIsOpen } = useChat();
  const { notifications, markAllRead, markAsRead } = useNotification();

  // Course Content Sidebar toggle state — open by default so the Course
  // Index is what a student sees on first arriving at a lesson.
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(true);

  // Right-hand utility column (Ask Instructor / Sticky Notes / Feedback)
  // collapse state — desktop only, mirrors the left Course Map sidebar's
  // collapse behavior. Closed by default to match the Course Index being
  // open on first arrival (avoids both wide panels competing for space).
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

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

  // Lesson list and prev/next/module derivations, plus the single entry
  // point (selectLesson) every navigation control below routes through.
  const {
    lessons,
    previousLesson,
    nextLesson,
    nextModule,
    selectLesson,
  } = useLessonNavigation(course, selectedLesson, setSelectedLesson);

  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Whether the current lesson uses the topic-scoped pathway at all — a
  // legacy/edge-case lesson with zero Topics falls back to the old
  // lesson-wide bar and content flatten further down instead.
  const hasTopics = (selectedLesson?.topics?.length ?? 0) > 0;

  const {
    currentTopic,
    previousTopic,
    nextTopic,
    nextLessonForTopic,
    selectTopic,
  } = useTopicNavigation(course, selectedLesson, selectedTopicId, setSelectedLesson, setSelectedTopicId, lessons);

  // Whenever the selected Lesson changes to one whose Topics don't include
  // the currently selected Topic, default to that Lesson's first Topic.
  // Deliberately keyed only on selectedLesson?.id: when selectTopic crosses
  // a Lesson boundary it sets selectedLesson and selectedTopicId together in
  // the same handler (batched into one render), so by the time this effect
  // runs, selectedTopicId already belongs to the new selectedLesson and this
  // is a no-op — it only fires the reset for lesson-level navigation
  // (sidebar lesson/module clicks, resume-from-URL/DB, zero-topic Next/Prev
  // Lesson) that never touched selectedTopicId itself.
  useEffect(() => {
    if (!selectedLesson) return;
    const topicsOfLesson = selectedLesson.topics || [];
    const stillValid = topicsOfLesson.some((t) => t.id === selectedTopicId);
    if (!stillValid) {
      setSelectedTopicId(topicsOfLesson[0]?.id || null);
    }
  }, [selectedLesson?.id]);

  // A content-unit switch (a different Topic, or a different zero-Topic
  // Lesson) mounts a different (or no) video — the previous unit's
  // playback position must not leak into the newly-selected unit's Sticky
  // Notes timestamps or the debounced state-sync write. Must NOT fire
  // while the very first unit is still settling (Lesson restored but its
  // first Topic hasn't been auto-selected yet), so a just-restored resume
  // position survives.
  //
  // Keyed on BOTH selectedLesson and selectedTopicId together, not
  // selectedTopicId alone — a zero-Topic Lesson always reports
  // selectedTopicId as null, so a null-only signal can't tell "still
  // settling the very first unit" apart from "genuinely on a zero-Topic
  // Lesson" apart from "genuinely on a *different* zero-Topic Lesson than
  // last time." Three prior fix rounds each patched a selectedTopicId-only
  // signal and each left one of those cases wrong — round 1 (unconditional
  // reset) broke initial settle, round 2 (previous-value sentinel) missed
  // a real-Topic -> zero-Topic-Lesson -> real-Topic sequence, round 3
  // (monotonic attributed flag) missed real-Topic -> zero-Topic-Lesson
  // directly (the guard's `selectedTopicId === null` early return skipped
  // the reset on entry into a zero-Topic Lesson, not just before settle).
  // A composite lesson+topic key sidesteps all three: "settling" is
  // defined once (Lesson present, and either it has no Topics or its
  // first Topic hasn't landed yet) rather than re-derived from a sentinel
  // that means different things at different points in the transition.
  const hasSettledInitialUnitRef = useRef(false);
  const previousUnitKeyRef = useRef(null);

  // The content player shows one block (video/document/quiz/etc.) at a time
  // within the current unit — goToPreviousBlock/goToNextBlock below step
  // through blockIndex before falling through to goToPreviousUnit/
  // goToNextUnit. landOnLastBlockRef signals that a just-triggered unit
  // change came from Prev at block 0 (not sidebar navigation or Next), so
  // the reset below should land on the new unit's LAST block instead of its
  // first — set only when there genuinely is a previous unit to land in, so
  // it can never leak into an unrelated later unit change.
  const [blockIndex, setBlockIndex] = useState(0);
  const landOnLastBlockRef = useRef(false);

  useEffect(() => {
    if (!selectedLesson) return;
    const stillWaitingForFirstTopic = hasTopics && selectedTopicId === null;
    if (stillWaitingForFirstTopic) return;

    const unitKey = `${selectedLesson.id}::${selectedTopicId ?? ""}`;
    if (!hasSettledInitialUnitRef.current) {
      hasSettledInitialUnitRef.current = true;
      previousUnitKeyRef.current = unitKey;
      return;
    }
    if (unitKey !== previousUnitKeyRef.current) {
      setCurrentTimestamp(0);
      if (landOnLastBlockRef.current) {
        landOnLastBlockRef.current = false;
        setBlockIndex(Math.max(0, documentGroupedContents.length - 1));
      } else {
        setBlockIndex(0);
      }
      previousUnitKeyRef.current = unitKey;
    }
  }, [selectedLesson?.id, selectedTopicId, hasTopics]);

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

  // Auto-advance one block once a video finishes playing — same step Next
  // takes, so a video followed by another block in the same Topic doesn't
  // get skipped straight to the next Topic. Defined further down (after
  // documentGroupedContents); safe to reference here since this is only
  // ever called later, as the video's onEnded callback.
  const handleVideoEnded = () => {
    goToNextBlock();
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

  // Content now nests under Topic (Lesson -> Topic -> Content). Resources
  // (instructorAttachments below) stays Lesson-wide by design, so this
  // flattens every topic's contents the way it always has.
  const selectedLessonContents = useMemo(() => {
    return (selectedLesson?.topics || []).flatMap((topic) => topic.contents || []);
  }, [selectedLesson]);

  // The primary content pane (video + document blocks) shows only the
  // currently selected Topic's contents, not the whole Lesson's — that's
  // the point of Topic-scoped navigation. A zero-Topic lesson has no Topic
  // to scope to, so it falls back to the Lesson-wide list above unchanged.
  const selectedTopicContents = useMemo(() => {
    if (!hasTopics) return selectedLessonContents;
    const effectiveTopicId = selectedTopicId ?? selectedLesson?.topics?.[0]?.id;
    const topic = (selectedLesson?.topics || []).find((t) => t.id === effectiveTopicId);
    return topic?.contents || [];
  }, [selectedLesson, selectedTopicId, hasTopics, selectedLessonContents]);

  // Imported courses store each markdown block (heading/paragraph/table/...)
  // as its own HTML content row — dozens per lesson/topic. Merge consecutive
  // HTML rows into one flowing document item instead of showing (or
  // dropping) one generic card per block; every other content type is
  // untouched.
  const documentGroupedContents = useMemo(
    () => groupLessonContentForDocumentView(selectedTopicContents),
    [selectedTopicContents]
  );

  // Single source of truth for what "Previous/Next" do, shared by both
  // LessonNavigationControls instances (compact + full) — Topic-scoped when
  // the lesson has Topics, otherwise identical to Lesson-level navigation.
  const goToPreviousUnit = () => {
    if (hasTopics) {
      if (previousTopic) selectTopic(previousTopic);
    } else if (previousLesson) {
      setSelectedLesson(previousLesson);
    }
  };

  const goToNextUnit = () => {
    if (hasTopics) {
      if (nextTopic) selectTopic(nextTopic);
    } else if (nextLesson) {
      setSelectedLesson(nextLesson);
    }
  };

  // In-player Prev/Next (the floating buttons over the content itself): the
  // player shows one block at a time, so these step through
  // documentGroupedContents first and only fall through to
  // goToPreviousUnit/goToNextUnit — i.e. skip to the previous/next Topic —
  // once there's no earlier/later block in the current one. The separate
  // full-width Previous/Next bar further down the page keeps its existing
  // always-jump-a-Topic behavior unchanged; it's explicitly labeled as
  // Topic/Module navigation, not block-by-block.
  const goToPreviousBlock = () => {
    if (blockIndex > 0) {
      setBlockIndex((prev) => prev - 1);
      return;
    }
    // Only signal "land on the last block" when a previous unit genuinely
    // exists to land in — otherwise the flag would leak into whatever
    // later, unrelated unit change happens to fire this same reset effect.
    const hasPreviousUnit = hasTopics ? Boolean(previousTopic) : Boolean(previousLesson);
    if (hasPreviousUnit) {
      landOnLastBlockRef.current = true;
    }
    goToPreviousUnit();
  };

  const goToNextBlock = () => {
    if (blockIndex < documentGroupedContents.length - 1) {
      setBlockIndex((prev) => prev + 1);
      return;
    }
    goToNextUnit();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const { segments: transcriptSegments, status: transcriptStatus } = useTranscript(selectedLesson?.id);

  // useTranscript is Lesson-keyed and returns segments for whichever single
  // video the backend associates with that Lesson — a pre-existing
  // simplification. When a Lesson has more than one Topic containing a
  // video, we can no longer be sure the fetched transcript matches the
  // Topic currently on screen; showing it anyway would let a student read
  // and seek a transcript against the wrong video. Suppress it in that
  // ambiguous case only — single-video Lessons (the common case) are
  // unaffected.
  const lessonVideoTopicCount = useMemo(() => {
    return (selectedLesson?.topics || []).filter((topic) =>
      (topic.contents || []).some((content) => content.type === "VIDEO")
    ).length;
  }, [selectedLesson]);
  const transcriptAmbiguous = hasTopics && lessonVideoTopicCount > 1;
  const effectiveTranscriptSegments = transcriptAmbiguous ? [] : transcriptSegments;
  const effectiveTranscriptStatus = transcriptAmbiguous ? "unavailable" : transcriptStatus;

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
          composerMode={hasTopics ? "topic" : selectedLesson ? "lesson" : "course"}
          composeLessonId={selectedLesson?.id}
          composeModuleId={selectedLesson?.moduleId}
          composeTopicId={selectedTopicId}
          isOpen={courseSidebarOpen}
          onToggleOpen={() => setCourseSidebarOpen(false)}
          onSelectCourseOverview={() => router.push(`/student/courses/${courseId}`)}
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
            setSelectedTopicId(topicId);
            setPendingTopicScroll(topicId);
          }}
          onSelectContent={(content, topic, lesson) => {
            const match = lesson?.id ? lessons.find((l) => l.id === lesson.id) : null;
            if (match) selectLesson(match);
            if (topic?.id) {
              setSelectedTopicId(topic.id);
              setPendingTopicScroll(topic.id);
            }
          }}
          onSelectQuiz={(quiz) => {
            const returnTo = `/student/learn/${courseId}${selectedLesson?.id ? `?lessonId=${selectedLesson.id}` : ""}`;
            router.push(`/student/attempt/${quiz.id}?from=${encodeURIComponent(returnTo)}`);
          }}
          role="STUDENT"
        />
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#07080f] min-w-0">

        {/* Reopens the Sticky Notes / Ask Instructor / Feedback panel once it's
            collapsed. Fixed/floating rather than a reserved grid column, so
            the player and stacked panels get the full width back instead of
            a persistently empty 48px-wide strip. */}
        {!rightPanelOpen && (
          <button
            type="button"
            onClick={() => setRightPanelOpen(true)}
            className="hidden xl:flex fixed top-24 right-6 z-30 items-center justify-center w-9 h-9 rounded-full border border-border bg-card shadow-lg hover:border-primary/40 hover:text-primary text-muted-foreground transition cursor-pointer"
            title="Show side panel"
            aria-label="Show side panel"
          >
            <PanelRightOpen size={16} />
          </button>
        )}

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
              rightPanelOpen ? "xl:grid-cols-[1fr_360px]" : "xl:grid-cols-1"
            }`}
          >

            {/* VIDEO — the primary learning action: first below xl, row 1 of the left column on desktop. */}
            <div className="space-y-4 min-w-0 row-start-1 xl:col-start-1 xl:row-start-1">
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

              {/* CONTENT PLAYER FRAME — fixed viewport-relative height (matches
                  every screen size, not just desktop). Header stays pinned at
                  top, the content body scrolls internally once a block (or
                  several stacked blocks) exceeds the frame, and Prev/Next stay
                  pinned at the bottom corners instead of pushing the page
                  taller. Transcript/Resources stay outside this frame, below,
                  in normal page flow. */}
              <div className="group relative flex flex-col h-[75vh] min-h-[440px] max-h-[720px] rounded-2xl border border-border bg-card overflow-hidden">
                {/* No dedicated header bar — the lesson name already shows in the
                    top bar above. Course Index reopen (desktop, sidebar collapsed
                    only) and the Sticky Notes trigger float over the top corners
                    of the content instead, same treatment as Prev/Next below. */}
                {!courseSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setCourseSidebarOpen(true)}
                    className="hidden xl:flex absolute top-3 left-3 z-10 items-center justify-center w-9 h-9 rounded-full border border-border bg-card/90 backdrop-blur-sm shadow-md text-muted-foreground hover:text-primary hover:border-primary/40 transition cursor-pointer"
                    title="Show Course Index"
                    aria-label="Show Course Index"
                  >
                    <PanelLeftOpen size={16} />
                  </button>
                )}

                {/* Jumps to the Notes tab below xl, where the right-hand slide-over
                    panel doesn't exist. Hidden at xl+ — the floating "Show side
                    panel" arrow (outside this frame) already opens that same
                    panel there, so both visible together was just two buttons
                    doing one job. */}
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelOpen(true);
                    setActiveContentTab("notes");
                  }}
                  className="xl:hidden absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/90 backdrop-blur-sm shadow-md text-muted-foreground hover:text-primary hover:border-primary/40 transition cursor-pointer"
                  title="Open Sticky Notes"
                  aria-label="Open Sticky Notes"
                >
                  <StickyNote size={16} />
                </button>

                {/* One block at a time — Next/Prev below step to the rest of
                    this Topic's blocks before moving to the next/previous
                    Topic. initialTime (resume position) only applies to the
                    first block; a block reached by clicking Next shouldn't
                    inherit a resume timestamp meant for the first one. */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <LessonContentBlock
                    item={documentGroupedContents?.[blockIndex]}
                    videoPlayerRef={videoPlayerRef}
                    onTimeUpdate={setCurrentTimestamp}
                    onDurationChange={setVideoDuration}
                    onEnded={handleVideoEnded}
                    initialTime={blockIndex === 0 ? initialTime : 0}
                  />
                </div>

                {/* Previous / Next — floating over the bottom corners of the
                    scrollable content instead of a dedicated footer bar, so the
                    content area keeps that space. Pointer-events only on the
                    buttons themselves, so the overlay never blocks scrolling
                    or clicks on the content beneath it. Hidden until the player
                    is hovered (or a button inside gets keyboard focus) — video-
                    player-style controls, not a bar that's always sitting there. */}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                  <LessonNavigationControls
                    variant="corners"
                    unitLabel={hasTopics ? "Topic" : "Lesson"}
                    previousItem={blockIndex > 0 || (hasTopics ? Boolean(previousTopic) : Boolean(previousLesson))}
                    nextItem={
                      blockIndex < documentGroupedContents.length - 1 ||
                      (hasTopics ? Boolean(nextTopic) : Boolean(nextLesson))
                    }
                    onSelectPrevious={goToPreviousBlock}
                    onSelectNext={goToNextBlock}
                  />
                </div>
              </div>
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
                  segments={effectiveTranscriptSegments}
                  status={effectiveTranscriptStatus}
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
            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-2">{overviewPanel}</div>

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-3">
              <TranscriptPanel
                segments={effectiveTranscriptSegments}
                status={effectiveTranscriptStatus}
                currentTime={currentTimestamp}
                onSeek={handleTranscriptSeek}
              />
            </div>

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-4">{resourcesPanel}</div>

            {/* Collapsed state renders no grid column at all (see grid-cols
                above) — the player and stacked panels get the full width
                back instead of a persistently reserved 48px-wide column. */}
            {rightPanelOpen && (
              <div className="hidden xl:flex xl:flex-col xl:gap-6 min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-7 xl:sticky xl:top-24 xl:h-fit w-full xl:w-[360px]">
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
              </div>
            )}

            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-5">{quizPanel}</div>

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
                collapsed={mobileContentCollapsed}
                onToggleCollapsed={() => setMobileContentCollapsed((prev) => !prev)}
              />
            </div>

            {/* LESSON TABS — desktop only. Quiz was removed from inside this
                component (see comment above); what's left (bookmark, personal
                scratchpad notes) isn't part of the 7-tab set, so it stays as
                supplementary reference material rather than a tab of its own. */}
            <div className="hidden xl:block pt-6 border-t border-transparent/80 min-w-0 xl:col-start-1 xl:row-start-6">
              <LessonTabs
                lesson={selectedLesson}
                course={course}
              />
            </div>

            {/* PREVIOUS / NEXT LESSON — desktop only. Always jumps a whole Topic/
                Module, unlike the in-player floating Prev/Next (which steps
                through the current Topic's blocks first) — "Continue to Next
                Module" lives here where there's room for the fuller label. */}
            <div className="hidden xl:block min-w-0 xl:col-start-1 xl:row-start-7">
              <LessonNavigationControls
                variant="full"
                unitLabel={hasTopics ? "Topic" : "Lesson"}
                previousItem={hasTopics ? previousTopic : previousLesson}
                nextItem={hasTopics ? nextTopic : nextLesson}
                nextGroupTitle={hasTopics ? nextLessonForTopic?.title : nextModule?.title}
                currentTitle={hasTopics ? currentTopic?.title : selectedLesson?.title}
                onSelectPrevious={goToPreviousUnit}
                onSelectNext={goToNextUnit}
              />
            </div>

          </div>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}