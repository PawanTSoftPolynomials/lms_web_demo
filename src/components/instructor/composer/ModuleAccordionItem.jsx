"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
} from "lucide-react";

import LessonNavItem from "@/components/instructor/composer/LessonNavItem";

import { useUpdateModule } from "@/hooks/queries/instructor/useUpdateModule";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";
import { useCreateLesson } from "@/hooks/queries/instructor/useCreateLesson";
import { useReorderLessons } from "@/hooks/queries/instructor/useReorderLessons";
import { useConfirm } from "@/context/ConfirmContext";

export default function ModuleAccordionItem({
  module: mod,
  courseId,
  isFirst,
  isLast,
  selectedLessonId,
  onSelectLesson,
  onMoveModuleUp,
  onMoveModuleDown,
  defaultOpen,
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(mod.title);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();
  const createLesson = useCreateLesson();
  const reorderLessons = useReorderLessons();
  const confirm = useConfirm();

  const lessons = [...(mod.lessons || [])].sort((a, b) => a.order - b.order);

  const saveRename = () => {
    setIsRenaming(false);
    if (!title.trim() || title === mod.title) {
      setTitle(mod.title);
      return;
    }
    updateModule.mutate({ moduleId: mod.id, moduleData: { courseId, title } });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete module",
      message: `Delete "${mod.title}" and everything inside it?`,
      confirmText: "Delete",
    });
    if (!ok) return;
    deleteModule.mutate(mod.id);
  };

  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return;
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;
    createLesson.mutate(
      { moduleId: mod.id, title: newLessonTitle, order: nextOrder },
      { onSuccess: () => setOpen(true) },
    );
    setNewLessonTitle("");
    setAddingLesson(false);
  };

  const moveLesson = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const reordered = [...lessons];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    reorderLessons.mutate({
      moduleId: mod.id,
      lessons: reordered.map((l, i) => ({ lessonId: l.id, order: i + 1 })),
    });
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
      <div
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 px-2.5 py-2 cursor-pointer hover:bg-slate-800/40"
      >
        {open ? (
          <ChevronDown size={14} className="text-slate-500 shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-slate-500 shrink-0" />
        )}

        {isRenaming ? (
          <input
            autoFocus
            value={title}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => e.key === "Enter" && saveRename()}
            className="flex-1 min-w-0 bg-slate-800 rounded px-1.5 py-0.5 text-xs outline-none border border-orange-500"
          />
        ) : (
          <span className="flex-1 min-w-0 truncate text-sm font-bold text-white">{mod.title}</span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              onMoveModuleUp();
            }}
            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              onMoveModuleDown();
            }}
            className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20"
          >
            <ArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            className="p-1 rounded text-slate-500 hover:text-white"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 rounded text-slate-500 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-2 pb-2 space-y-0.5 border-t border-slate-800/60 pt-1.5">
          {lessons.map((lesson, i) => (
            <LessonNavItem
              key={lesson.id}
              lesson={lesson}
              moduleId={mod.id}
              isActive={lesson.id === selectedLessonId}
              isFirst={i === 0}
              isLast={i === lessons.length - 1}
              onSelect={() => onSelectLesson(lesson.id)}
              onMoveUp={() => moveLesson(i, -1)}
              onMoveDown={() => moveLesson(i, 1)}
            />
          ))}

          {addingLesson ? (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <input
                autoFocus
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLesson()}
                onBlur={() => !newLessonTitle.trim() && setAddingLesson(false)}
                placeholder="Lesson title…"
                className="flex-1 min-w-0 bg-slate-800 rounded px-1.5 py-1 text-xs outline-none border border-orange-500"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingLesson(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-orange-400"
            >
              <Plus size={12} /> Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}
