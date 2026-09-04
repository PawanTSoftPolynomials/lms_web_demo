"use client";

import { useParams } from "next/navigation";
import { Users, BookOpen, ClipboardList, HelpCircle, Video, Calendar } from "lucide-react";

import { useBatchDashboard } from "@/hooks/queries/student/useBatches";
import { formatShortDate } from "@/lib/dateUtils";

function StatTile({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
      <div className={`p-2 rounded-xl ${bg} shrink-0`}>
        <Icon size={16} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black text-foreground leading-none">{value}</p>
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function BatchOverviewPage() {
  const params = useParams();
  const { data: dashboard, isLoading } = useBatchDashboard(params.batchId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!dashboard) return null;

  const lessonsCount = dashboard.course?.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;
  const quizzesCount = dashboard.course?.quizzes?.length ?? 0;
  const assignmentsCount = dashboard.course?.assignments?.length ?? 0;
  const startedLabel = formatShortDate(dashboard.startDate, "—");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={Users} label="Classmates" value={dashboard.students?.length ?? 0} color="text-purple-400" bg="bg-purple-500/10" />
        <StatTile icon={BookOpen} label="Lessons" value={lessonsCount} color="text-blue-400" bg="bg-blue-500/10" />
        <StatTile icon={HelpCircle} label="Quizzes" value={quizzesCount} color="text-primary" bg="bg-primary/10" />
        <StatTile icon={ClipboardList} label="Assignments" value={assignmentsCount} color="text-amber-400" bg="bg-amber-500/10" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-xs font-black text-foreground mb-3">Batch Details</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={14} className="text-muted-foreground shrink-0" />
            Started {startedLabel}
          </div>
          {dashboard.startTime && dashboard.endTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              {dashboard.startTime} - {dashboard.endTime}
            </div>
          )}
          {dashboard.meetingLink && (
            <a
              href={dashboard.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-primary hover:text-orange-300 transition"
            >
              <Video size={14} className="shrink-0" /> Meeting link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
