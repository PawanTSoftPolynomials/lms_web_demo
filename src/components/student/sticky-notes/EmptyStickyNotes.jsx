"use client";

export default function EmptyStickyNotes() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-12 text-center">
      <div className="mb-4 text-5xl">
        📝
      </div>

      <h3 className="text-lg font-semibold text-white">
        No Sticky Notes Yet
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Create your first sticky note while learning.
        Save important concepts, interview questions,
        or reminders for later.
      </p>
    </div>
  );
}