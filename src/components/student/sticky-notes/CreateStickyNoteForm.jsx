"use client";

import { useState } from "react";

import { useCreateStickyNote } from "@/hooks/queries/student/useCreateStickyNote";

import { STICKY_NOTE_COLORS } from "@/constants/stickyNoteColors";
import { formatDuration } from "@/utils/formatDuration";

export default function CreateStickyNoteForm({
  lessonId,
  currentTimestamp = 0
}) {
  const [content, setContent] =
    useState("");

  const [color, setColor] =
    useState("yellow");

  const {
    mutate: createStickyNote,
    isPending
  } = useCreateStickyNote();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    createStickyNote(
      {
        lessonId,
        content: content.trim(),
        color,
        timestamp: currentTimestamp
      },
      {
        onSuccess: () => {
          setContent("");
          setColor("yellow");
        }
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2.5 sm:space-y-4"
    >
      <textarea
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        rows={3}
        placeholder="Write a sticky note..."
        className="w-full rounded-lg border border-transparent bg-background p-2.5 sm:p-3 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
      />

      {/* Color Selectors Row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {STICKY_NOTE_COLORS.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setColor(item.name)}
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg border-2 transition ${
              color === item.name
                ? "border-white scale-105 shadow-xs"
                : "border-transparent opacity-80 hover:opacity-100"
            } ${item.className}`}
            aria-label={`Select ${item.name} color`}
          />
        ))}
      </div>

      {/* Timestamp + Add Note Row */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
          Timestamp: {formatDuration(currentTimestamp)}
        </span>

        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-foreground transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add Note"}
        </button>
      </div>
    </form>
  );
}