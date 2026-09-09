"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  MessageSquare, Star, Bookmark, BookmarkCheck, PanelRightClose,
  PanelLeftOpen,
} from "lucide-react";

import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import CourseContentAccordion from "@/components/student/learning/CourseContentAccordion";
import LessonContentBlock from "@/components/student/learning/LessonContentBlock";
import ContentCompletionBar from "@/components/student/learning/ContentCompletionBar";
import LessonOverviewPanel from "@/components/student/learning/LessonOverviewPanel";
import LessonResourcesPanel from "@/components/student/learning/LessonResourcesPanel";
import LessonQuizPanel from "@/components/student/learning/LessonQuizPanel";
import QuizExperience from "@/components/student/attempt/QuizExperience";
import AskInstructorCard from "@/components/student/learning/AskInstructorCard";
import LessonNavigationControls from "@/components/student/learning/LessonNavigationControls";
import LearnPageHeader from "@/components/student/learning/LearnPageHeader";

import { groupLessonContentForDocumentView } from "@/lib/contentDocument";
import { CourseStructureSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { normalizeCourseHierarchy } from "@/lib/courseMapper";
import { buildProgressIndex, decorateCourseWithProgress, isItemComplete } from "@/lib/progressIndex";
import { LEARN_PAGE_CONTENT_TABS } from "@/features/student/constants/learnPageConfig";

import {
  useCourse,
  useStudentState,
  useUpdateStudentState,
  useCourseProgress,
  useCompleteContent,
} from "@/hooks/queries/student";
import useLessonBookmarkToggle from "@/hooks/queries/student/useLessonBookmarkToggle";
import useTrackCourseAccess from "@/hooks/queries/student/useTrackCourseAccess";
import useLearningStateSync from "@/hooks/queries/student/useLearningStateSync";
import useLessonNavigation from "@/hooks/queries/student/useLessonNavigation";
import useTopicNavigation from "@/hooks/queries/student/useTopicNavigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { ChatWidget } from "@/components/chat";

import useChat from "@/hooks/useChat";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * The real Content row ids behind one displayed block.
 *
 * Blocks coming through groupLessonContentForDocumentView carry `contentIds`
 * (a merged HTML document stands for several rows); a block picked straight
 * off the course tree — a Course- or Module-direct item chosen in the sidebar,
 * which never goes through that grouping — carries only its own id. Progress
 * is keyed on these ids, so this is what both the completion request and the
 * completion lookup must use, never the block's display identity.
 */
function contentIdsOf(item) {
  if (!item) return [];
  const ids = Array.isArray(item.contentIds) && item.contentIds.length > 0 ? item.contentIds : [item.id];
  return ids.filter(Boolean);
}

export default function LearnPage() {
  const { courseId } = useParams();
  const router = useRouter();

  const { data: rawCourseData, isLoading, isError } = useCourse(courseId);
  const course = useMemo(() => normalizeCourseHierarchy(rawCourseData) || {}, [rawCourseData]);
  // Progress is advisory to this page: the player must stay fully usable when
  // the roll-up is unavailable, so a failed/pending progress query degrades to
  // "no indicators" rather than blocking or erroring the learning experience.
  const { data: progressData, isError: isProgressError } = useCourseProgress(courseId);
  const completeContentMutation = useCompleteContent();

  // Single flattened view of the backend roll-up. Null while loading or on
  // failure — every consumer below treats null as "don't render indicators".
  const progressIndex = useMemo(() => buildProgressIndex(progressData), [progressData]);

  // The same course tree the player renders from, decorated with the backend's
  // completion flags so the sidebar, the accordion and the quiz panel all agree.
  const courseWithProgress = useMemo(
    () => decorateCourseWithProgress(course, progressIndex) || course,
    [course, progressIndex]
  );

  const courseSummary = progressIndex?.course ?? null;

  const { data: stateData, isLoading: isStateLoading } = useStudentState();
  const updateStateMutation = useUpdateStudentState();

  const { setIsOpen } = useChat();
  const { showToast } = useToast();

  // Real viewport check backing the mobile/tablet-only blocks below — mirrors
  // Tailwind's xl breakpoint (1280px) so exactly one of the isDesktop-gated
  // vs. xl:hidden/xl:block branches renders, not both.
  const isDesktop = useMediaQuery("(min-width: 1280px)");

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
  // Set by a sidebar click on a specific content/quiz row that also crosses
  // a unit boundary (a different Topic/Lesson than the one on screen) — the
  // reset below lands directly on that row's block instead of block 0, once
  // playerBlocks has been recomputed for the newly-selected unit.
  const pendingBlockTargetIdRef = useRef(null);

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
        setBlockIndex(Math.max(0, playerBlocks.length - 1));
      } else if (pendingBlockTargetIdRef.current) {
        const targetId = pendingBlockTargetIdRef.current;
        pendingBlockTargetIdRef.current = null;
        const idx = playerBlocks.findIndex((b) => b.item.id === targetId);
        setBlockIndex(idx >= 0 ? idx : 0);
      } else {
        setBlockIndex(0);
      }
      previousUnitKeyRef.current = unitKey;
    }
  }, [selectedLesson?.id, selectedTopicId, hasTopics]);

  const [, setVideoDuration] = useState(0);

  // Course-level / module-level content or quiz selected from the sidebar —
  // these aren't scoped to any Lesson/Topic, so they're shown standalone in
  // the player instead of being threaded into the Prev/Next block sequence.
  // Any normal Lesson/Topic/Module navigation clears it. `scope`/`moduleId`
  // (set only for module-level picks) exist purely so the Course Map
  // sidebar can highlight the right ancestor row — see sidebarComposerMode.
  const [manualOverride, setManualOverride] = useState(null); // { kind: "content" | "quiz", item, scope?: "module" | "course", moduleId? } | null

  // Embedded (non-drawer) Course Content accordion state — independent of the
  // desktop sidebar so only one module is expanded at a time on mobile/tablet,
  // always the module containing the lesson currently playing.
  const [activeModuleId, setActiveModuleId] = useState(null);
  const toggleMobileModule = (moduleId) => {
    setActiveModuleId((prev) => (prev === moduleId ? null : moduleId));
  };
  const [mobileContentCollapsed, setMobileContentCollapsed] = useState(false);

  // Mobile tab strip (Notes/Query/Feedback) — desktop shows the same content
  // stacked, unconditionally, via xl: overrides.
  const [activeContentTab, setActiveContentTab] = useState("notes");

  const { isLessonBookmarked, toggleLessonBookmark } = useLessonBookmarkToggle(selectedLesson, course);

  // Auto-advance one block once a video finishes playing — same step Next
  // takes, so a video followed by another block in the same Topic doesn't
  // get skipped straight to the next Topic. Defined further down (after
  // documentGroupedContents); safe to reference here since this is only
  // ever called later, as the video's onEnded callback.
  const handleVideoEnded = () => {
    // Mark the block that actually just finished — not "the first VIDEO in the
    // lesson", which marks the wrong row whenever a lesson holds more than one.
    // Quiz blocks complete through their own submission flow, never here.
    const finished = activeBlock;
    if (finished?.kind === "content" && finished.item?.id) {
      // contentIds (not the block's representative id) so a merged document
      // block marks every underlying Content row — see useCompleteContent.
      completeContentMutation.mutate({
        contentIds: contentIdsOf(finished.item),
        completed: true,
      });
    }
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

  // Content nests under Topic for legacy/imported lessons, but the current
  // (Composer v2) authoring path attaches Content directly to the Lesson
  // and drops Topics entirely — `lesson.contents` from the API, not
  // `lesson.topics[].contents`. Prefer the Topic path when it has anything
  // (the common case today); fall back to the Lesson's own `contents`
  // otherwise, so a Composer v2 lesson isn't simply empty on this side.
  const selectedLessonContents = useMemo(() => {
    const fromTopics = (selectedLesson?.topics || []).flatMap((topic) => topic.contents || []);
    return fromTopics.length > 0 ? fromTopics : (selectedLesson?.contents || []);
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

  // Quizzes attached to the current scope (the active Topic when the Lesson
  // uses Topics, the Lesson itself otherwise) — the instructor Composer
  // sidebar merges a quiz into its siblings' content order rather than
  // showing it in a separate section, so the player does the same: a quiz
  // takes its real position among the blocks around it.
  const activeQuizzes = useMemo(() => {
    if (hasTopics) {
      const effectiveTopicId = selectedTopicId ?? selectedLesson?.topics?.[0]?.id;
      const topic = (selectedLesson?.topics || []).find((t) => t.id === effectiveTopicId);
      return topic?.quizzes || [];
    }
    return selectedLesson?.quizzes || [];
  }, [selectedLesson, selectedTopicId, hasTopics]);

  // The full one-at-a-time sequence the player steps through — content
  // blocks and this scope's quizzes merged and order-sorted, mirroring
  // ParentContentRows' own merge in the instructor sidebar (ties broken
  // content-first, since ties are only possible via manual reordering).
  const playerBlocks = useMemo(() => {
    const contentBlocks = documentGroupedContents.map((item) => ({ kind: "content", item }));
    const quizBlocks = activeQuizzes.map((quiz) => ({ kind: "quiz", item: quiz }));
    return [...contentBlocks, ...quizBlocks].sort((a, b) => {
      const orderDiff = (a.item.order ?? 0) - (b.item.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.kind === b.kind ? 0 : a.kind === "content" ? -1 : 1;
    });
  }, [documentGroupedContents, activeQuizzes]);

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
    if (blockIndex < playerBlocks.length - 1) {
      setBlockIndex((prev) => prev + 1);
      return;
    }
    goToNextUnit();
  };

  // Jumps the player straight to a specific content/quiz row selected from
  // the sidebar (Topic/Lesson-scoped only — course/module-level selections
  // go through manualOverride instead, not this). A click on a row already
  // within the on-screen unit resolves its index immediately; a click that
  // also crosses a unit boundary stashes the target id in
  // pendingBlockTargetIdRef for the unit-change reset effect to resolve
  // once playerBlocks has been recomputed for the newly-selected unit.
  const jumpToBlock = (targetId, { lesson, topic } = {}) => {
    setManualOverride(null);
    const alreadyOnUnit =
      lesson?.id === selectedLesson?.id && (topic ? topic.id === selectedTopicId : true);
    if (alreadyOnUnit) {
      const idx = playerBlocks.findIndex((b) => b.item.id === targetId);
      setBlockIndex(idx >= 0 ? idx : 0);
      return;
    }
    pendingBlockTargetIdRef.current = targetId;
    const match = lesson?.id ? lessons.find((l) => l.id === lesson.id) : null;
    if (match) selectLesson(match);
    if (topic?.id) setSelectedTopicId(topic.id);
  };

  // Still used by Sticky Notes (both the mobile tab and the desktop side
  // panel) to jump the video to a note's timestamp.
  const handleTranscriptSeek = (seconds) => {
    videoPlayerRef.current?.seekTo(seconds);
  };

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

  // What the player actually shows — a standalone course/module-level pick
  // takes priority over the normal Lesson/Topic block sequence.
  const activeBlock = manualOverride || playerBlocks[blockIndex];

  // Course Map sidebar highlighting — mirrors the instructor Composer's
  // composerMode/composeXId contract (see CourseComposerSidebar), derived
  // from whatever's actually on screen rather than tracked as separate
  // state. A manualOverride (course/module-level pick) has no Lesson/Topic
  // of its own, so it reports its own scope and clears lesson/topic; the
  // normal Lesson/Topic sequence still reports the current lesson's module
  // so that ancestor row stays expanded.
  const sidebarComposerMode = manualOverride
    ? manualOverride.scope // "module" | "course"
    : hasTopics
    ? "topic"
    : "lesson";
  const sidebarComposeModuleId = manualOverride
    ? (manualOverride.scope === "module" ? manualOverride.moduleId : null)
    : selectedLesson?.moduleId ?? null;
  const sidebarComposeLessonId = manualOverride ? null : selectedLesson?.id ?? null;
  const sidebarComposeTopicId = manualOverride ? null : hasTopics ? selectedTopicId : null;
  const sidebarComposeQuizId = activeBlock?.kind === "quiz" ? activeBlock.item.id : null;
  const sidebarSelectedCellId = activeBlock?.kind === "content" ? activeBlock.item.id : null;

  const resultReturnTo = `/student/learn/${courseId}${selectedLesson?.id ? `?lessonId=${selectedLesson.id}` : ""}`;

  // ---- Completion state for the block currently on screen -------------------
  // Read straight out of the backend roll-up. A merged document block counts as
  // complete only when every Content row behind it is, because the backend
  // counts each of those rows in its own denominator. This is a lookup of the
  // server's per-item flags, not a calculation of progress.
  const activeContentIds = activeBlock?.kind === "content" ? contentIdsOf(activeBlock.item) : [];
  const activeContentCompleted =
    activeContentIds.length > 0 && activeContentIds.every((id) => isItemComplete(progressIndex, id));

  // A Quiz reports the same backend flag in the same strip, but never offers a
  // way to set it: `completed` for a Quiz means the backend recorded a passing
  // QuizSubmission, so it is earned by passing, not by asserting it here.
  const activeQuizId = activeBlock?.kind === "quiz" ? activeBlock.item?.id : null;
  const activeQuizCompleted = Boolean(activeQuizId) && isItemComplete(progressIndex, activeQuizId);

  // Hidden entirely until the roll-up is known: without it we cannot say
  // whether this item is already complete, and showing "Mark as Complete" on a
  // finished item (or vice versa) would misreport the student's own state.
  const showCompletionBar =
    Boolean(progressIndex) && (activeContentIds.length > 0 || Boolean(activeQuizId));

  const handleMarkComplete = () => {
    // The mutation's own pending flag is the guard against double submission;
    // the button is disabled from the same flag.
    if (completeContentMutation.isPending || activeContentCompleted || activeContentIds.length === 0) return;

    completeContentMutation.mutate(
      { contentIds: activeContentIds, completed: true },
      {
        // No optimistic write: the item flips to Completed only after the
        // invalidated COURSE_PROGRESS query comes back saying so.
        onError: () => showToast("Could not mark this item complete. Please try again.", "error"),
      }
    );
  };

  // Each tab's content is defined exactly once here, then referenced both by
  // the mobile shared content panel (conditional render, one at a time) and
  // by the desktop stacked layout (all shown at once) — so there is a single
  // source of truth per tab, not two copies that can drift out of sync.
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
    <LessonQuizPanel quizzes={courseWithProgress?.quizzes || course?.quizzes || []} courseId={courseId} currentLessonId={selectedLesson?.id} />
  );

  return (
    <div className="h-full bg-[#07080f] text-foreground flex overflow-x-hidden font-sans relative">

      {/* ========================================================================= */}
      {/* COURSE CONTENT SIDEBAR — desktop only (xl+). Below xl, Course Content is  */}
      {/* ========================================================================= */}
      {/* COURSE MAP SIDEBAR — matching Instructor Course View                      */}
      {/* ========================================================================= */}
      <div className={`hidden xl:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${courseSidebarOpen ? "w-full xl:w-[320px]" : "w-full xl:w-0"}`}>
        <CourseStructureSidebar
          modules={courseWithProgress.modules || []}
          courseId={courseId}
          courseQuizzes={courseWithProgress.quizzes || []}
          progress={progressIndex}
          maxHeightClassName="max-h-full"
          composerMode={sidebarComposerMode}
          composeLessonId={sidebarComposeLessonId}
          composeModuleId={sidebarComposeModuleId}
          composeTopicId={sidebarComposeTopicId}
          composeQuizId={sidebarComposeQuizId}
          selectedCellId={sidebarSelectedCellId}
          isOpen={courseSidebarOpen}
          onToggleOpen={() => setCourseSidebarOpen(false)}
          onSelectCourseOverview={() => router.push(`/student/courses/${courseId}`)}
          onSelectLesson={(lessonId) => {
            setManualOverride(null);
            const match = lessons.find((l) => l.id === lessonId);
            selectLesson(match);
          }}
          onSelectModule={(mod) => {
            setManualOverride(null);
            selectLesson(mod.lessons?.[0]);
          }}
          onSelectTopic={(topicId, lessonId) => {
            setManualOverride(null);
            const match = lessons.find((l) => l.id === lessonId);
            if (!match) return;
            selectLesson(match);
            setSelectedTopicId(topicId);
          }}
          onSelectContent={(content, topic, lesson) => {
            jumpToBlock(content.id, { lesson, topic });
          }}
          onSelectLessonContent={(content, lesson) => {
            jumpToBlock(content.id, { lesson });
          }}
          onSelectModuleContent={(content, mod) => {
            setManualOverride({ kind: "content", item: content, scope: "module", moduleId: mod?.id });
          }}
          onSelectCourseContent={(content) => {
            setManualOverride({ kind: "content", item: content, scope: "course" });
          }}
          onSelectQuiz={(quiz, mod, lesson, topic) => {
            if (lesson) {
              jumpToBlock(quiz.id, { lesson, topic });
            } else if (mod) {
              setManualOverride({ kind: "quiz", item: quiz, scope: "module", moduleId: mod.id });
            } else {
              setManualOverride({ kind: "quiz", item: quiz, scope: "course" });
            }
          }}
          role="STUDENT"
        />
      </div>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#07080f] min-w-0">

        <LearnPageHeader
          courseSidebarOpen={courseSidebarOpen}
          onOpenSidebar={() => setCourseSidebarOpen(true)}
          selectedLesson={selectedLesson}
          topicTitle={hasTopics ? currentTopic?.title : null}
          course={course}
          courseProgress={courseSummary}
          isProgressUnavailable={isProgressError}
          isStickyNotesOpen={rightPanelOpen}
          onToggleStickyNotes={() => {
            setRightPanelOpen((prev) => {
              const next = !prev;
              if (next) setActiveContentTab("notes");
              return next;
            });
          }}
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
                {/* No dedicated header bar — lesson/topic name and the Sticky
                    Notes trigger already live in the top bar above. Course
                    Index reopen (desktop, sidebar collapsed only) floats over
                    the top-left corner of the content instead, same treatment
                    as Prev/Next below. */}
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

                {/* One block at a time — Next/Prev below step to the rest of
                    this Topic's blocks (content and quizzes merged in order)
                    before moving to the next/previous Topic. A standalone
                    course/module-level pick (manualOverride) takes over the
                    whole frame instead, with no Prev/Next of its own — see
                    activeBlock above. initialTime (resume position) only
                    applies to the first block of the normal sequence. */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {activeBlock?.kind === "quiz" ? (
                    <div className="p-4 sm:p-5">
                      <QuizExperience
                        quizId={activeBlock.item.id}
                        onBack={manualOverride ? () => setManualOverride(null) : goToPreviousBlock}
                        resultReturnTo={resultReturnTo}
                      />
                    </div>
                  ) : (
                    <LessonContentBlock
                      item={activeBlock?.item}
                      videoPlayerRef={videoPlayerRef}
                      onTimeUpdate={setCurrentTimestamp}
                      onDurationChange={setVideoDuration}
                      onEnded={manualOverride ? undefined : handleVideoEnded}
                      initialTime={!manualOverride && blockIndex === 0 ? initialTime : 0}
                    />
                  )}
                </div>

                {/* Previous / Next — floating over the bottom corners of the
                    scrollable content instead of a dedicated footer bar, so the
                    content area keeps that space. Pointer-events only on the
                    buttons themselves, so the overlay never blocks scrolling
                    or clicks on the content beneath it. Hidden until the player
                    is hovered (or a button inside gets keyboard focus) — video-
                    player-style controls, not a bar that's always sitting there.
                    Hidden entirely for a standalone course/module-level pick,
                    which isn't part of any Prev/Next sequence. */}
                {!manualOverride && (
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                  <LessonNavigationControls
                    variant="corners"
                    unitLabel={hasTopics ? "Topic" : "Lesson"}
                    previousItem={blockIndex > 0 || (hasTopics ? Boolean(previousTopic) : Boolean(previousLesson))}
                    nextItem={
                      blockIndex < playerBlocks.length - 1 ||
                      (hasTopics ? Boolean(nextTopic) : Boolean(nextLesson))
                    }
                    onSelectPrevious={goToPreviousBlock}
                    onSelectNext={goToNextBlock}
                  />
                </div>
                )}
              </div>

              {/* COMPLETION — the one place the student marks the block on
                  screen complete, and the one place its completed state is
                  shown in the workspace. Sits below the player frame (not
                  inside it) so it never collides with the floating Prev/Next
                  overlay, and applies to whatever the frame is showing:
                  Course-, Module-, Lesson- or Topic-direct Content alike. */}
              {showCompletionBar && (
                <ContentCompletionBar
                  completed={activeQuizId ? activeQuizCompleted : activeContentCompleted}
                  isPending={completeContentMutation.isPending}
                  isVideo={!activeQuizId && activeBlock?.item?.type === "VIDEO"}
                  readOnly={Boolean(activeQuizId)}
                  readOnlyHint="Pass this quiz to complete it."
                  onMarkComplete={handleMarkComplete}
                />
              )}
            </div>

            {/* CONTENT TAB STRIP — mobile & tablet only. Desktop shows every
                section stacked at once (below), so switching tabs would just
                add a tap for no benefit there. Left/right arrows let a student
                reach the hidden tabs with a tap instead of a swipe.
                Gated on isDesktop (a real viewport check), not just xl:hidden —
                otherwise this and the desktop panels below would both mount
                regardless of actual screen size, only one hidden by CSS. */}
            {!isDesktop && (
              <div className="row-start-2">
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
            )}

            {/* SHARED CONTENT PANEL — mobile & tablet only. Exactly one branch
                renders at a time based on activeContentTab: true conditional
                rendering (if/else), not a CSS show/hide toggle across parallel
                siblings. This is the one container every tab — Notes, Query,
                and Feedback alike — renders into below xl. Nothing else moves
                when it changes. */}
            {!isDesktop && (
              <div className="row-start-3 min-w-0">
                {activeContentTab === "notes" && (
                  <StickyNotesPanel
                    lessonId={selectedLesson?.id}
                    currentTimestamp={currentTimestamp}
                    onSeek={handleTranscriptSeek}
                  />
                )}

                {activeContentTab === "query" && askInstructorCard}

                {activeContentTab === "feedback" && feedbackPanel}
              </div>
            )}

            {/* Collapsed state renders no grid column at all (see grid-cols
                above) — the player and stacked panels get the full width
                back instead of a persistently reserved 48px-wide column. */}
            {rightPanelOpen && (
              <div className="hidden xl:flex xl:flex-col xl:gap-6 min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-24 xl:h-fit w-full xl:w-[360px]">
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

            {/* COURSE CONTENT — embedded module/lesson navigator, mobile & tablet
                only (below xl). Desktop keeps the fixed sidebar, so this would be
                a duplicate navigator there. Always visible, not tab-gated. */}
            <div className="min-w-0 row-start-4 xl:hidden">
              <CourseContentAccordion
                modules={courseWithProgress.modules || []}
                course={courseWithProgress}
                progress={progressIndex}
                activeModuleId={activeModuleId}
                onToggleModule={toggleMobileModule}
                selectedLessonId={selectedLesson?.id}
                onSelectLesson={(lesson, module) => selectLesson({ ...lesson, moduleId: module.id })}
                // Routes through the same two handlers the desktop sidebar
                // uses, so a mobile tap lands on exactly the same block the
                // desktop tree would have opened.
                onSelectItem={(item, kind) => {
                  if (kind === "ASSIGNMENT") {
                    router.push(`/student/assignments/${item.id}`);
                    return;
                  }
                  jumpToBlock(item.id);
                }}
                collapsed={mobileContentCollapsed}
                onToggleCollapsed={() => setMobileContentCollapsed((prev) => !prev)}
              />
            </div>

            {/* PREVIOUS / NEXT LESSON — desktop only. Always jumps a whole Topic/
                Module, unlike the in-player floating Prev/Next (which steps
                through the current Topic's blocks first) — "Continue to Next
                Module" lives here where there's room for the fuller label. */}
            <div className="hidden xl:block pt-6 border-t border-transparent/80 min-w-0 xl:col-start-1 xl:row-start-2">
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