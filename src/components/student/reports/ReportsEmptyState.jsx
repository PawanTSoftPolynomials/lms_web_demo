import Link from "next/link";
import { GraduationCap, BarChart3, HelpCircle, ClipboardList, Medal } from "lucide-react";

const PREVIEW_ITEMS = [
  { label: "Progress", icon: BarChart3 },
  { label: "Quiz reports", icon: HelpCircle },
  { label: "Assignments", icon: ClipboardList },
  { label: "Certificates", icon: Medal },
];

export default function ReportsEmptyState() {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-6 text-center">
      <div className="mx-auto h-11 w-11 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
        <GraduationCap size={20} />
      </div>

      <h3 className="mt-3 text-sm font-bold text-white">
        You haven&apos;t enrolled in any course yet.
      </h3>
      <p className="mt-1 text-xs text-slate-400">Start learning to view:</p>

      <div className="mt-4 grid grid-cols-2 gap-2 max-w-xs mx-auto">
        {PREVIEW_ITEMS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-card-border bg-slate-950/40 px-3 py-2 text-[11px] font-semibold text-slate-300"
          >
            <Icon size={13} className="text-orange-500 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>

      <Link
        href="/student/courses"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider px-5 py-2.5 transition cursor-pointer"
      >
        Browse Courses
      </Link>
    </div>
  );
}
