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
      className="space-y-4"
    >
      <textarea
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        rows={4}
        placeholder="Write a sticky note..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-orange-500"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {STICKY_NOTE_COLORS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() =>
                setColor(item.name)
              }
              className={`h-8 w-8 rounded-full border-2 transition ${
  color === item.name
    ? "border-white"
    : "border-transparent"
} ${item.className}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
           Timestamp: {formatDuration(currentTimestamp)}
          </span>

          <button
            type="submit"
            disabled={
              isPending ||
              !content.trim()
            }
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? "Saving..."
              : "Add Note"}
          </button>
        </div>
      </div>
    </form>
  );
}