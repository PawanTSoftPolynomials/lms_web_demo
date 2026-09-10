"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  MessageSquare, Star, PanelRightClose,
  PanelLeftOpen, X,
} from "lucide-react";

import StickyNotesPanel from "@/components/student/sticky-notes/StickyNotesPanel";
import LessonContentBlock from "@/components/student/learning/LessonContentBlock";
import ContentCompletionBar from "@/components/student/learning/ContentCompletionBar";
import AssignmentWorkspacePanel from "@/components/student/learning/AssignmentWorkspacePanel";
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
import { buildProgressIndex, decorateCourseWithProgress, isItemComplete, getNodeProgress } from "@/lib/progressIndex";

import {
  useCourse,
  useStudentState,
  useUpdateStudentState,
  useCourseProgress,
  useCompleteContent,
} from "@/hooks/queries/student";
import useTrackCourseAccess from "@/hooks/queries/student/useTrackCourseAccess";
import useLearningStateSync from "@/hooks/queries/student/useLearningStateSync";
import useLessonNavigation from "@/hooks/queries/student/useLessonNavigation";
import useTopicNavigation from "@/hooks/queries/student/useTopicNavigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import { ChatWidget } from "@/components/chat";

import useChat from "@/hooks/useChat";
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

  const { setIsOpen } = useChat();
  const { showToast } = useToast();


  // Course Content Sidebar toggle state — open by default so the Course
  // Index is what a student sees on first arriving at a lesson.
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(true);
  // Below xl the course map is a temporary sheet, so it starts closed.
  const [courseMapOpen, setCourseMapOpen] = useState(false);

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

  // Which module the open lesson belongs to, and its position in the course —
  // the below-xl header/context needs both, and both come from data already
  // loaded for the tree. Nothing extra is fetched.
  const currentModule = useMemo(
    () =>
      (courseWithProgress?.modules || []).find((m) =>
        (m.lessons || []).some((l) => l.id === selectedLesson?.id)
      ) || null,
    [courseWithProgress, selectedLesson]
  );
  const lessonNumber = lessons.findIndex((l) => l.id === selectedLesson?.id) + 1;

  // Picking a lesson or topic in the drawer should reveal it, not leave the
  // sheet covering what was just chosen.
  useEffect(() => {
    setCourseMapOpen(false);
  }, [selectedLesson?.id, selectedTopicId]);

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
  // Every stop the player can land on, in the order a student progresses
  // through the whole course: a Course's own direct content, then for each
  // Module in turn (its own direct content, then for each Lesson in turn —
  // its own direct content only when it ALSO has Topics [rare: Composer v2
  // content is Lesson-only, so a real Lesson normally has either Topics or
  // its own content, never both], each Topic in order, then the Lesson's
  // own quiz), then the Module's own quiz — then the Course's own quiz,
  // last of all. A level with nothing of its own contributes no unit, so a
  // course that only uses Topics degrades to exactly the sequence Prev/Next
  // already walked before this. Topic and zero-Topic-Lesson entries are
  // `placeholder: true` — their real blocks still come from
  // documentGroupedContents/activeQuizzes above, driven by the existing
  // selectedLesson/selectedTopicId state; this array only needs to know
  // they exist, in order, so crossing past them into a Module/Course-level
  // unit (and back) works.
  const courseUnits = useMemo(() => {
    const byOrder = (list) => [...(list || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const contentUnit = (key, scope, contents) => {
      const grouped = groupLessonContentForDocumentView(byOrder(contents));
      return grouped.length > 0 ? { key, scope, blocks: grouped.map((item) => ({ kind: "content", item })) } : null;
    };
    const quizUnit = (key, scope, quizzes) => {
      const sorted = byOrder(quizzes);
      return sorted.length > 0 ? { key, scope, blocks: sorted.map((item) => ({ kind: "quiz", item })) } : null;
    };

    const units = [];
    const noScope = { moduleId: null, lessonId: null, topicId: null };
    const courseContent = contentUnit("course-content", noScope, course.contents);
    if (courseContent) units.push(courseContent);

    for (const mod of course.modules || []) {
      const moduleScope = { moduleId: mod.id, lessonId: null, topicId: null };
      const moduleContent = contentUnit(`module-content:${mod.id}`, moduleScope, mod.contents);
      if (moduleContent) units.push(moduleContent);

      for (const lesson of mod.lessons || []) {
        const lessonScope = { moduleId: mod.id, lessonId: lesson.id, topicId: null };
        const lessonHasTopics = (lesson.topics?.length ?? 0) > 0;

        if (lessonHasTopics) {
          const lessonContent = contentUnit(`lesson-content:${lesson.id}`, lessonScope, lesson.contents);
          if (lessonContent) units.push(lessonContent);

          for (const topic of lesson.topics) {
            units.push({
              key: `topic:${topic.id}`,
              scope: { ...lessonScope, topicId: topic.id },
              placeholder: true,
            });
          }

          const lessonQuiz = quizUnit(`lesson-quiz:${lesson.id}`, lessonScope, lesson.quizzes);
          if (lessonQuiz) units.push(lessonQuiz);
        } else {
          units.push({ key: `lesson:${lesson.id}`, scope: lessonScope, placeholder: true });
        }
      }

      const moduleQuiz = quizUnit(`module-quiz:${mod.id}`, moduleScope, mod.quizzes);
      if (moduleQuiz) units.push(moduleQuiz);
    }

    const courseQuiz = quizUnit("course-quiz", noScope, course.quizzes);
    if (courseQuiz) units.push(courseQuiz);

    return units;
  }, [course]);

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
    const resolvedIndex = targetItemId
      ? Math.max(0, (unit.blocks || []).findIndex((b) => b.item.id === targetItemId))
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
  const activeBlock = activeUnitBlocks[activeBlockIndex];

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

  // Hidden entirely until the roll-up is known: without it we cannot say
  // whether this item is already complete, and showing "Mark as Complete" on a
  // finished item (or vice versa) would misreport the student's own state.
  const showCompletionBar =
    Boolean(progressIndex) && (activeContentIds.length > 0 || Boolean(activeEarnedId));

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

  // One definition of the course tree, rendered on two surfaces: the xl+
  // rail and the below-xl drawer. Same modules, same progress, same select
  // handlers — only the open/close wiring and the header differ.
  const renderCourseTree = ({ isOpen, onToggleOpen, hideHeader = false }) => (
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
      onSelectCourseOverview={() => router.push(`/student/courses/${courseId}`)}
      onSelectLesson={(lessonId) => {
        setExtraUnit(null);
        const match = lessons.find((l) => l.id === lessonId);
        selectLesson(match);
      }}
      onSelectModule={(mod) => {
        setExtraUnit(null);
        selectLesson(mod.lessons?.[0]);
      }}
      onSelectTopic={(topicId, lessonId) => {
        setExtraUnit(null);
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
          enterUnit(courseUnits.find((u) => u.key === `lesson-content:${lesson.id}`), { targetItemId: content.id });
        } else {
          jumpToBlock(content.id, { lesson });
        }
      }}
      onSelectModuleContent={(content, mod) => {
        enterUnit(courseUnits.find((u) => u.key === `module-content:${mod?.id}`), { targetItemId: content.id });
      }}
      onSelectCourseContent={(content) => {
        enterUnit(courseUnits.find((u) => u.key === "course-content"), { targetItemId: content.id });
      }}
      onSelectQuiz={(quiz, mod, lesson, topic) => {
        if (topic) {
          jumpToBlock(quiz.id, { lesson, topic });
        } else if (lesson) {
          if ((lesson.topics?.length ?? 0) > 0) {
            enterUnit(courseUnits.find((u) => u.key === `lesson-quiz:${lesson.id}`), { targetItemId: quiz.id });
          } else {
            jumpToBlock(quiz.id, { lesson });
          }
        } else if (mod) {
          enterUnit(courseUnits.find((u) => u.key === `module-quiz:${mod.id}`), { targetItemId: quiz.id });
        } else {
          enterUnit(courseUnits.find((u) => u.key === "course-quiz"), { targetItemId: quiz.id });
        }
      }}
      isOpen={isOpen}
      onToggleOpen={onToggleOpen}
      hideHeader={hideHeader}
      role="STUDENT"
    />
  );

  return (
    <div className="h-full bg-[#07080f] text-foreground flex overflow-x-hidden font-sans relative">

      {/* ========================================================================= */}
      {/* COURSE CONTENT SIDEBAR — desktop only (xl+). Below xl, Course Content is  */}
      {/* ========================================================================= */}
      {/* COURSE MAP SIDEBAR — matching Instructor Course View                      */}
      {/* ========================================================================= */}
      <div className={`hidden xl:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${courseSidebarOpen ? "w-full xl:w-[320px]" : "w-full xl:w-0"}`}>
        {renderCourseTree({
          isOpen: courseSidebarOpen,
          onToggleOpen: () => setCourseSidebarOpen(false),
        })}
      </div>

      {/* COURSE MAP DRAWER — below xl. Same tree as the rail, opened from the
          header and dismissed with X, so the lesson keeps the screen the rest
          of the time. Its own scroll: it is a temporary navigation surface. */}
      {courseMapOpen && (
        <div
          className="xl:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Course Map"
        >
          <div
            aria-hidden="true"
            onClick={() => setCourseMapOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          <div className="relative ml-auto flex h-full w-full max-w-[380px] flex-col bg-[#07080f] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 shrink-0">
              <h2 className="text-base font-bold text-foreground">Course Map</h2>
              <button
                type="button"
                onClick={() => setCourseMapOpen(false)}
                aria-label="Close course map"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3 shrink-0">
              <p className="text-sm font-bold text-foreground truncate">{course?.title}</p>
              {currentModule?.title && (
                <p className="text-xs text-muted-foreground truncate">{currentModule.title}</p>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              {renderCourseTree({
                isOpen: true,
                onToggleOpen: () => setCourseMapOpen(false),
                hideHeader: true,
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#07080f] min-w-0">

        <LearnPageHeader
          courseSidebarOpen={courseSidebarOpen}
          onOpenSidebar={() => setCourseSidebarOpen(true)}
          moduleTitle={currentModule?.title}
          onOpenCourseMap={() => setCourseMapOpen(true)}
          selectedLesson={selectedLesson}
          topicTitle={hasTopics ? currentTopic?.title : null}
          course={course}
          courseProgress={courseSummary}
          isProgressUnavailable={isProgressError}
          isStickyNotesOpen={rightPanelOpen}
          onToggleStickyNotes={() => setRightPanelOpen((prev) => !prev)}
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
              {/* LESSON CONTEXT — below xl only. Where the learner is, then what
                  they are reading. Bookmark / more / back-to-module are gone: the
                  lesson is what this screen is for. */}
              <div className="xl:hidden space-y-1">
                {lessonNumber > 0 && lessons.length > 0 && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Lesson {lessonNumber} of {lessons.length}
                  </p>
                )}
                <h1 className="text-lg font-bold leading-snug text-foreground line-clamp-2">
                  {selectedLesson?.title || course?.title || "Lesson"}
                </h1>
                {hasTopics && currentTopic?.title && (
                  <p className="text-xs text-muted-foreground line-clamp-1">Topic: {currentTopic.title}</p>
                )}
              </div>

              {/* CONTENT PLAYER FRAME — fixed viewport-relative height (matches
                  every screen size, not just desktop). Header stays pinned at
                  top, the content body scrolls internally once a block (or
                  several stacked blocks) exceeds the frame, and Prev/Next stay
                  pinned at the bottom corners instead of pushing the page
                  taller. Transcript/Resources stay outside this frame, below,
                  in normal page flow. */}
              <div className="group relative flex flex-col h-[75vh] min-h-[440px] max-h-[720px] rounded-2xl border border-border bg-card overflow-hidden max-xl:h-auto max-xl:min-h-0 max-xl:max-h-none max-xl:overflow-visible max-xl:rounded-none! max-xl:border-0! max-xl:bg-transparent!">
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

                {/* One block at a time — Next/Prev below step through the
                    active unit's blocks (content and quizzes merged in
                    order) before crossing into the previous/next unit,
                    anywhere in the whole course — see activeUnitBlocks/
                    courseUnits above. initialTime (resume position) only
                    applies to the first block of the normal Topic/Lesson
                    sequence. */}
                <div className="flex-1 overflow-y-auto min-h-0 max-xl:overflow-visible">
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
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 max-xl:static max-xl:inset-x-auto max-xl:mt-5 max-xl:opacity-100 max-xl:pointer-events-auto">
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
                  readOnly={Boolean(activeEarnedId)}
                  readOnlyHint={
                    activeQuizId
                      ? "Pass this quiz to complete it."
                      : "Upload and submit your assignment PDF to complete it."
                  }
                  onMarkComplete={handleMarkComplete}
                />
              )}
            </div>

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

          </div>
        </div>
        <ChatWidget />
      </div>
    </div>
  );
}