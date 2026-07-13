"use client";

import CreateStickyNoteForm from "./CreateStickyNoteForm";
import EmptyStickyNotes from "./EmptyStickyNotes";
import StickyNoteCard from "./StickyNoteCard";

import { useStickyNotes } from "@/hooks/queries/student/useStickyNotes";

export default function StickyNotesPanel({
  lessonId,
  currentTimestamp = 0
}) {
  const {
    data: stickyNotes = [],
    isLoading,
    isError
  } = useStickyNotes(lessonId);

  if (!lessonId) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Sticky Notes
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Save important points while
            learning.
          </p>
        </div>
      </div>

      <CreateStickyNoteForm
        lessonId={lessonId}
        currentTimestamp={
          currentTimestamp
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            Loading sticky notes...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-sm text-red-400">
            Failed to load sticky notes.
          </div>
        ) : stickyNotes.length === 0 ? (
          <EmptyStickyNotes />
        ) : (
          <div className="space-y-4">
            {stickyNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                lessonId={lessonId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}