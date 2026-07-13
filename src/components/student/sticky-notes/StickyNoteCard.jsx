"use client";

import { useState } from "react";

import { useDeleteStickyNote } from "@/hooks/queries/student/useDeleteStickyNote";
import { useToggleStickyNotePin } from "@/hooks/queries/student/useToggleStickyNotePin";
import { useUpdateStickyNote } from "@/hooks/queries/student/useUpdateStickyNote";
import { STICKY_NOTE_COLORS } from "@/constants/stickyNoteColors";
import { formatDuration } from "@/utils/formatDuration";


const colorClasses = {
  yellow: "border-yellow-500 bg-yellow-500/10",
  blue: "border-blue-500 bg-blue-500/10",
  green: "border-green-500 bg-green-500/10",
  pink: "border-pink-500 bg-pink-500/10",
  purple: "border-purple-500 bg-purple-500/10"
};

export default function StickyNoteCard({
  note,
  lessonId
}) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [content, setContent] =
    useState(note.content);

  const [color, setColor] = useState(
    note.color || "yellow"
  );

  const {
    mutate: updateStickyNote,
    isPending: isUpdating
  } = useUpdateStickyNote();

  const {
    mutate: deleteStickyNote,
    isPending: isDeleting
  } = useDeleteStickyNote();

  const {
    mutate: togglePin,
    isPending: isPinning
  } = useToggleStickyNotePin();

//   const formatTimestamp = (
//     seconds = 0
//   ) => {
//     const minutes = Math.floor(
//       seconds / 60
//     );

//     const secs = seconds % 60;

//     return `${minutes}:${String(
//       secs
//     ).padStart(2, "0")}`;
//   };
  const handleSave = () => {
    updateStickyNote({
  stickyNoteId: note.id,
  payload: {
    content,
    color,
    timestamp: note.timestamp,
    isPinned: note.isPinned
  }
});

    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        colorClasses[color]
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {note.isPinned && (
            <span className="text-lg">
              📌
            </span>
          )}

          <span className="text-xs text-slate-400">
            {formatDuration(note.timestamp)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              togglePin(
                  note.id,
                )
            }
            disabled={isPinning}
            className="text-xs text-orange-400 hover:text-orange-300"
          >
            {note.isPinned
              ? "Unpin"
              : "Pin"}
          </button>

          <button
            onClick={() =>
              setIsEditing(
                !isEditing
              )
            }
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Edit
          </button>

          <button
            onClick={() =>
              deleteStickyNote(
                  note.id)
            }
            disabled={isDeleting}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <>
          <textarea
            rows={4}
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {
            STICKY_NOTE_COLORS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  setColor(item.name)
                }
                className={`h-7 w-7 rounded-full border-2 ${
  color === item.name
    ? "border-white"
    : "border-transparent"
} ${item.className}`}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={
                isUpdating
              }
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              Save
            </button>

            <button
              onClick={() => {
                setContent(
                  note.content
                );
                setColor(
                  note.color
                );
                setIsEditing(
                  false
                );
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-white">
          {note.content}
        </p>
      )}
    </div>
  );
}