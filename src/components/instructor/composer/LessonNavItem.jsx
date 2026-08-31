"use client";

import { useState } from "react";
import { Pencil, Trash2, ArrowUp, ArrowDown, Check, X, CircleDot, Circle } from "lucide-react";

import { useUpdateLesson } from "@/hooks/queries/instructor/useUpdateLesson";
import { useDeleteLesson } from "@/hooks/queries/instructor/useDeleteLesson";
import { useConfirm } from "@/context/ConfirmContext";

export default function LessonNavItem({
  lesson,
  moduleId,
  isActive,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(lesson.title);

  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();
  const confirm = useConfirm();

  const saveRename = () => {
    setIsRenaming(false);
    if (!title.trim() || title === lesson.title) {
      setTitle(lesson.title);
      return;
    }
    updateLesson.mutate({ lessonId: lesson.id, lessonData: { moduleId, title } });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete lesson",
      message: `Delete "${lesson.title}" and all its content blocks?`,
      confirmText: "Delete",
    });
    if (!ok) return;
    deleteLesson.mutate({ lessonId: lesson.id, moduleId });
  };

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition ${
        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      }`}
    >
      {lesson.isPublished ? (
        <CircleDot size={11} className="text-emerald-500 shrink-0" />
      ) : (
        <Circle size={11} className="text-slate-600 shrink-0" />
      )}

      {isRenaming ? (
        <input
          autoFocus
          value={title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => e.key === "Enter" && saveRename()}
          className="flex-1 min-w-0 bg-muted rounded px-1.5 py-0.5 text-xs outline-none border border-primary"
        />
      ) : (
        <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
      )}

      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
        >
          <ArrowUp size={11} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
        >
          <ArrowDown size={11} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsRenaming(true);
          }}
          className="p-1 rounded text-muted-foreground hover:text-foreground"
        >
          <Pencil size={11} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1 rounded text-muted-foreground hover:text-red-400"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
