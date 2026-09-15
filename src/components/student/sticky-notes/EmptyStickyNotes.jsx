"use client";

export default function EmptyStickyNotes() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-transparent py-3 sm:py-8 text-center">
      <div className="mb-1.5 sm:mb-3 text-2xl sm:text-4xl">
        📝
      </div>

      <h3 className="text-xs sm:text-base font-bold text-foreground">
        No Sticky Notes Yet
      </h3>

      <p className="mt-1 max-w-xs sm:max-w-sm text-[11px] sm:text-xs leading-normal text-muted-foreground">
        Create your first sticky note while learning. Save important concepts, interview questions, or reminders for later.
      </p>
    </div>
  );
}