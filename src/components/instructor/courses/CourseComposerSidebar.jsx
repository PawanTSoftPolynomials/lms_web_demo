"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  BookOpen,
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
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useDuplicateContent } from "@/components/instructor/LessonComposer/contentMutations";
import { useReorderModules } from "@/hooks/queries/instructor/useReorderModules";
import { useReorderLessons } from "@/hooks/queries/instructor/useReorderLessons";
import { useReorderTopics } from "@/hooks/queries/instructor/useReorderTopics";
import { useReorderContents } from "@/hooks/queries/instructor/useReorderContents";
import { swapSiblingOrder } from "@/lib/reorderSiblings";
import { useToast } from "@/components/ui/ToastProvider";

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
      color: "text-emerald-400",
      bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
  }
  if (t.includes("assignment")) {
    return {
      type: "assignment",
      badge: "Assignment",
      icon: ClipboardList,
      color: "text-amber-400",
      bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };
  }
  if (t.includes("home task") || t.includes("hometask") || t.includes("homework")) {
    return {
      type: "hometask",
      badge: "Home Task",
      icon: Target,
      color: "text-purple-400",
      bgClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    };
  }
  if (t.includes("checklist") || t.includes("revision")) {
    return {
      type: "checklist",
      badge: "Checklist",
      icon: CheckSquare,
      color: "text-sky-400",
      bgClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    };
  }
  return {
    type: "theory",
    badge: "Theory",
    icon: BookOpen,
    color: "text-blue-400",
    bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
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
  VIDEO: { icon: Video, label: "Video", color: "text-red-400" },
  AUDIO: { icon: Music2, label: "Audio", color: "text-teal-400" },
  DOCUMENT: { icon: FileText, label: "Document", color: "text-blue-400" },
  TEXT: { icon: AlignLeft, label: "Text", color: "text-blue-300" },
  HTML: { icon: AlignLeft, label: "Text", color: "text-blue-300" },
  IMAGE: { icon: ImageIcon, label: "Image", color: "text-purple-400" },
  LINK: { icon: Link2, label: "Link", color: "text-green-400" },
  EXTERNAL_LINK: { icon: Link2, label: "Link", color: "text-green-400" },
  PRESENTATION: { icon: Presentation, label: "Presentation", color: "text-amber-400" },
  SLIDE: { icon: Presentation, label: "Slide", color: "text-amber-400" },
  PDF: { icon: File, label: "PDF", color: "text-sky-400" },
  FILE: { icon: File, label: "File", color: "text-sky-400" },
  CODE: { icon: Code2, label: "Code", color: "text-violet-400" },
  CODING_EXERCISE: { icon: Code2, label: "Coding Exercise", color: "text-violet-400" },
  ASSIGNMENT: { icon: ClipboardList, label: "Assignment", color: "text-amber-300" },
  SCORM: { icon: PackageOpen, label: "SCORM", color: "text-slate-400" },
  INTERACTIVE_LAB: { icon: FlaskConical, label: "Interactive Lab", color: "text-pink-400" },
  EMBED: { icon: MonitorPlay, label: "Embed", color: "text-indigo-400" },
};
const DEFAULT_CONTENT_META = { icon: File, label: "Content", color: "text-slate-400" };

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
const HOVER_VISIBLE_CLASSES = {
  module: "opacity-0 group-hover/module:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  lesson: "opacity-0 group-hover/lesson:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  topic: "opacity-0 group-hover/topic:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
  content: "opacity-0 group-hover/content:opacity-100 focus:opacity-100 data-[state=open]:opacity-100",
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
            className={`${HOVER_VISIBLE_CLASSES[groupName]} p-1 text-slate-400 hover:text-slate-50 rounded transition cursor-pointer shrink-0`}
            aria-label="Actions"
          >
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-200" onClick={(e) => e.stopPropagation()}>
          {items.map((item, idx) =>
            item.separator ? (
              <DropdownMenuSeparator key={`sep-${idx}`} className="bg-slate-800" />
            ) : (
              <DropdownMenuItem
                key={item.label}
                disabled={item.disabled}
                variant={item.destructive ? "destructive" : "default"}
                onClick={(e) => e.stopPropagation()}
                onSelect={(e) => {
                  item.onSelect?.(e);
                }}
                className={`cursor-pointer ${item.destructive ? "text-red-400 hover:bg-red-950/40" : "hover:bg-slate-900"}`}
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

/** Lazily fetches and renders a single topic's Content rows — only mounted once its topic is expanded. */
function TopicContentRows({
  topic,
  lesson,
  mod,
  composerMode,
  selectedCellId,
  onSelectContent,
  onDeleteContent,
  role = "INSTRUCTOR",
  completedLessonIds = [],
  isDraftMode = false,
}) {
  const { data: apiContents = [], isLoading: isApiLoading, isError: isApiError } = useContents(isDraftMode ? "" : topic.id);

  const contents = isDraftMode ? (topic?.contents || []) : (apiContents || []);
  const isLoading = isDraftMode ? false : isApiLoading;
  const isError = isDraftMode ? false : isApiError;
  const { duplicate } = useDuplicateContent();
  const reorderContents = useReorderContents();
  const { showToast } = useToast();

  const handleMove = async (contentId, direction) => {
    const plan = swapSiblingOrder(contents, contentId, direction);
    if (!plan) return;
    try {
      await reorderContents.mutateAsync({ topicId: topic.id, contents: plan });
    } catch {
      showToast("Failed to reorder content", "error");
    }
  };

  const handleDuplicate = async (content) => {
    const validOrders = contents
      .map((c) => (typeof c.order === "number" && c.order > 0 ? c.order : 0))
      .filter((o) => o > 0);
    const nextOrder = validOrders.length > 0 ? Math.max(...validOrders) + 1 : contents.length + 1;
    try {
      await duplicate(content, nextOrder);
    } catch {
      showToast("Failed to duplicate content", "error");
    }
  };

  return (
    <div className="mt-0.5 mb-1 ml-3 pl-3 py-0.5 space-y-0.5 border-l border-orange-500/20">
      {isLoading ? (
        <div className="flex items-center gap-1.5 py-1.5 px-2 text-[10px] text-slate-500">
          <Loader2 size={11} className="animate-spin shrink-0" />
          Loading contents…
        </div>
      ) : isError ? (
        <div className="flex items-center gap-1.5 py-1.5 px-2 text-[10px] text-red-400/80">
          <AlertCircle size={11} className="shrink-0" />
          Failed to load contents.
        </div>
      ) : contents.length === 0 ? (
        <div className="py-1.5 px-2 text-[10px] text-slate-500 italic">No content yet.</div>
      ) : (
        contents.map((content, cIdx) => {
          const meta = CONTENT_TYPE_META[content.type] || DEFAULT_CONTENT_META;
          const Icon = meta.icon;
          const isContentActive = composerMode === "topic" && selectedCellId === content.id;

          return (
            <div
              key={content.id}
              onClick={() => onSelectContent?.(content, topic, lesson, mod)}
              title={content.title || meta.label}
              className={`group/content flex items-center justify-between gap-2 pl-2 pr-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isContentActive
                  ? "bg-orange-500/15 text-orange-400 font-semibold"
                  : "text-slate-400 hover:text-slate-50 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Icon size={12} className={`shrink-0 ${isContentActive ? "text-orange-400" : meta.color}`} />
                <span className="truncate text-[10.5px] leading-snug">
                  {content.title || `Untitled ${meta.label}`}
                </span>
              </div>

              {role === "INSTRUCTOR" && (
                <RowMenu
                  groupName="content"
                  items={[
                    { label: "Edit Content", icon: Pencil, onSelect: () => onSelectContent?.(content, topic, lesson, mod) },
                    { label: "Duplicate Content", icon: Copy, onSelect: () => handleDuplicate(content) },
                    { separator: true },
                    { label: "Move Up", icon: ArrowUp, disabled: cIdx === 0, onSelect: () => handleMove(content.id, "up") },
                    { label: "Move Down", icon: ArrowDown, disabled: cIdx === contents.length - 1, onSelect: () => handleMove(content.id, "down") },
                    { separator: true },
                    {
                      label: "Delete Content",
                      icon: Trash2,
                      destructive: true,
                      onSelect: (e) => onDeleteContent?.(e, content, topic.id),
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

import { CheckCircle2, Lock } from "lucide-react";

export function CourseComposerSidebar({
  modules = [],
  courseQuizzes = [],
  composerMode,
  composeModuleId,
  composeLessonId,
  composeTopicId,
  composeQuizId,
  selectedCellId,
  isOpen = true,
  onToggleOpen,
  onSelectCourseOverview,
  onSelectQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
  onSelectLesson,
  onSelectModule,
  onSelectTopic,
  onSelectContent,
  onAddLesson,
  onAddQuizToCourse,
  onAddQuizToModule,
  onAddQuizToLesson,
  onAddQuizToTopic,
  onAddModule,
  onAddTopic,
  onAddContent,
  onEditModule,
  onEditLesson,
  onEditTopic,
  onDeleteLesson,
  onDeleteModule,
  onDeleteTopic,
  onDeleteContent,
  role = "INSTRUCTOR",
  completedLessonIds = [],
  isDraftMode = false,
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

  return (
    <aside className="sidebar-panel rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl flex flex-col h-full max-h-[calc(100vh-7rem)] overflow-hidden text-slate-200">
      {/* Panel Title */}
      <div className="flex items-center justify-between gap-2 mb-1 shrink-0">
        <div className="font-black text-xs uppercase tracking-widest text-slate-200 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent, #f97316)" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Course Map</span>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          className="p-1 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-900 transition cursor-pointer shrink-0"
          aria-label="Hide course map"
          title="Hide course map"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Compact subtitle */}
      <div className="text-[10.5px] text-slate-500 mb-3 pb-3 border-b border-slate-800/80">
        Course structure
      </div>

      {/* New Module Button - Instructor only */}
      {role === "INSTRUCTOR" && (
        <button
          type="button"
          className="w-full py-2 mb-3 flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold transition cursor-pointer shrink-0"
          onClick={onAddModule}
        >
          <Plus size={14} />
          New Module
        </button>
      )}

      {/* Course Overview Root Item */}
      <div className="flex items-center justify-between gap-1 mb-1 shrink-0 group/module">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition cursor-pointer text-xs flex-1 border-l-[3px] ${
            composerMode === "course"
              ? "bg-orange-500/15 border-orange-500 text-orange-400 font-bold"
              : "border-transparent text-slate-300 hover:bg-slate-900"
          }`}
          onClick={onSelectCourseOverview}
        >
          <Home size={14} className={composerMode === "course" ? "text-orange-400 shrink-0" : "text-slate-400 shrink-0"} />
          <span className="truncate font-semibold">Course Overview</span>
        </div>
        {role === "INSTRUCTOR" && (
          <RowMenu
            groupName="module"
            items={[
              { label: "Add Course Quiz", icon: HelpCircle, onSelect: () => onAddQuizToCourse?.() },
            ]}
          />
        )}
      </div>

      {/* Course-Level Quizzes (when present) */}
      {courseQuizzes.length > 0 && (
        <div className="mb-2 space-y-0.5 pl-1">
          {courseQuizzes.map((quiz, qIdx) => {
            const isQuizActive = composerMode === "quiz" && composeQuizId === quiz.id;
            const questions = quiz.questions || (quiz.quizQuestions || []).map((qq) => qq.question) || [];

            return (
              <div key={quiz.id || `c-quiz-${qIdx}`}>
                <div
                  className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer text-xs border-l-[3px] ${
                    isQuizActive
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                      : "border-transparent text-slate-300 hover:bg-slate-900"
                  }`}
                  onClick={() => onSelectQuiz?.(quiz, null, null)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <HelpCircle size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate text-[11.5px] font-semibold">{quiz.title || "Course Quiz"}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                      {questions.length} Qs
                    </span>
                    {role === "INSTRUCTOR" && (
                      <RowMenu
                        groupName="quiz"
                        items={[
                          {
                            label: "Edit Quiz",
                            icon: Pencil,
                            onSelect: () => onSelectQuiz?.(quiz, null, null, { startEditing: true }),
                          },
                          {
                            label: "Preview Quiz",
                            icon: Eye,
                            onSelect: () => onSelectQuiz?.(quiz, null, null, { startEditing: false }),
                          },
                          {
                            label: "Duplicate Quiz",
                            icon: Copy,
                            onSelect: () => onDuplicateQuiz?.(quiz, null, null),
                          },
                          { separator: true },
                          {
                            label: "Delete Quiz",
                            icon: Trash2,
                            destructive: true,
                            onSelect: (e) => onDeleteQuiz?.(e, quiz, null, null),
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
      )}

      {/* Modules Tree */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1 text-xs">
        {modules.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
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
                      ? "bg-orange-500/15 border-orange-500 text-orange-400 font-bold"
                      : moduleHasActiveChild
                      ? "bg-slate-900/40 border-orange-500/40 text-slate-100"
                      : "border-transparent text-slate-200 hover:bg-slate-900/60"
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
                      className="p-0.5 text-slate-400 hover:text-slate-50 transition cursor-pointer shrink-0"
                      aria-label={moduleOpen ? "Collapse module" : "Expand module"}
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform duration-200 ${moduleOpen ? "rotate-90 text-orange-500" : ""}`}
                      />
                    </button>
                    <Layers size={14} className={`shrink-0 ${isModuleActive ? "text-orange-400" : "text-orange-500/80"}`} />
                    <span className="text-[9px] font-black text-slate-500 tabular-nums shrink-0">
                      M{mIdx + 1}
                    </span>
                    <span className="truncate text-xs font-bold" title={mod.title}>
                      {mod.title}
                    </span>
                  </div>

                  {role === "INSTRUCTOR" && (
                    <RowMenu
                      groupName="module"
                      items={[
                        { label: "Edit Module", icon: Pencil, onSelect: () => onEditModule?.(mod) },
                        { label: "Add Lesson", icon: Plus, onSelect: () => onAddLesson?.(mod.id) },
                        { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToModule?.(mod) },
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

                {/* Module Children: Module Quizzes + Lessons */}
                <Collapsible open={moduleOpen}>
                  <div className="ml-3.5 pl-3 py-0.5 space-y-0.5 border-l border-slate-800/70">
                    {/* Module Quizzes (when present) */}
                    {modQuizzes.length > 0 && (
                      <div className="mb-1 space-y-0.5">
                        {modQuizzes.map((quiz, qIdx) => {
                          const isQuizActive = composerMode === "quiz" && composeQuizId === quiz.id;
                          const questions = quiz.questions || (quiz.quizQuestions || []).map((qq) => qq.question) || [];

                          return (
                            <div key={quiz.id || `m-quiz-${qIdx}`}>
                              <div
                                className={`flex items-center justify-between gap-1.5 pl-1.5 pr-1 py-1.5 rounded-lg transition cursor-pointer border-l-2 ${
                                  isQuizActive
                                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                                    : "border-transparent text-emerald-300/80 hover:text-emerald-300 hover:bg-slate-900/60"
                                }`}
                                onClick={() => onSelectQuiz?.(quiz, mod, null)}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <HelpCircle size={13} className="text-emerald-400 shrink-0" />
                                  <span className="truncate text-[11px] font-semibold">{quiz.title || "Module Quiz"}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                                    {questions.length} Qs
                                  </span>
                                  {role === "INSTRUCTOR" && (
                                    <RowMenu
                                      groupName="quiz"
                                      items={[
                                        {
                                          label: "Edit Quiz",
                                          icon: Pencil,
                                          onSelect: () => onSelectQuiz?.(quiz, mod, null, { startEditing: true }),
                                        },
                                        {
                                          label: "Preview Quiz",
                                          icon: Eye,
                                          onSelect: () => onSelectQuiz?.(quiz, mod, null, { startEditing: false }),
                                        },
                                        {
                                          label: "Duplicate Quiz",
                                          icon: Copy,
                                          onSelect: () => onDuplicateQuiz?.(quiz, mod, null),
                                        },
                                        { separator: true },
                                        {
                                          label: "Delete Quiz",
                                          icon: Trash2,
                                          destructive: true,
                                          onSelect: (e) => onDeleteQuiz?.(e, quiz, mod, null),
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
                    )}
                    {modLessons.length === 0 ? (
                      <div className="py-1.5 px-2 text-[10px] text-slate-500 italic">
                        No lessons in this module.
                      </div>
                    ) : (
                      modLessons.map((lesson, lIdx) => {
                        const lessonOpen = isLessonOpen(lesson.id);
                        const isLessonActive = composerMode === "lesson" && composeLessonId === lesson.id;
                        const lessonHasActiveChild = !isLessonActive && composeLessonId === lesson.id;
                        const lessonTopics = lesson.topics || [];
                        const lessonQuizzes = lesson.quizzes || [];
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isLessonLocked = role === "STUDENT" && Boolean(lesson.locked);

                        return (
                          <div key={lesson.id}>
                            {/* Lesson Row */}
                            <div
                              className={`group/lesson flex items-center justify-between gap-1.5 pl-1 pr-1 py-1.5 rounded-lg transition-colors border-l-2 ${
                                isLessonLocked
                                  ? "cursor-not-allowed opacity-50 border-transparent text-slate-500"
                                  : "cursor-pointer"
                              } ${
                                isLessonLocked
                                  ? ""
                                  : isLessonActive
                                  ? "bg-orange-500/15 border-orange-500 text-orange-400 font-bold"
                                  : lessonHasActiveChild
                                  ? "bg-slate-900/30 border-orange-500/30 text-slate-100"
                                  : "border-transparent text-slate-400 hover:text-slate-50 hover:bg-slate-900/50"
                              }`}
                              onClick={() => !isLessonLocked && onSelectLesson(lesson.id)}
                              title={isLessonLocked ? "Complete the previous lesson to unlock" : undefined}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLessonLocked) toggleLesson(lesson.id);
                                  }}
                                  className="p-0.5 text-slate-500 hover:text-slate-50 transition cursor-pointer shrink-0"
                                  aria-label={lessonOpen ? "Collapse lesson" : "Expand lesson"}
                                  disabled={isLessonLocked}
                                >
                                  <ChevronRight
                                    size={12}
                                    className={`transition-transform duration-200 ${lessonOpen ? "rotate-90 text-orange-500" : ""}`}
                                  />
                                </button>
                                {isLessonLocked ? (
                                  <Lock size={12} className="shrink-0 text-slate-500" />
                                ) : isCompleted ? (
                                  <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                                ) : (
                                  <BookOpen size={12} className={`shrink-0 ${isLessonActive ? "text-orange-400" : "text-slate-500"}`} />
                                )}
                                <span className="text-[8.5px] font-black text-slate-600 tabular-nums shrink-0">
                                  L{lIdx + 1}
                                </span>
                                <span className="truncate text-[11px] leading-snug" title={lesson.title}>
                                  {lesson.title}
                                </span>
                              </div>

                              {role === "INSTRUCTOR" && (
                                <RowMenu
                                  groupName="lesson"
                                  items={[
                                    { label: "Edit Lesson", icon: Pencil, onSelect: () => onEditLesson?.(lesson, mod.id) },
                                    { label: "Add Topic", icon: Plus, onSelect: () => onAddTopic?.(lesson.id) },
                                    { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToLesson?.(lesson, mod) },
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

                            {/* Lesson Quizzes + Topics */}
                            <Collapsible open={lessonOpen}>
                              <div className="ml-3 pl-3 py-0.5 space-y-0.5 border-l border-slate-800/60">
                                {/* Lesson Quizzes (when present) */}
                                {lessonQuizzes.length > 0 && (
                                  <div className="mb-1 space-y-0.5">
                                    {lessonQuizzes.map((quiz, qIdx) => {
                                      const isQuizActive = composerMode === "quiz" && composeQuizId === quiz.id;
                                      const questions = quiz.questions || (quiz.quizQuestions || []).map((qq) => qq.question) || [];

                                      return (
                                        <div key={quiz.id || `l-quiz-${qIdx}`}>
                                          <div
                                            className={`flex items-center justify-between gap-1.5 pl-1.5 pr-1 py-1.5 rounded-lg transition cursor-pointer border-l-2 ${
                                              isQuizActive
                                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                                                : "border-transparent text-emerald-300/80 hover:text-emerald-300 hover:bg-slate-900/60"
                                            }`}
                                            onClick={() => onSelectQuiz?.(quiz, mod, lesson)}
                                          >
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                              <HelpCircle size={13} className="text-emerald-400 shrink-0" />
                                              <span className="truncate text-[11px] font-semibold">{quiz.title || "Lesson Quiz"}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                                                {questions.length} Qs
                                              </span>
                                              {role === "INSTRUCTOR" && (
                                                <RowMenu
                                                  groupName="quiz"
                                                  items={[
                                                    {
                                                      label: "Edit Quiz",
                                                      icon: Pencil,
                                                      onSelect: () => onSelectQuiz?.(quiz, mod, lesson, { startEditing: true }),
                                                    },
                                                    {
                                                      label: "Preview Quiz",
                                                      icon: Eye,
                                                      onSelect: () => onSelectQuiz?.(quiz, mod, lesson, { startEditing: false }),
                                                    },
                                                    {
                                                      label: "Duplicate Quiz",
                                                      icon: Copy,
                                                      onSelect: () => onDuplicateQuiz?.(quiz, mod, lesson),
                                                    },
                                                    { separator: true },
                                                    {
                                                      label: "Delete Quiz",
                                                      icon: Trash2,
                                                      destructive: true,
                                                      onSelect: (e) => onDeleteQuiz?.(e, quiz, mod, lesson),
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
                                )}
                                {lessonTopics.length === 0 ? (
                                  <div className="py-1.5 px-2 text-[10px] text-slate-500 italic">
                                    No topics in this lesson.
                                  </div>
                                ) : (
                                  lessonTopics.map((topic, tIdx) => {
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
                                              ? "bg-orange-500/15 text-orange-400 font-semibold"
                                              : "text-slate-400 hover:text-slate-50 hover:bg-slate-900/40"
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
                                              className="p-0.5 text-slate-500 hover:text-slate-50 transition cursor-pointer shrink-0"
                                              aria-label={topicOpen ? "Collapse topic" : "Expand topic"}
                                            >
                                              <ChevronRight
                                                size={11}
                                                className={`transition-transform duration-200 ${topicOpen ? "rotate-90 text-orange-500" : ""}`}
                                              />
                                            </button>
                                            <TopicIcon size={12} className={`shrink-0 ${isTopicActive ? "text-orange-400" : topicMeta.color}`} />
                                            <span className="truncate text-[11px] leading-snug" title={topic.title}>
                                              {displayTitle}
                                            </span>
                                            {topicMeta.type !== "theory" && (
                                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${topicMeta.bgClass}`}>
                                                {topicMeta.badge}
                                              </span>
                                            )}
                                          </div>

                                          {role === "INSTRUCTOR" && (
                                            <RowMenu
                                              groupName="topic"
                                              items={[
                                                { label: "Edit Topic", icon: Pencil, onSelect: () => onEditTopic?.(topic, lesson.id, mod.id) },
                                                { label: "Add Content", icon: Plus, onSelect: () => onAddContent?.(topic.id, lesson.id, mod.id) },
                                                { label: "Add Quiz", icon: HelpCircle, onSelect: () => onAddQuizToTopic?.(topic, lesson, mod) },
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

                                        {/* Topic Quizzes + Contents */}
                                        <Collapsible open={topicOpen}>
                                          <div className="ml-3 pl-3 py-0.5 space-y-0.5 border-l border-slate-800/60">
                                            {(topic.quizzes || []).length > 0 && (
                                              <div className="mb-1 space-y-0.5">
                                                {(topic.quizzes || []).map((quiz, qIdx) => {
                                                  const isQuizActive = composerMode === "quiz" && composeQuizId === quiz.id;
                                                  const questions = quiz.questions || (quiz.quizQuestions || []).map((qq) => qq.question) || [];

                                                  return (
                                                    <div key={quiz.id || `t-quiz-${qIdx}`}>
                                                      <div
                                                        className={`flex items-center justify-between gap-1.5 pl-1.5 pr-1 py-1.5 rounded-lg transition cursor-pointer border-l-2 ${
                                                          isQuizActive
                                                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                                                            : "border-transparent text-emerald-300/80 hover:text-emerald-300 hover:bg-slate-900/60"
                                                        }`}
                                                        onClick={() => onSelectQuiz?.(quiz, mod, lesson, topic)}
                                                      >
                                                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                          <HelpCircle size={13} className="text-emerald-400 shrink-0" />
                                                          <span className="truncate text-[11px] font-semibold">{quiz.title || "Topic Quiz"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                                                            {questions.length} Qs
                                                          </span>
                                                          {role === "INSTRUCTOR" && (
                                                            <RowMenu
                                                              groupName="quiz"
                                                              items={[
                                                                {
                                                                  label: "Edit Quiz",
                                                                  icon: Pencil,
                                                                  onSelect: () => onSelectQuiz?.(quiz, mod, lesson, topic, { startEditing: true }),
                                                                },
                                                                {
                                                                  label: "Preview Quiz",
                                                                  icon: Eye,
                                                                  onSelect: () => onSelectQuiz?.(quiz, mod, lesson, topic, { startEditing: false }),
                                                                },
                                                                {
                                                                  label: "Duplicate Quiz",
                                                                  icon: Copy,
                                                                  onSelect: () => onDuplicateQuiz?.(quiz, mod, lesson, topic),
                                                                },
                                                                { separator: true },
                                                                {
                                                                  label: "Delete Quiz",
                                                                  icon: Trash2,
                                                                  destructive: true,
                                                                  onSelect: (e) => onDeleteQuiz?.(e, quiz, mod, lesson, topic),
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
                                            )}
                                          </div>
                                          <TopicContentRows
                                            topic={topic}
                                            lesson={lesson}
                                            mod={mod}
                                            composerMode={composerMode}
                                            selectedCellId={selectedCellId}
                                            onSelectContent={onSelectContent}
                                            onDeleteContent={onDeleteContent}
                                            role={role}
                                            isDraftMode={isDraftMode}
                                          />
                                        </Collapsible>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </Collapsible>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Collapsible>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

export const CourseStructureSidebar = CourseComposerSidebar;
