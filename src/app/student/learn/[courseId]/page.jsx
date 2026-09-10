"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark, BookmarkCheck,
} from "lucide-react";

import CourseContentAccordion from "@/components/student/learning/CourseContentAccordion";
import LessonContentBlock from "@/components/student/learning/LessonContentBlock";
import ContentCompletionBar from "@/components/student/learning/ContentCompletionBar";
import AssignmentWorkspacePanel from "@/components/student/learning/AssignmentWorkspacePanel";
import LessonOverviewPanel from "@/components/student/learning/LessonOverviewPanel";
import LessonResourcesPanel from "@/components/student/learning/LessonResourcesPanel";
import LessonQuizPanel from "@/components/student/learning/LessonQuizPanel";
import QuizExperience from "@/components/student/attempt/QuizExperience";
import LearnSidePanel from "@/components/student/learning/LearnSidePanel";
import LessonNavigationControls from "@/components/student/learning/LessonNavigationControls";
import LearnPageHeader from "@/components/student/learning/LearnPageHeader";

import { groupLessonContentForDocumentView } from "@/lib/contentDocument";
import { buildCourseUnits, findUnitContaining } from "@/lib/courseUnits";
import { CourseStructureSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { normalizeCourseHierarchy } from "@/lib/courseMapper";
import { buildProgressIndex, decorateCourseWithProgress, isItemComplete, getNodeProgress } from "@/lib/progressIndex";

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
  const { data: progressData, isError: isProgressError, refetch: refetchProgress } = useCourseProgress(courseId);
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

  const { data: stateData, isLoading: isStateLoading } = useStudentState(courseId);
  const updateStateMutation = useUpdateStudentState();

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

  // Lesson list, plus the single entry point (selectLesson) every navigation
  // control below routes through. previousLesson/nextLesson aren't used for
  // Prev/Next crossing any more — courseUnits below now owns "what's
  // adjacent" for the whole course, zero-Topic Lessons included.
  const {
    lessons,
    selectLesson,
  } = useLessonNavigation(course, selectedLesson, setSelectedLesson);

  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Whether the current lesson uses the topic-scoped pathway at all — a
  // legacy/edge-case lesson with zero Topics falls back to the old
  // lesson-wide bar and content flatten further down instead.
  const hasTopics = (selectedLesson?.topics?.length ?? 0) > 0;

  // previousTopic/nextTopic/selectTopic aren't used for Prev/Next crossing
  // any more — courseUnits below now owns "what's adjacent" for the whole
  // course, Topics included. currentTopic is still read for display
  // (topicTitle in the header) and for the current Topic's own completion
  // gate id.
  const { currentTopic } = useTopicNavigation(
    course,
    selectedLesson,
    selectedTopicId,
    setSelectedLesson,
    setSelectedTopicId,
    lessons
  );

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

  // Which non-Topic/-Lesson unit (Course-direct content/quiz, a Module's own
  // direct content/quiz, or a Lesson's own quiz when that Lesson also has
  // Topics) the player is showing, if any — see courseUnits below for the
  // full whole-course sequence this participates in. `blockIndex` here is
  // this unit's own local position, kept separate from the Topic/Lesson
  // pathway's `blockIndex` state below so the two never fight over the same
  // counter. Any normal Lesson/Topic/Module sidebar pick clears it.
  const [extraUnit, setExtraUnit] = useState(null); // { key, blockIndex } | null

  // An Assignment row opened from the Course Map. Assignments aren't steps in
  // the Prev/Next sequence, so one is shown over the current position until
  // the student navigates anywhere else. (Replaces the removed manualOverride
  // state that openItem still called, which threw on every such tap.)
  const [openAssignmentItem, setOpenAssignmentItem] = useState(null);

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
  const handleVideoEnded = async () => {
    // Mark the block that actually just finished — not "the first VIDEO in the
    // lesson", which marks the wrong row whenever a lesson holds more than one.
    // Quiz blocks complete through their own submission flow, never here.
    const finished = activeBlock;
    if (finished?.kind === "content" && finished.item?.id) {
      try {
        // contentIds (not the block's representative id) so a merged document
        // block marks every underlying Content row — see useCompleteContent.
        // Awaited, then the progress roll-up is explicitly refetched, before
        // advancing: goToNextBlock can fall through into goToNextUnit's
        // completion gate below, which reads progressIndex — advancing on the
        // still-stale pre-completion snapshot would wrongly block a student
        // who just finished the last item in the unit.
        await completeContentMutation.mutateAsync({
          contentIds: contentIdsOf(finished.item),
          completed: true,
        });
        await refetchProgress();
      } catch {
        // Completion write failed — fall through and let the gate re-check
        // with whatever progress data is actually available rather than
        // stranding the student on a video that already finished playing.
      }
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
    return selectedLesson?.contents || [];
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

  // The full one-at-a-time sequence the player steps through for the
  // Topic/Lesson pathway — content blocks and this scope's quizzes merged
  // and order-sorted, mirroring ParentContentRows' own merge in the
  // instructor sidebar (ties broken content-first, since ties are only
  // possible via manual reordering). A Course/Module-level unit's blocks
  // come straight from courseUnits below instead.
  const playerBlocks = useMemo(() => {
    const contentBlocks = documentGroupedContents.map((item) => ({ kind: "content", item }));
    const quizBlocks = activeQuizzes.map((quiz) => ({ kind: "quiz", item: quiz }));
    return [...contentBlocks, ...quizBlocks].sort((a, b) => {
      const orderDiff = (a.item.order ?? 0) - (b.item.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.kind === b.kind ? 0 : a.kind === "content" ? -1 : 1;
    });
  }, [documentGroupedContents, activeQuizzes]);

  // ---- Whole-course Prev/Next sequence -------------------------------------
  // Every stop the player can land on, in the same order the Course Map
  // lists them — see lib/courseUnits.js. Topic and zero-Topic-Lesson entries
  // are `placeholder: true`: their real blocks still come from
  // documentGroupedContents/activeQuizzes above, driven by the existing
  // selectedLesson/selectedTopicId state; this array only needs to know
  // they exist, in order, so crossing past them into a Course/Module/Lesson-
  // level unit (and back) works.
  const courseUnits = useMemo(() => buildCourseUnits(course), [course]);

  // Where the placeholder (Topic / zero-Topic-Lesson) pathway currently is,
  // as a courseUnits key — used only to find this position's neighbors for
  // crossing purposes; the pathway's own state (selectedLesson/
  // selectedTopicId) still drives everything it actually renders.
  const placeholderUnitKey = hasTopics ? `topic:${currentTopic?.id}` : `lesson:${selectedLesson?.id}`;
  const currentUnitKey = extraUnit?.key ?? placeholderUnitKey;
  const currentUnitIndex = courseUnits.findIndex((u) => u.key === currentUnitKey);
  const activeExtraUnitDef = extraUnit ? courseUnits.find((u) => u.key === extraUnit.key) || null : null;

  // What the player is actually stepping through right now: an extra unit's
  // own blocks when one is active, otherwise the Topic/Lesson pathway's.
  const activeUnitBlocks = extraUnit ? (activeExtraUnitDef?.blocks || []) : playerBlocks;

  // A node the backend has no completion data for yet (progress still
  // loading/unavailable) never blocks advancement — only a confirmed
  // "not complete" from the roll-up does, matching the advisory-progress
  // principle above. A node with no trackable items of its own
  // (`applicable === false`, e.g. an empty topic) can never actually
  // become `completed` in the roll-up, so it can't block either — mirrors
  // progressRollup.js's own rule that empty containers don't block their
  // parent's completion.
  const canLeaveUnit = (nodeId) => {
    const summary = getNodeProgress(progressIndex, nodeId);
    if (!summary) return true;
    if (summary.applicable === false) return true;
    return summary.completed === true;
  };

  const GATE_MESSAGES = {
    topicId: "Complete every item in this topic and submit its quiz before moving to the next topic.",
    lessonId: "Complete every topic and lesson-level item in this lesson before moving to the next lesson.",
    moduleId: "Complete every lesson and module-level item in this module before moving to the next module.",
  };

  // Lands the player on a given courseUnits entry. A Topic or zero-Topic
  // Lesson hands off to the existing selectedLesson/selectedTopicId pathway
  // (unchanged — still owns rendering + resume/sidebar/Sticky-Notes sync for
  // those); anything else (Course-direct, a Module's own content/quiz, or a
  // Lesson's own quiz) becomes the active extra unit. `atEnd` lands on the
  // unit's last block (Prev) instead of its first; `targetItemId` (a sidebar
  // click) lands on that specific item's block.
  const enterUnit = (unit, { atEnd = false, targetItemId = null } = {}) => {
    if (!unit) return;
    setOpenAssignmentItem(null);
    const resolvedIndex = targetItemId
      ? Math.max(
          0,
          (unit.blocks || []).findIndex(
            (b) => b.item.id === targetItemId || b.item.contentIds?.includes(targetItemId)
          )
        )
      : atEnd
      ? Math.max(0, (unit.blocks?.length || 1) - 1)
      : 0;

    if (unit.placeholder) {
      setExtraUnit(null);
      if (unit.scope.lessonId && unit.scope.lessonId !== selectedLesson?.id) {
        const lessonMatch = lessons.find((l) => l.id === unit.scope.lessonId);
        if (lessonMatch) selectLesson(lessonMatch);
      }
      setSelectedTopicId(unit.scope.topicId || null);
      if (atEnd) landOnLastBlockRef.current = true;
      else if (targetItemId) pendingBlockTargetIdRef.current = targetItemId;
      return;
    }

    // A Lesson-scoped extra unit (lesson-content/lesson-quiz) still points
    // selectedLesson at the right Lesson, so Sticky Notes, the bookmark
    // toggle and resume-state persistence stay correctly scoped.
    if (unit.scope.lessonId && unit.scope.lessonId !== selectedLesson?.id) {
      const lessonMatch = lessons.find((l) => l.id === unit.scope.lessonId);
      if (lessonMatch) selectLesson(lessonMatch);
    }
    setExtraUnit({ key: unit.key, blockIndex: resolvedIndex });
  };

  // Only the forward direction is gated; a student can always go back to
  // review earlier material. Crossing out of a Topic requires that Topic
  // complete; crossing out of a Lesson (whether from its last Topic, its own
  // quiz, or — for a zero-Topic Lesson — its own content) additionally
  // requires the whole Lesson complete; crossing out of a Module likewise
  // requires the whole Module complete. Same rule as the instructor's spec,
  // generalized to every level courseUnits now covers, not just Topics —
  // checked finest-scope-first so the most specific message wins.
  const goToNextUnit = () => {
    const current = courseUnits[currentUnitIndex];
    const target = courseUnits[currentUnitIndex + 1];
    if (!current || !target) return;

    for (const level of ["topicId", "lessonId", "moduleId"]) {
      const currentId = current.scope[level];
      if (!currentId || currentId === target.scope[level]) continue;
      if (!canLeaveUnit(currentId)) {
        showToast(GATE_MESSAGES[level], "error");
        return;
      }
    }

    enterUnit(target);
  };

  const goToPreviousUnit = () => {
    const target = courseUnits[currentUnitIndex - 1];
    if (!target) return;
    enterUnit(target, { atEnd: true });
  };

  // In-player Prev/Next (the floating buttons over the content itself): step
  // through the active unit's own blocks first, only falling through to
  // goToPreviousUnit/goToNextUnit — i.e. cross into the previous/next unit —
  // once there's no earlier/later block in the current one.
  const goToPreviousBlock = () => {
    // Prev/Next from an opened Assignment returns to the position underneath.
    if (openAssignmentItem) {
      setOpenAssignmentItem(null);
      return;
    }
    if (extraUnit) {
      if (extraUnit.blockIndex > 0) {
        setExtraUnit((prev) => ({ ...prev, blockIndex: prev.blockIndex - 1 }));
        return;
      }
    } else if (blockIndex > 0) {
      setBlockIndex((prev) => prev - 1);
      return;
    }
    goToPreviousUnit();
  };

  const goToNextBlock = () => {
    if (openAssignmentItem) {
      setOpenAssignmentItem(null);
      return;
    }
    if (extraUnit) {
      if (extraUnit.blockIndex < activeUnitBlocks.length - 1) {
        setExtraUnit((prev) => ({ ...prev, blockIndex: prev.blockIndex + 1 }));
        return;
      }
    } else if (blockIndex < playerBlocks.length - 1) {
      setBlockIndex((prev) => prev + 1);
      return;
    }
    goToNextUnit();
  };

  // Jumps the player straight to a specific content/quiz row selected from
  // the sidebar, for the Topic/Lesson pathway only (Course/Module-level and
  // Lesson-quiz selections go through enterUnit directly instead — see the
  // sidebar handlers below). A click on a row already within the on-screen
  // unit resolves its index immediately; a click that also crosses a unit
  // boundary stashes the target id in pendingBlockTargetIdRef for the
  // unit-change reset effect to resolve once playerBlocks has been
  // recomputed for the newly-selected unit.
  const jumpToBlock = (targetId, { lesson, topic } = {}) => {
    setExtraUnit(null);
    setOpenAssignmentItem(null);
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

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !course) {
    return <Card className="text-foreground">Course not found.</Card>;
  }

  // What the player actually shows — whatever block the active unit
  // (extraUnit, or the Topic/Lesson pathway) is currently on.
  const activeBlockIndex = extraUnit ? extraUnit.blockIndex : blockIndex;
  const activeBlock = openAssignmentItem
    ? { kind: "assignment", item: openAssignmentItem }
    : activeUnitBlocks[activeBlockIndex];

  // Course Map sidebar highlighting — mirrors the instructor Composer's
  // composerMode/composeXId contract (see CourseComposerSidebar), derived
  // from whatever's actually on screen rather than tracked as separate
  // state. An extra unit (Course/Module-direct, or a Lesson's own quiz) has
  // its own scope to report; the Topic/Lesson pathway still reports the
  // current lesson's module so that ancestor row stays expanded.
  const sidebarComposerMode = activeExtraUnitDef
    ? activeExtraUnitDef.scope.lessonId
      ? "lesson"
      : activeExtraUnitDef.scope.moduleId
      ? "module"
      : "course"
    : hasTopics
    ? "topic"
    : "lesson";
  const sidebarComposeModuleId = activeExtraUnitDef
    ? activeExtraUnitDef.scope.moduleId
    : selectedLesson?.moduleId ?? null;
  const sidebarComposeLessonId = activeExtraUnitDef
    ? activeExtraUnitDef.scope.lessonId
    : selectedLesson?.id ?? null;
  const sidebarComposeTopicId = activeExtraUnitDef ? null : hasTopics ? selectedTopicId : null;
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

  // An Assignment is the same story: completion is earned by the backend
  // accepting a submission, so the strip reports it and offers no action.
  const activeAssignmentId = activeBlock?.kind === "assignment" ? activeBlock.item?.id : null;
  const activeAssignmentCompleted =
    Boolean(activeAssignmentId) && isItemComplete(progressIndex, activeAssignmentId);

  const activeEarnedId = activeQuizId || activeAssignmentId;

  // A lesson-composer Assignment block (Content type ASSIGNMENT) is earned the
  // same way: the backend completes it when the PDF submission is recorded.
  const activeIsContentAssignment =
    activeBlock?.kind === "content" && activeBlock.item?.type === "ASSIGNMENT";

  // Hidden entirely until the roll-up is known: without it we cannot say
  // whether this item is already complete, and showing "Mark as Complete" on a
  // finished item (or vice versa) would misreport the student's own state.
  const showCompletionBar =
    Boolean(progressIndex) && (activeContentIds.length > 0 || Boolean(activeEarnedId));

  // Opens an Assignment in this workspace instead of navigating away, so the
  // Course Map, the completion strip and the course percentage all stay on
  // screen while the student works through it.
  const openAssignment = (assignment) => {
    if (!assignment?.id) return;
    setOpenAssignmentItem(assignment);
  };

  /**
   * The one entry point for opening any item the Course Map offers, at
   * whatever level it hangs off. Every Course Map (desktop tree and mobile
   * accordion) routes through this, so both open the same thing.
   *
   * The player's block sequence is scoped to the current Topic when the
   * lesson uses Topics, and to the Lesson otherwise. An item only resolves
   * through jumpToBlock when it is genuinely inside that scope; anything
   * else — Course-direct, Module-direct, and a Lesson's OWN direct items in
   * a lesson that also has Topics — is not in the sequence at all and opens
   * standalone. Without that distinction those items stay in the Progress
   * denominator while being unreachable, which is what made lesson-direct
   * Content and lesson-direct Quizzes impossible to complete.
   */
  const openItem = (item, kind, ctx = {}) => {
    if (!item?.id) return;
    if (kind === "ASSIGNMENT") {
      openAssignment(item);
      return;
    }

    const { lesson, topic } = ctx;
    const lessonUsesTopics = (lesson?.topics?.length ?? 0) > 0;
    const inBlockSequence = Boolean(topic) || (Boolean(lesson) && !lessonUsesTopics);

    if (inBlockSequence) {
      jumpToBlock(item.id, { lesson, topic });
      return;
    }
    // Course-, Module- and topic-Lesson-direct items each live in their own
    // courseUnits entry — the same place the desktop Course Map sends them.
    enterUnit(findUnitContaining(courseUnits, item.id), { targetItemId: item.id });
  };

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
  // The side panel (Ask instructor / Sticky notes / Feedback / Reviews) —
  // one component for both the desktop column and the mobile/tablet stack.
  // Questions are tied to the one item on screen — content block, quiz or
  // assignment — and only ever listed back on that item.
  const sidePanel = (
    <LearnSidePanel
      activeFeature={activeContentTab}
      onChangeFeature={setActiveContentTab}
      courseId={course.id}
      lessonId={selectedLesson?.id ?? null}
      askTarget={
        activeBlock?.item?.id && ["content", "quiz", "assignment"].includes(activeBlock.kind)
          ? { kind: activeBlock.kind, id: activeBlock.item.id, title: activeBlock.item.title }
          : null
      }
      currentTimestamp={currentTimestamp}
      onSeek={handleTranscriptSeek}
    />
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
          // Course-direct assignments are counted by the roll-up, so the tree
          // has to render them too or the student cannot reach what their
          // percentage is already waiting on.
          courseAssignments={courseWithProgress.assignments || []}
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
            setExtraUnit(null);
            setOpenAssignmentItem(null);
            const match = lessons.find((l) => l.id === lessonId);
            selectLesson(match);
          }}
          onSelectModule={(mod) => {
            setExtraUnit(null);
            setOpenAssignmentItem(null);
            selectLesson(mod.lessons?.[0]);
          }}
          onSelectTopic={(topicId, lessonId) => {
            setExtraUnit(null);
            setOpenAssignmentItem(null);
            const match = lessons.find((l) => l.id === lessonId);
            if (!match) return;
            selectLesson(match);
            setSelectedTopicId(topicId);
          }}
          onSelectContent={(content, topic, lesson) => {
            jumpToBlock(content.id, { lesson, topic });
          }}
          onSelectLessonContent={(content, lesson) => {
            // A Lesson's own direct content is only ever a distinct
            // courseUnits entry when that Lesson also has Topics (see
            // courseUnits above) — otherwise it *is* the Topic/Lesson
            // pathway's own content, reached the normal way.
            if ((lesson?.topics?.length ?? 0) > 0) {
              enterUnit(findUnitContaining(courseUnits, content.id), { targetItemId: content.id });
            } else {
              jumpToBlock(content.id, { lesson });
            }
          }}
          onSelectModuleContent={(content) => {
            enterUnit(findUnitContaining(courseUnits, content.id), { targetItemId: content.id });
          }}
          onSelectCourseContent={(content) => {
            enterUnit(findUnitContaining(courseUnits, content.id), { targetItemId: content.id });
          }}
          onSelectQuiz={(quiz, mod, lesson, topic) => {
            if (topic) {
              jumpToBlock(quiz.id, { lesson, topic });
            } else if (lesson && (lesson.topics?.length ?? 0) === 0) {
              jumpToBlock(quiz.id, { lesson });
            } else {
              // A topic-Lesson's, Module's or Course's own quiz — its own unit.
              enterUnit(findUnitContaining(courseUnits, quiz.id), { targetItemId: quiz.id });
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
                {/* No dedicated header bar — lesson/topic name, the Course
                    Index reopen and the side-panel toggle all live in the top
                    bar above (LearnPageHeader). */}

                {/* One block at a time — Next/Prev below step through the
                    active unit's blocks (content and quizzes merged in
                    order) before crossing into the previous/next unit,
                    anywhere in the whole course — see activeUnitBlocks/
                    courseUnits above. initialTime (resume position) only
                    applies to the first block of the normal Topic/Lesson
                    sequence. */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {activeBlock?.kind === "assignment" ? (
                    <div className="p-4 sm:p-5">
                      <AssignmentWorkspacePanel
                        assignmentId={activeBlock.item.id}
                        completed={activeAssignmentCompleted}
                      />
                    </div>
                  ) : activeBlock?.kind === "quiz" ? (
                    <div className="p-4 sm:p-5">
                      <QuizExperience
                        quizId={activeBlock.item.id}
                        onBack={goToPreviousBlock}
                        resultReturnTo={resultReturnTo}
                      />
                    </div>
                  ) : (
                    <LessonContentBlock
                      item={activeBlock?.item}
                      videoPlayerRef={videoPlayerRef}
                      onTimeUpdate={setCurrentTimestamp}
                      onDurationChange={setVideoDuration}
                      onEnded={handleVideoEnded}
                      initialTime={!extraUnit && blockIndex === 0 ? initialTime : 0}
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
                    Always shown now — Course/Module-level units are stops in
                    the same whole-course sequence, not a standalone dead end. */}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                  <LessonNavigationControls
                    variant="corners"
                    unitLabel={
                      activeExtraUnitDef
                        ? activeExtraUnitDef.key.startsWith("course")
                          ? "Course"
                          : activeExtraUnitDef.key.startsWith("module")
                          ? "Module"
                          : "Lesson"
                        : hasTopics
                        ? "Topic"
                        : "Lesson"
                    }
                    previousItem={activeBlockIndex > 0 || currentUnitIndex > 0}
                    nextItem={activeBlockIndex < activeUnitBlocks.length - 1 || currentUnitIndex < courseUnits.length - 1}
                    onSelectPrevious={goToPreviousBlock}
                    onSelectNext={goToNextBlock}
                  />
                </div>
              </div>

              {/* COMPLETION — the one place the student marks the block on
                  screen complete, and the one place its completed state is
                  shown in the workspace. Sits below the player frame (not
                  inside it) so it never collides with the floating Prev/Next
                  overlay, and applies to whatever the frame is showing:
                  Course-, Module-, Lesson- or Topic-direct Content alike. */}
              {showCompletionBar && (
                <ContentCompletionBar
                  completed={
                    activeQuizId
                      ? activeQuizCompleted
                      : activeAssignmentId
                        ? activeAssignmentCompleted
                        : activeContentCompleted
                  }
                  isPending={completeContentMutation.isPending}
                  isVideo={!activeEarnedId && activeBlock?.item?.type === "VIDEO"}
                  readOnly={Boolean(activeEarnedId) || activeIsContentAssignment}
                  readOnlyHint={
                    activeQuizId
                      ? "Pass this quiz to complete it."
                      : "Submit your assignment (PDF or written answer) to complete it."
                  }
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
            {/* SIDE PANEL — mobile & tablet: stacked under the player, spanning
                the two rows the old tab strip + tab content used. Gated on
                isDesktop (a real viewport check) so it and the desktop column
                below never both mount. */}
            {!isDesktop && <div className="row-start-2 row-span-2 min-w-0">{sidePanel}</div>}

            {/* Desktop column. Collapsed state renders no grid column at all
                (see grid-cols above) — the player gets the full width back. */}
            {rightPanelOpen && (
              <div className="hidden xl:block min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-24 xl:h-fit w-full xl:w-[360px]">
                {sidePanel}
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
                onSelectItem={(item, kind, ctx) => openItem(item, kind, ctx)}
                collapsed={mobileContentCollapsed}
                onToggleCollapsed={() => setMobileContentCollapsed((prev) => !prev)}
              />
            </div>

          </div>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}