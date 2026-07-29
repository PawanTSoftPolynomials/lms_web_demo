"use client";

import { useState } from "react";
import { Pin, Edit2, Trash2, X } from "lucide-react";

import { useDeleteStickyNote } from "@/hooks/queries/student/useDeleteStickyNote";
import { useToggleStickyNotePin } from "@/hooks/queries/student/useToggleStickyNotePin";
import { useUpdateStickyNote } from "@/hooks/queries/student/useUpdateStickyNote";
import { STICKY_NOTE_COLORS } from "@/constants/stickyNoteColors";

function formatTimestamp(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const colorClasses = {
  yellow: "border-l-amber-500 bg-amber-500/5 text-amber-200",
  blue: "border-l-blue-500 bg-blue-500/5 text-blue-200",
  green: "border-l-emerald-500 bg-emerald-500/5 text-emerald-200",
  pink: "border-l-pink-500 bg-pink-500/5 text-pink-200",
  purple: "border-l-purple-500 bg-purple-500/5 text-purple-200",
};

export default function StickyNoteCard({ note, onSeek }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color || "yellow");

  const { mutate: updateStickyNote, isPending: isUpdating } =
    useUpdateStickyNote();
  const { mutate: deleteStickyNote, isPending: isDeleting } =
    useDeleteStickyNote();
  const { mutate: togglePin, isPending: isPinning } =
    useToggleStickyNotePin();

  const handleSave = () => {
    updateStickyNote({
      stickyNoteId: note.id,
      payload: {
        content,
        color,
        timestamp: note.timestamp,
        isPinned: note.isPinned,
      },
    });
    setIsEditing(false);
  };

  const formattedTime = formatTimestamp(note.timestamp);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isEditing) onSeek?.(note.timestamp || 0);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isEditing) {
          e.preventDefault();
          onSeek?.(note.timestamp || 0);
        }
      }}
      className={`group relative rounded-r-xl border-l-4 border-y border-r border-slate-800/80 p-3 transition-all duration-200 cursor-pointer select-none ${
        colorClasses[color] || colorClasses.yellow
      }`}
    >
      {/* Top Header Row */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Timestamp Indicator */}
          <span className="font-mono text-[11px] font-bold text-orange-400">
            {formattedTime}
          </span>

          {note.isPinned && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
              <Pin size={9} className="fill-amber-400" />
              Pinned
            </span>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePin(note.id);
            }}
            disabled={isPinning}
            className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-orange-400 transition cursor-pointer"
            title={note.isPinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={12} className={note.isPinned ? "fill-orange-400 text-orange-400" : ""} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-blue-400 transition cursor-pointer"
            title="Edit note"
          >
            <Edit2 size={12} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteStickyNote(note.id);
            }}
            disabled={isDeleting}
            className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-red-400 transition cursor-pointer"
            title="Delete note"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Note Content / Edit Form */}
      {isEditing ? (
        <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 font-sans"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STICKY_NOTE_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setColor(item.name)}
                  className={`h-4 w-4 rounded-full border transition ${
                    color === item.name ? "border-white scale-110" : "border-transparent"
                  } ${item.className}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setContent(note.content);
                  setColor(note.color);
                  setIsEditing(false);
                }}
                className="p-1 rounded border border-slate-700 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-xs font-normal leading-relaxed text-slate-200">
          {note.content}
        </p>
      )}
    </div>
  );
}