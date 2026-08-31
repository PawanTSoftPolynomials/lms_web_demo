"use client";

import CreateStickyNoteForm from "./CreateStickyNoteForm";
import EmptyStickyNotes from "./EmptyStickyNotes";
import StickyNoteCard from "./StickyNoteCard";

import { useStickyNotes } from "@/hooks/queries/student/useStickyNotes";

export default function StickyNotesPanel({
  lessonId,
  currentTimestamp = 0,
  onSeek,
}) {
  const {
    data: stickyNotes = [],
    isLoading,
    isError,
  } = useStickyNotes(lessonId);

  if (!lessonId) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-[#1e2030] bg-[#0d0e16]/60 p-5 backdrop-blur-md shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <span>📌 Sticky Notes</span>
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground font-semibold">
            Timestamped notes anchored to video playback.
          </p>
        </div>
      </div>

      <CreateStickyNoteForm
        lessonId={lessonId}
        currentTimestamp={currentTimestamp}
      />

      <div className="mt-5">
        {isLoading ? (
          <div className="py-8 text-center text-xs font-semibold text-muted-foreground">
            Loading notes...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-xs font-semibold text-red-400">
            Failed to load sticky notes.
          </div>
        ) : stickyNotes.length === 0 ? (
          <EmptyStickyNotes />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
            {stickyNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                lessonId={lessonId}
                onSeek={onSeek}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}