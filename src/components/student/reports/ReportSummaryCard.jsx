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
    <div className="flex items-center gap-2.5 rounded-xl border border-card-border bg-card px-3 py-2.5 hover:border-transparent transition-colors">
      <div className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-foreground">{title}</p>

        {primaryText && (
          <p className="text-[11px] text-foreground mt-0.5 truncate">{primaryText}</p>
        )}

        {secondaryText && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{secondaryText}</p>
        )}

        {typeof progress === "number" && (
          <div className="mt-1.5">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>

      {href && <ChevronRight size={14} className="shrink-0 text-muted-foreground" />}
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
