"use client";

import { useParams } from "next/navigation";
import { Megaphone } from "lucide-react";

import { useBatchAnnouncements } from "@/hooks/queries/student/useBatches";
import { formatShortDate } from "@/lib/dateUtils";

export default function BatchAnnouncementsPage() {
  const params = useParams();
  const { data: announcements = [], isLoading } = useBatchAnnouncements(params.batchId);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
        No announcements posted for this batch yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {announcements.map((a) => (
        <div key={a.id} className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Megaphone size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{a.title}</p>
            {a.message && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.message}</p>}
            <p className="text-[10px] text-muted-foreground mt-1.5">{formatShortDate(a.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
