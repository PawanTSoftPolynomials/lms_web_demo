"use client";

export default function OnlineBadge({
  online,
}) {
  return (
    <span
      className={`
      absolute
      bottom-0
      right-0

      h-3.5
      w-3.5

      rounded-full

      border-2
      border-slate-900

      ${
        online
          ? "bg-green-500"
          : "bg-slate-500"
      }
      `}
    />
  );
}