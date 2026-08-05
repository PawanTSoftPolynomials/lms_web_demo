import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProgressBar from "@/components/student/courses/ProgressBar";

export default function ReportSummaryCard({
  icon: Icon,
  title,
  primaryText,
  secondaryText,
  progress,
  href,
}) {
  const body = (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2.5 hover:border-slate-700 transition-colors">
      <div className="shrink-0 h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white">{title}</p>

        {primaryText && (
          <p className="text-[11px] text-slate-300 mt-0.5 truncate">{primaryText}</p>
        )}

        {secondaryText && (
          <p className="text-[10px] text-slate-500 mt-0.5">{secondaryText}</p>
        )}

        {typeof progress === "number" && (
          <div className="mt-1.5">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>

      {href && <ChevronRight size={14} className="shrink-0 text-slate-500" />}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {body}
      </Link>
    );
  }

  return body;
}
