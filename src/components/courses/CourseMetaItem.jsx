"use client";

export default function CourseMetaItem({ icon: Icon, text }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
      <Icon size={14} className="text-purple-400 shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}
