"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Code2,
  Copy,
  Eye,
  File,
  FileStack,
  FileText,
  FlaskConical,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  Lock,
  MonitorPlay,
  MoreVertical,
  Music2,
  PackageOpen,
  PanelLeftClose,
  Pencil,
  Plus,
  Presentation,
  Target,
  Trash2,
  Video,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { NodeBadge } from "@/components/student/learning/CourseContentAccordion";
import { getNodeProgress } from "@/lib/progressIndex";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useDuplicateContent } from "@/components/instructor/LessonComposer/contentMutations";
import { useReorderModules } from "@/hooks/queries/instructor/useReorderModules";
import { useReorderLessons } from "@/hooks/queries/instructor/useReorderLessons";
import { useReorderTopics } from "@/hooks/queries/instructor/useReorderTopics";
import { useReorderContents } from "@/hooks/queries/instructor/useReorderContents";
import { useUpdateQuizOrder } from "@/hooks/queries/instructor/useUpdateQuizOrder";
import { useReorderQuizzes } from "@/hooks/queries/instructor/useReorderQuizzes";
import { swapSiblingOrder } from "@/lib/reorderSiblings";
import { useToast } from "@/components/ui/ToastProvider";

/**
 * Quiz rows are coloured by their tag, so practice and graded assessments are
 * distinguishable in the tree without opening either — sky for Self-Test,
 * purple for Final Quiz, matching the badges in QuizOverviewView.
 *
 * Each colour is stated twice, because the two themes need opposite ends of
 * the ramp: light theme sits on a white background (--background: #FFFFFF)
 * and needs deep shades, while dark theme needs the pale ones. The unprefixed
 * class is the light value — `.dark` is the opt-in variant here
 * (see `@custom-variant dark` in globals.css), so light is the default.
 *
 * Written as complete class strings rather than interpolated colour names:
 * Tailwind scans source text, so `text-${colour}-400` would never be emitted.
 */
const QUIZ_TAG_STYLES = {
  SELF_TEST: {
    label: "Self-Test",
    active: "bg-sky-500/10 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400 font-semibold",
    idle: "text-sky-700 hover:text-sky-900 hover:bg-sky-500/10 dark:text-sky-300/80 dark:hover:text-sky-300 dark:hover:bg-background/70",
    icon: "text-sky-600 dark:text-sky-400",
    badge: "bg-sky-500/15 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
  },
  FINAL: {
    label: "Final Quiz",
    active: "bg-purple-500/10 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400 font-semibold",
    idle: "text-purple-700 hover:text-purple-900 hover:bg-purple-500/10 dark:text-purple-300/80 dark:hover:text-purple-300 dark:hover:bg-background/70",
    icon: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-500/15 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  },
};

/** Falls back to Final Quiz, mirroring the Quiz.quizTag column default. */
const getQuizTagStyle = (quizTag) => QUIZ_TAG_STYLES[quizTag] || QUIZ_TAG_STYLES.FINAL;

/**
 * Classifies topic title into Theory, MCQs, Assignment, Home Task, or Revision Checklist.
 */
function getTopicTypeMeta(title = "") {
  const t = title.toLowerCase();
  if (t.includes("mcq") || t.includes("quiz") || t.includes("question")) {
    return {
      type: "mcq",
      badge: "MCQs",
      icon: HelpCircle,
      color: "text-emerald-700 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    };
  }
  if (t.includes("assignment")) {
    return {
      type: "assignment",
      badge: "Assignment",
      icon: ClipboardList,
      color: "text-amber-700 dark:text-amber-400",
      bgClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    };
  }
  if (t.includes("home task") || t.includes("hometask") || t.includes("homework")) {
    return {
      type: "hometask",
      badge: "Home Task",
      icon: Target,
      color: "text-purple-700 dark:text-purple-400",
      bgClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    };
  }
  if (t.includes("checklist") || t.includes("revision")) {
    return {
      type: "checklist",
      badge: "Checklist",
      icon: CheckSquare,
      color: "text-sky-700 dark:text-sky-400",
      bgClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
    };
  }
  return {
    type: "theory",
    badge: "Theory",
    icon: BookOpen,
    color: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  };
}

function formatTopicDisplayTitle(title = "", index = 0) {
  const trimmed = title.trim();
  if (/^(\d+\.\d+|\d+\.\d+\.\d+|mcqs?|assignment|home\s*task|revision)/i.test(trimmed)) {
    return trimmed;
  }
  return `${index + 1}. ${trimmed}`;
}

/**
 * Mirrors the backend `ContentType` enum (prisma/schema.prisma). Kept
 * exhaustive so any real Content row — however it was created — gets a
 * meaningful icon instead of falling back silently.
 */
const CONTENT_TYPE_META = {
  VIDEO: { icon: Video, label: "Video", color: "text-red-700 dark:text-red-400" },
  AUDIO: { icon: Music2, label: "Audio", color: "text-teal-700 dark:text-teal-400" },
  DOCUMENT: { icon: FileText, label: "Document", color: "text-blue-700 dark:text-blue-400" },
  TEXT: { icon: AlignLeft, label: "Text", color: "text-blue-800 dark:text-blue-300" },
  HTML: { icon: AlignLeft, label: "Text", color: "text-blue-800 dark:text-blue-300" },
  IMAGE: { icon: ImageIcon, label: "Image", color: "text-purple-700 dark:text-purple-400" },
  LINK: { icon: Link2, label: "Link", color: "text-green-700 dark:text-green-400" },
  EXTERNAL_LINK: { icon: Link2, label: "Link", color: "text-green-700 dark:text-green-400" },
  PRESENTATION: { icon: Presentation, label: "Presentation", color: "text-amber-700 dark:text-amber-400" },
  SLIDE: { icon: Presentation, label: "Slide", color: "text-amber-700 dark:text-amber-400" },
  PDF: { icon: File, label: "PDF", color: "text-sky-700 dark:text-sky-400" },
  FILE: { icon: File, label: "File", color: "text-sky-700 dark:text-sky-400" },
  CODE: { icon: Code2, label: "Code", color: "text-violet-700 dark:text-violet-400" },
  CODING_EXERCISE: { icon: Code2, label: "Coding Exercise", color: "text-violet-700 dark:text-violet-400" },
  ASSIGNMENT: { icon: ClipboardList, label: "Assignment", color: "text-amber-800 dark:text-amber-300" },
  SCORM: { icon: PackageOpen, label: "SCORM", color: "text-muted-foreground" },
  INTERACTIVE_LAB: { icon: FlaskConical, label: "Interactive Lab", color: "text-pink-700 dark:text-pink-400" },
  EMBED: { icon: MonitorPlay, label: "Embed", color: "text-indigo-700 dark:text-indigo-400" },
};
const DEFAULT_CONTENT_META = { icon: File, label: "Content", color: "text-muted-foreground" };

/** Smoothly animated expand/collapse wrapper (grid-rows trick — no height measuring needed). */
function Collapsible({ open, children }) {
  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">{open && children}</div>
    </div>
  );
}

// Tailwind needs each full class name literally present in this file to
// generate it — a template-interpolated `group-hover/${groupName}` would
// never match, hence this static lookup instead of building the string.
// The opacity-0 is gated behind `(hover: hover)`. A touch device never fires
// hover, so an unconditional opacity-0 left every row's kebab menu invisible
// on a phone — present and tappable, but with nothing to aim at.
const HOVER_VISIBLE_CLASSES = {
  module: "[@media(hover:hover)]:opacity-0 group-hover/module:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  lesson: "[@media(hover:hover)]:opacity-0 group-hover/lesson:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  topic: "[@media(hover:hover)]:opacity-0 group-hover/topic:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  content: "[@media(hover:hover)]:opacity-0 group-hover/content:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
};

/** A single, subtle settings/kebab icon — the one action affordance per row, visible on hover/focus. */
function RowMenu({ groupName, items }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={`${HOVER_VISIBLE_CLASSES[groupName]} p-1 text-muted-foreground hover:text-slate-50 rounded transition cursor-pointer shrink-0`}
            aria-label="Actions"
          >
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border-border text-foreground" onClick={(e) => e.stopPropagation()}>
          {items.map((item, idx) =>
            item.separator ? (
              <DropdownMenuSeparator key={`sep-${idx}`} className="bg-muted" />
            ) : (
              <DropdownMenuItem
                key={item.label}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : "default"}
                onClick={(e) => e.stopPropagation()}
                onSelect={(e) => {
                  item.onSelect?.(e);
                }}
                className={`cursor-pointer ${item.destructive ? "text-red-700 dark:text-red-400 hover:bg-red-950/40" : "hover:bg-background"}`}
              >
                <item.icon className="mr-2 size-3" />
                {item.label}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Lazily fetches and renders one parent's Content Cell rows in the sidebar
 * tree — only mounted once that node is expanded. Used under the Course
 * root, every Module row, every Lesson row, and every Topic row, each
 * passing its own `parent` ({parentType, parentId}) — the same generic
 * shape the rest of the Content Cell system already uses (see
 * LessonComposer/types.ts's ContentParent), so this is one component
 * reused at all 4 levels rather than a parallel per-level implementation.
 */
function ParentContentRows({
  parent,
  isActive,
  selectedCellId,
  onSelectContent,
  onDeleteContent,
  progress = null,
  quizzes = [],
  composerMode,
  composeQuizId,
  onSelectQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
  role = "INSTRUCTOR",
  isDraftMode = false,
  draftContents,
  extraItems = [],
  renderExtraItem,
  emptyMessage = null,
  className = "",
}) {
  const { data: apiContents = [], isLoading: isApiLoading, isError: isApiError } = useContents(isDraftMode ? undefined : parent);

  const contents = isDraftMode ? (draftContents || []) : (apiContents || []);
  const isLoading = isDraftMode ? false : isApiLoading;
  const isError = isDraftMode ? false : isApiError;
  const { duplicate } = useDuplicateContent();
  const reorderContents = useReorderContents();
  const updateQuizOrder = useUpdateQuizOrder();
  const reorderQuizzes = useReorderQuizzes();
  const { showToast } = useToast();

  // Unified, order- and createdAt-sorted list — merges content cells, quizzes,
  // and any parent-level children (like lessons in modules or topics in lessons)
  // so items appear in the exact order created or authored.
  const mergedRows = [
    ...contents.map((c) => ({ ...c, kind: "content" })),
    ...quizzes.map((q) => ({ ...q, kind: "quiz" })),
    ...extraItems.map((item) => ({ ...item, kind: item.kind || "extra" })),
  ].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    if (a.createdAt && b.createdAt) {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (diff !== 0) return diff;
    }
    const rank = (k) => (k === "content" ? 1 : k === "extra" || k === "lesson" || k === "topic" ? 2 : 3);
    return rank(a.kind) - rank(b.kind);
  });

  const handleMove = async (id, direction) => {
    const plan = swapSiblingOrder(mergedRows, id, direction);
    if (!plan) return;
    const kindOf = (rowId) => mergedRows.find((r) => r.id === rowId)?.kind;
    const contentUpdates = plan.filter((p) => kindOf(p.id) === "content");
    const quizUpdates = plan.filter((p) => kindOf(p.id) === "quiz");
    try {
      if (contentUpdates.length > 0) {
        await reorderContents.mutateAsync({ parent, contents: contentUpdates });
      }
      if (quizUpdates.length > 0) {
        await reorderQuizzes.mutateAsync({ quizzes: quizUpdates });
      }
    } catch {
      showToast("Failed to reorder", "error");
    }
  };

  const handleDuplicate = async (content) => {
    const validOrders = mergedRows
      .map((r) => (typeof r.order === "number" && r.order > 0 ? r.order : 0))
      .filter((o) => o > 0);
    const nextOrder = validOrders.length > 0 ? Math.max(...validOrders) + 1 : mergedRows.length + 1;
    try {
      await duplicate(content, nextOrder);
    } catch {
      showToast("Failed to duplicate content", "error");
    }
  };

  const containerClass = className || (parent?.parentType === "course"
    ? "mt-0.5 mb-1 ml-3 pl-3 py-0.5 space-y-0.5 border-l border-primary/20"
    : "space-y-0.5");

  return (
    <div className={containerClass}>
      {isLoading ? (
        <div className="flex items-center gap-1.5 py-1.5 px-2 text-[12px] text-muted-foreground">
          <Loader2 size={11} className="animate-spin shrink-0" />
          Loading contents…
        </div>
      ) : isError ? (
        <div className="flex items-center gap-1.5 py-1.5 px-2 text-[12px] text-red-700 dark:text-red-400/80">
          <AlertCircle size={11} className="shrink-0" />
          Failed to load contents.
        </div>
      ) : mergedRows.length === 0 ? (
        emptyMessage ? (
          <div className="py-1.5 px-2 text-[12px] text-muted-foreground italic">
            {emptyMessage}
          </div>
        ) : null
      ) : (
        mergedRows.map((row, rIdx) => {
          if (row.kind === "extra" || row.kind === "lesson" || row.kind === "topic") {
            return renderExtraItem ? renderExtraItem(row, rIdx) : null;
          }
          if (row.kind === "quiz") {
            // `composerMode === "quiz"` covers the Instructor Composer's
            // dedicated quiz-editor screen (composerMode switches globally
            // to "quiz" there, so `isActive` — scoped per parent level —
            // is never true in that case). `isActive` covers the Student
            // side instead, where composerMode stays the containing level
            // (module/lesson/topic) so that level's row also lights up as
            // part of the same active path — see the learn page's
            // selectedCellId/composeQuizId wiring.
            const isQuizActive = (composerMode === "quiz" || isActive) && composeQuizId === row.id;
            const questions = row.questions || (row.quizQuestions || []).map((qq) => qq.question) || [];
            const tagStyle = getQuizTagStyle(row.quizTag);

            return (
              <div
                key={row.id}
                onClick={() => onSelectQuiz?.(row)}
                // Colour alone shouldn't carry the tag — name it in the tooltip too.
                title={`${row.title || "Quiz"} — ${tagStyle.label}`}
                className={`group/content flex items-center justify-between gap-2 pl-2 pr-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isQuizActive ? tagStyle.active : tagStyle.idle
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <HelpCircle size={12} className={`shrink-0 ${tagStyle.icon}`} />
                  <span className="truncate text-[12.5px] leading-snug">
                    {row.title || "Untitled Quiz"}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${tagStyle.badge}`}>
                    {questions.length} Qs
                  </span>
                  {role === "INSTRUCTOR" && (
                    <RowMenu
                      groupName="content"
                      items={[
                        { label: "Edit Quiz", icon: Pencil, onSelect: () => onSelectQuiz?.(row, { startEditing: true }) },
                        { label: "Preview Quiz", icon: Eye, onSelect: () => onSelectQuiz?.(row, { startEditing: false }) },
                        { label: "Duplicate Quiz", icon: Copy, onSelect: () => onDuplicateQuiz?.(row) },
                        { separator: true },
                        { label: "Move Up", icon: ArrowUp, disabled: rIdx === 0, onSelect: () => handleMove(row.id, "up") },
                        { label: "Move Down", icon: ArrowDown, disabled: rIdx === mergedRows.length - 1, onSelect: () => handleMove(row.id, "down") },
                        { separator: true },
                        {
                          label: "Delete Quiz",
                          icon: Trash2,
                          destructive: true,
                          onSelect: (e) => onDeleteQuiz?.(e, row),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            );
          }

          const content = row;
          const meta = CONTENT_TYPE_META[content.type] || DEFAULT_CONTENT_META;
          const Icon = meta.icon;
          const isContentActive = isActive && selectedCellId === content.id;

          return (
            <div
              key={content.id}
              onClick={() => onSelectContent?.(content)}
              title={content.title || meta.label}
              className={`group/content flex items-center justify-between gap-2 pl-2 pr-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isContentActive
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-foreground hover:text-slate-50 hover:bg-background/70"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Icon size={12} className={`shrink-0 ${isContentActive ? "text-primary" : meta.color}`} />
                <span className="truncate text-[12.5px] leading-snug">
                  {content.title || `Untitled ${meta.label}`}
                </span>
              </div>

              {role === "INSTRUCTOR" && (
                <RowMenu
                  groupName="content"
                  items={[
                    { label: "Edit Content", icon: Pencil, onSelect: () => onSelectContent?.(content) },
                    { label: "Duplicate Content", icon: Copy, onSelect: () => handleDuplicate(content) },
                    { separator: true },
                    { label: "Move Up", icon: ArrowUp, disabled: rIdx === 0, onSelect: () => handleMove(content.id, "up") },
                    { label: "Move Down", icon: ArrowDown, disabled: rIdx === mergedRows.length - 1, onSelect: () => handleMove(content.id, "down") },
                    { separator: true },
                    {
                      label: "Delete Content",
                      icon: Trash2,
                      destructive: true,
                      onSelect: (e) => onDeleteContent?.(e, content),
                    },
                  ]}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function AssignmentRows({
  assignments = [],
  composerMode,
  composeAssignmentId,
  onSelectAssignment,
  onDeleteAssignment,
  role = "INSTRUCTOR",
  mod = null,
  lesson = null,
  topic = null,
}) {
  if (!assignments || assignments.length === 0) return null;

  return (
    <div className="mb-1 space-y-0.5">
      {assignments.map((asgn, aIdx) => {
        const isAsgnActive = composerMode === "assignment" && composeAssignmentId === asgn.id;

        return (
          <div key={asgn.id || `asgn-${aIdx}`}>
            <div
              className={`flex items-center justify-between gap-1.5 pl-1.5 pr-1 py-1.5 rounded-lg transition cursor-pointer border-l-2 ${
                isAsgnActive
                  ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                  : "border-transparent text-amber-600/90 dark:text-amber-400/90 hover:bg-background/60"
              }`}
              onClick={() => onSelectAssignment?.(asgn, mod, lesson, topic)}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {asgn.completed ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <ClipboardList size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className="truncate text-caption font-semibold">{asgn.title || "Assignment"}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {asgn.marks ? (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                    {asgn.marks} Marks
                  </span>
                ) : null}
                {role === "INSTRUCTOR" && (
                  <RowMenu
                    groupName="quiz"
                    items={[
                      {
                        label: "Edit Assignment",
                        icon: Pencil,
                        onSelect: () => onSelectAssignment?.(asgn, mod, lesson, topic, { startEditing: true }),
                      },
                      { separator: true },
                      {
                        label: "Delete Assignment",
                        icon: Trash2,
                        destructive: true,
                        onSelect: (e) => onDeleteAssignment?.(e, asgn, mod, lesson, topic),
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CourseComposerSidebar({
  modules = [],
  courseQuizzes = [],
  courseAssignments = [],
  composerMode,
  composeModuleId,
  composeLessonId,
  composeTopicId,
  composeQuizId,
  composeAssignmentId,
  selectedCellId,
  isOpen = true,
  onToggleOpen,
  onSelectCourseOverview,
  onSelectQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
  onSelectAssignment,
  onDeleteAssignment,
  onSelectLesson,
  onSelectModule,
  onSelectTopic,
  onSelectContent,
  onSelectCourseContent,
  onSelectModuleContent,
  onSelectLessonContent,
  onDeleteCourseContent,
  onDeleteModuleContent,
  onDeleteLessonContent,
  courseId,
  onAddLesson,
  onAddQuizToCourse,
  onAddQuizToModule,
  onAddQuizToLesson,
  onAddQuizToTopic,
  onAddAssignmentToCourse,
  onAddAssignmentToModule,
  onAddAssignmentToLesson,
  onAddAssignmentToTopic,
  onAddModule,
  onAddTopic,
  onAddContentToTopic,
  onAddContentToCourse,
  onAddContentToModule,
  onAddContentToLesson,
  onEditModule,
  onEditLesson,
  onEditTopic,
  onDeleteLesson,
  onDeleteModule,
  onDeleteTopic,
  onDeleteContent,
  role = "INSTRUCTOR",
  isDraftMode = false,
  // Flattened backend progress roll-up (see lib/progressIndex). Student-only:
  // the Composer passes nothing, so every progress affordance below is absent
  // for INSTRUCTOR and the instructor rendering is unchanged.
  progress = null,
  // Callers whose own layout already constrains this sidebar's height (e.g.
  // the Student learn page's fixed h-full shell) pass "max-h-full" here so
  // the panel fills exactly the space it's given instead of also being
  // capped against the raw viewport — which, under a layout that isn't just
  // "top nav + padded page", leaves dead space at the bottom.
  maxHeightClassName = "max-h-[calc(100vh-7rem)]",
}) {
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  const { showToast } = useToast();
  const reorderModules = useReorderModules();
  const reorderLessons = useReorderLessons();
  const reorderTopics = useReorderTopics();

  // Undefined = no explicit user choice yet -> default to expanded only
  // along the path to whatever is currently selected. Keeps the tree
  // scannable instead of fully unrolled on every load.
  const isModuleOpen = (moduleId) => expandedModules[moduleId] ?? moduleId === composeModuleId;
  const isLessonOpen = (lessonId) => expandedLessons[lessonId] ?? lessonId === composeLessonId;
  const isTopicOpen = (topicId) => expandedTopics[topicId] ?? topicId === composeTopicId;

  const toggleModule = (moduleId) =>
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !isModuleOpen(moduleId) }));
  const toggleLesson = (lessonId) =>
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !isLessonOpen(lessonId) }));
  const toggleTopic = (topicId) =>
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !isTopicOpen(topicId) }));

  const handleMoveModule = async (mod, direction) => {
    const plan = swapSiblingOrder(modules, mod.id, direction);
    if (!plan) return;
    try {
      await reorderModules.mutateAsync({ courseId: mod.courseId, modules: plan });
    } catch {
      showToast("Failed to reorder module", "error");
    }
  };

  const handleMoveLesson = async (mod, lessonId, direction) => {
    const plan = swapSiblingOrder(mod.lessons || [], lessonId, direction);
    if (!plan) return;
    try {
      await reorderLessons.mutateAsync({ moduleId: mod.id, lessons: plan });
    } catch {
      showToast("Failed to reorder lesson", "error");
    }
  };

  const handleMoveTopic = async (lesson, topicId, direction) => {
    const plan = swapSiblingOrder(lesson.topics || [], topicId, direction);
    if (!plan) return;
    try {
      await reorderTopics.mutateAsync({ lessonId: lesson.id, topics: plan });
    } catch {
      showToast("Failed to reorder topic", "error");
    }
  };

  if (!isOpen) {
    return null;
  }

  // The 7rem max-height is the desktop header offset; in the full-height
  // mobile drawer it only left dead space at the bottom, so it starts at lg.
  // Pinned: the title, the New Module button and the Course Overview row —
  // they stay reachable however far down the tree you are. Everything below
  // scrolls, course-level content rows included: pinning those too was what
  // once squeezed the modules tree into a sliver on quiz-heavy courses.
  return (
    <aside className={`sidebar-panel rounded-2xl border border-border bg-background p-4 shadow-xl flex flex-col h-full max-h-full ${
      maxHeightClassName === "max-h-full" ? "lg:max-h-full" : "lg:max-h-[calc(100vh-7rem)]"
    } overflow-hidden text-foreground`}>
      {/* Panel Title */}
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent, #f97316)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Course Map</span>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-background transition cursor-pointer shrink-0"
          aria-label="Hide course map"
          title="Hide course map"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Compact subtitle */}
      <div className="text-[12.5px] text-muted-foreground mb-3 pb-3 border-b border-border/80">
        Course structure
      </div>

      {/* New Module Button - Instructor only */}
      {role === "INSTRUCTOR" && (
        <button
          type="button"
          className="w-full py-2 mb-3 flex items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition cursor-pointer shrink-0"
          onClick={onAddModule}
        >
          <Plus size={14} />
          New Module
        </button>
      )}

      {/* Course Overview Root Item */}
      <div className="flex items-center justify-between gap-1 mb-1 shrink-0 group/module">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition cursor-pointer text-sm flex-1 border-l-[3px] ${
            composerMode === "course"
              ? "bg-primary/15 border-primary text-primary font-bold"
              : "border-transparent text-foreground hover:bg-background"
          }`}
          onClick={onSelectCourseOverview}
        >
          <Home size={14} className={composerMode === "course" ? "text-primary shrink-0" : "text-muted-foreground shrink-0"} />
          <span className="truncate font-semibold flex-1">Course Overview</span>
          <NodeBadge progress={progress} nodeId={courseId || modules[0]?.courseId} node={progress?.course} />
        </div>
        {role === "INSTRUCTOR" && (
          <RowMenu
            groupName="module"
            items={[
              { label: "Add Content", icon: Plus, onSelect: () => onAddContentToCourse?.() },
              { label: "Add Course Quiz", icon: HelpCircle, onSelect: () => onAddQuizToCourse?.() },
              { label: "Add Assignment", icon: ClipboardList, onSelect: () => onAddAssignmentToCourse?.() },
            ]}
          />
        )}
      </div>

      {/* Scroll region — everything from the course-level rows down. */}
      <div className="flex-1 min-h-0 overflow-y-auto -mr-1 pr-1">

      {/* Course-Level Content Cells (course-level quizzes are merged into this list) */}
      {(courseId || modules[0]?.courseId) && (
        <ParentContentRows
          parent={{ parentType: "course", parentId: courseId || modules[0]?.courseId }}
          isActive={composerMode === "course"}
          selectedCellId={selectedCellId}
          onSelectContent={(content) => onSelectCourseContent?.(content)}
          onDeleteContent={(e, content) => onDeleteCourseContent?.(e, content)}
          quizzes={courseQuizzes}
          composerMode={composerMode}
          composeQuizId={composeQuizId}
          onSelectQuiz={(quiz, opts) => onSelectQuiz?.(quiz, null, null, null, opts)}
          onDuplicateQuiz={(quiz) => onDuplicateQuiz?.(quiz, null, null, null)}
          onDeleteQuiz={(e, quiz) => onDeleteQuiz?.(e, quiz, null, null, null)}
          role={role}
          progress={progress}
          isDraftMode={isDraftMode}
        />
      )}

      {/* Course-Level Assignments (when present) */}
      <AssignmentRows
        assignments={courseAssignments}
        composerMode={composerMode}
        composeAssignmentId={composeAssignmentId}
        onSelectAssignment={onSelectAssignment}
        onDeleteAssignment={onDeleteAssignment}
        role={role}
      />

      {/* Modules Tree — no scroll container of its own; the region above scrolls. */}
      <div className="space-y-0.5 pr-1 text-sm">
        {modules.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm italic">
            No modules available in this course.
          </div>
        ) : (
          modules.map((mod, mIdx) => {
            const moduleOpen = isModuleOpen(mod.id);
            const isModuleActive = composerMode === "module" && composeModuleId === mod.id;
            const moduleHasActiveChild = !isModuleActive && composeModuleId === mod.id;
            const modLessons = mod.lessons || [];
            const modQuizzes = mod.quizzes || [];

            return (
              <div key={mod.id}>
                {/* Module Row */}
                <div
                  className={`group/module flex items-center justify-between gap-1.5 pl-1.5 pr-1 py-2 rounded-lg transition-colors cursor-pointer border-l-[3px] ${
                    isModuleActive
                      ? "bg-primary/15 border-primary text-primary font-bold"
                      : moduleHasActiveChild
                      ? "bg-background/40 border-primary/40 text-foreground"
                      : "border-transparent text-foreground hover:bg-background/60"
                  }`}
                  onClick={() => onSelectModule(mod)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(mod.id);
                      }}
                      className="p-0.5 text-muted-foreground hover:text-slate-50 transition cursor-pointer shrink-0"
                      aria-label={moduleOpen ? "Collapse module" : "Expand module"}
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-200 ${moduleOpen ? "rotate-90 text-primary" : ""}`}
                      />
                    </button>
                    <Layers size={14} className={`shrink-0 ${isModuleActive ? "text-primary" : "text-primary/80"}`} />
                    <span className="text-[11px] font-black text-muted-foreground tabular-nums shrink-0">
                      M{mIdx + 1}
                    </span>
                    <span className="truncate text-sm font-bold" title={mod.title}>
                      {mod.title}
                    </span>
                    <NodeBadge progress={progress} nodeId={mod.id} node={mod} />
                  </div>


                  {role === "INSTRUCTOR" && (
                    <RowMenu
                      groupName="module"
                      items={[
                        { label: "Edit Module", icon: Pencil, onSelect: () => onEditModule?.(mod) },
                        { label: "Add Lesson", icon: Plus, onSelect: () => onAddLesson?.(mod.id) },
                        { label: "Add Content", icon: Plus, onSelect: () => onAddContentToModule?.(mod) },
                        { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToModule?.(mod) },
                        { label: "Add Assignment", icon: ClipboardList, onSelect: () => onAddAssignmentToModule?.(mod) },
                        { separator: true },
                        { label: "Move Up", icon: ArrowUp, disabled: mIdx === 0, onSelect: () => handleMoveModule(mod, "up") },
                        { label: "Move Down", icon: ArrowDown, disabled: mIdx === modules.length - 1, onSelect: () => handleMoveModule(mod, "down") },
                        { separator: true },
                        {
                          label: "Delete Module",
                          icon: Trash2,
                          destructive: true,
                          onSelect: (e) => onDeleteModule?.(e, mod),
                        },
                      ]}
                    />
                  )}
                </div>

                {/* Module Children: Module Content + Module Quizzes + Module Assignments + Lessons */}
                <Collapsible open={moduleOpen}>
                  <div className="ml-3.5 pl-3 py-0.5 space-y-0.5 border-l border-border/70">
                    {/* Unified Module Items (contents, quizzes, and lessons sorted by creation/order) */}
                    <ParentContentRows
                      parent={{ parentType: "module", parentId: mod.id }}
                      isActive={composerMode === "module" && composeModuleId === mod.id}
                      selectedCellId={selectedCellId}
                      onSelectContent={(content) => onSelectModuleContent?.(content, mod)}
                      onDeleteContent={(e, content) => onDeleteModuleContent?.(e, content, mod)}
                      quizzes={modQuizzes}
                      composerMode={composerMode}
                      composeQuizId={composeQuizId}
                      onSelectQuiz={(quiz, opts) => onSelectQuiz?.(quiz, mod, null, null, opts)}
                      onDuplicateQuiz={(quiz) => onDuplicateQuiz?.(quiz, mod, null, null)}
                      onDeleteQuiz={(e, quiz) => onDeleteQuiz?.(e, quiz, mod, null, null)}
                      role={role}
                      progress={progress}
                      isDraftMode={isDraftMode}
                      draftContents={mod.contents}
                      extraItems={modLessons.map((lesson, lIdx) => ({ ...lesson, kind: "lesson", lIdx }))}
                      emptyMessage={modLessons.length === 0 ? "No lessons in this module." : null}
                      renderExtraItem={(lesson) => {
                        const lIdx = lesson.lIdx;
                        const lessonOpen = isLessonOpen(lesson.id);
                        const isLessonActive = composerMode === "lesson" && composeLessonId === lesson.id;
                        const lessonHasActiveChild = !isLessonActive && composeLessonId === lesson.id;
                        const lessonTopics = lesson.topics || [];
                        const lessonQuizzes = lesson.quizzes || [];
                        const isCompleted = getNodeProgress(progress, lesson.id)?.completed ?? false;
                        const isLessonLocked = role !== "INSTRUCTOR" && lesson.isPublished === false;

                        return (
                          <div key={lesson.id}>
                            {/* Lesson Row */}
                            <div
                              className={`group/lesson flex items-center justify-between gap-1.5 pl-1 pr-1 py-1.5 rounded-lg transition-colors border-l-2 cursor-pointer ${
                                isLessonActive
                                  ? "bg-primary/15 border-primary text-primary font-bold"
                                  : lessonHasActiveChild
                                  ? "bg-background/30 border-primary/30 text-foreground"
                                  : "border-transparent text-foreground hover:text-slate-50 hover:bg-background/50"
                              }`}
                              onClick={() => onSelectLesson(lesson.id)}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLesson(lesson.id);
                                  }}
                                  className="p-0.5 text-muted-foreground hover:text-slate-50 transition cursor-pointer shrink-0"
                                  aria-label={lessonOpen ? "Collapse lesson" : "Expand lesson"}
                                >
                                  <ChevronRight
                                    size={12}
                                    className={`transition-transform duration-200 ${lessonOpen ? "rotate-90 text-primary" : ""}`}
                                  />
                                </button>
                                {isLessonLocked ? (
                                  <Lock size={12} className="shrink-0 text-muted-foreground" />
                                ) : isCompleted ? (
                                  <CheckCircle2 size={12} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
                                ) : (
                                  <BookOpen size={12} className={`shrink-0 ${isLessonActive ? "text-primary" : "text-muted-foreground"}`} />
                                )}
                                <span className="text-[10.5px] font-black text-muted-foreground tabular-nums shrink-0">
                                  L{lIdx + 1}
                                </span>
                                <span className="truncate text-[13px] leading-snug" title={lesson.title}>
                                  {lesson.title}
                                </span>
                                <NodeBadge progress={progress} nodeId={lesson.id} node={lesson} />
                              </div>


                              {role === "INSTRUCTOR" && (
                                <RowMenu
                                  groupName="lesson"
                                  items={[
                                    { label: "Edit Lesson", icon: Pencil, onSelect: () => onEditLesson?.(lesson, mod.id) },
                                    { label: "Add Topic", icon: Plus, onSelect: () => onAddTopic?.(lesson.id) },
                                    { label: "Add Content", icon: Plus, onSelect: () => onAddContentToLesson?.(lesson, mod) },
                                    { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToLesson?.(lesson, mod) },
                                    { label: "Add Assignment", icon: ClipboardList, onSelect: () => onAddAssignmentToLesson?.(lesson, mod) },
                                    { separator: true },
                                    { label: "Move Up", icon: ArrowUp, disabled: lIdx === 0, onSelect: () => handleMoveLesson(mod, lesson.id, "up") },
                                    { label: "Move Down", icon: ArrowDown, disabled: lIdx === modLessons.length - 1, onSelect: () => handleMoveLesson(mod, lesson.id, "down") },
                                    { separator: true },
                                    {
                                      label: "Delete Lesson",
                                      icon: Trash2,
                                      destructive: true,
                                      onSelect: (e) => onDeleteLesson?.(e, lesson, mod.id),
                                    },
                                  ]}
                                />
                              )}
                            </div>

                            {/* Lesson Content + Lesson Quizzes + Lesson Assignments + Topics */}
                            <Collapsible open={lessonOpen}>
                              <div className="ml-3 pl-3 py-0.5 space-y-0.5 border-l border-border/60">
                                {/* Unified Lesson Items (contents, quizzes, and topics sorted by creation/order) */}
                                <ParentContentRows
                                  parent={{ parentType: "lesson", parentId: lesson.id }}
                                  isActive={composerMode === "lesson" && composeLessonId === lesson.id}
                                  selectedCellId={selectedCellId}
                                  onSelectContent={(content) => onSelectLessonContent?.(content, lesson, mod)}
                                  onDeleteContent={(e, content) => onDeleteLessonContent?.(e, content, lesson, mod)}
                                  quizzes={lessonQuizzes}
                                  composerMode={composerMode}
                                  composeQuizId={composeQuizId}
                                  onSelectQuiz={(quiz, opts) => onSelectQuiz?.(quiz, mod, lesson, null, opts)}
                                  onDuplicateQuiz={(quiz) => onDuplicateQuiz?.(quiz, mod, lesson, null)}
                                  onDeleteQuiz={(e, quiz) => onDeleteQuiz?.(e, quiz, mod, lesson, null)}
                                  role={role}
                                  progress={progress}
                                  isDraftMode={isDraftMode}
                                  draftContents={lesson.contents}
                                  extraItems={lessonTopics.map((topic, tIdx) => ({ ...topic, kind: "topic", tIdx }))}
                                  emptyMessage={lessonTopics.length === 0 ? "No topics in this lesson." : null}
                                  renderExtraItem={(topic) => {
                                    const tIdx = topic.tIdx;
                                    const topicOpen = isTopicOpen(topic.id);
                                    const isTopicActive = composerMode === "topic" && composeTopicId === topic.id;
                                    const topicMeta = getTopicTypeMeta(topic.title);
                                    const TopicIcon = topicMeta.icon;
                                    const displayTitle = formatTopicDisplayTitle(topic.title, tIdx);

                                    return (
                                      <div key={topic.id}>
                                        {/* Topic Row */}
                                        <div
                                          className={`group/topic flex items-center justify-between gap-1.5 pl-1 pr-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                            isTopicActive
                                              ? "bg-primary/15 text-primary font-semibold"
                                              : "text-foreground/75 hover:text-foreground hover:bg-background/40"
                                          }`}
                                          onClick={() => onSelectTopic?.(topic.id, lesson.id, mod.id)}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTopic(topic.id);
                                              }}
                                              className="p-0.5 text-muted-foreground hover:text-slate-50 transition cursor-pointer shrink-0"
                                              aria-label={topicOpen ? "Collapse topic" : "Expand topic"}
                                            >
                                              <ChevronRight
                                                size={11}
                                                className={`transition-transform duration-200 ${topicOpen ? "rotate-90 text-primary" : ""}`}
                                              />
                                            </button>
                                            <TopicIcon size={12} className={`shrink-0 ${isTopicActive ? "text-primary" : topicMeta.color}`} />
                                            <span className="truncate text-[13px] leading-snug" title={topic.title}>
                                              {displayTitle}
                                            </span>
                                            {topicMeta.type !== "theory" && (
                                              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${topicMeta.bgClass}`}>
                                                {topicMeta.badge}
                                              </span>
                                            )}
                                          </div>


                                          {role === "INSTRUCTOR" && (
                                            <RowMenu
                                              groupName="topic"
                                              items={[
                                                { label: "Edit Topic", icon: Pencil, onSelect: () => onEditTopic?.(topic, lesson.id, mod.id) },
                                                { label: "Add Content", icon: Plus, onSelect: () => onAddContentToTopic?.(topic.id, lesson.id, mod.id) },
                                                { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToTopic?.(topic, lesson, mod) },
                                                { label: "Add Assignment", icon: ClipboardList, onSelect: () => onAddAssignmentToTopic?.(topic, lesson, mod) },
                                                { separator: true },
                                                { label: "Move Up", icon: ArrowUp, disabled: tIdx === 0, onSelect: () => handleMoveTopic(lesson, topic.id, "up") },
                                                { label: "Move Down", icon: ArrowDown, disabled: tIdx === lessonTopics.length - 1, onSelect: () => handleMoveTopic(lesson, topic.id, "down") },
                                                { separator: true },
                                                {
                                                  label: "Delete Topic",
                                                  icon: Trash2,
                                                  destructive: true,
                                                  onSelect: (e) => onDeleteTopic?.(e, topic, lesson.id),
                                                },
                                              ]}
                                            />
                                          )}
                                        </div>

                                        {/* Topic Quizzes + Topic Assignments + Contents */}
                                        <Collapsible open={topicOpen}>
                                          <div className="ml-3 pl-3 py-0.5 space-y-0.5 border-l border-border/60">
                                            {/* Topic Assignments (when present) */}
                                            <AssignmentRows
                                              assignments={topic.assignments}
                                              composerMode={composerMode}
                                              composeAssignmentId={composeAssignmentId}
                                              onSelectAssignment={onSelectAssignment}
                                              onDeleteAssignment={onDeleteAssignment}
                                              role={role}
                                              mod={mod}
                                              lesson={lesson}
                                              topic={topic}
                                            />
                                          </div>
                                          <ParentContentRows
                                            parent={{ parentType: "topic", parentId: topic.id }}
                                            isActive={composerMode === "topic"}
                                            selectedCellId={selectedCellId}
                                            onSelectContent={(content) => onSelectContent?.(content, topic, lesson, mod)}
                                            onDeleteContent={(e, content) => onDeleteContent?.(e, content, topic.id)}
                                            quizzes={topic.quizzes || []}
                                            composerMode={composerMode}
                                            composeQuizId={composeQuizId}
                                            onSelectQuiz={(quiz, opts) => onSelectQuiz?.(quiz, mod, lesson, topic, opts)}
                                            onDuplicateQuiz={(quiz) => onDuplicateQuiz?.(quiz, mod, lesson, topic)}
                                            onDeleteQuiz={(e, quiz) => onDeleteQuiz?.(e, quiz, mod, lesson, topic)}
                                            role={role}
                                            progress={progress}
                                            isDraftMode={isDraftMode}
                                            draftContents={topic.contents}
                                          />
                                        </Collapsible>
                                      </div>
                                    );
                                  }}
                                />
                              </div>
                            </Collapsible>
                          </div>
                        );
                      }}
                    />
                  </div>
                </Collapsible>
              </div>
            );
          })
        )}
      </div>

      </div>
    </aside>
  );
}

export const CourseStructureSidebar = CourseComposerSidebar;
