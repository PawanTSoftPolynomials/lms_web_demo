"use client";

import { UserPlus, Layers, BookOpenCheck, Award } from "lucide-react";

export function TodaySnapshot({ snapshot, isLoading }) {
  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted/50 rounded-2xl"></div>;
  }

  const {
    newUsersToday = 0,
    newEnrollmentsToday = 0,
    coursesPublishedToday = 0,
    certificatesIssuedToday = 0,
  } = snapshot ?? {};

  const items = [
    { label: "New Users", value: newUsersToday, icon: UserPlus, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "New Enrollments", value: newEnrollmentsToday, icon: Layers, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Courses Published", value: coursesPublishedToday, icon: BookOpenCheck, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { label: "Certificates Issued", value: certificatesIssuedToday, icon: Award, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <h3 className="text-sm font-black text-foreground">Today&apos;s Snapshot</h3>
        <span className="text-[9px] text-muted-foreground font-bold">
          {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl border ${item.border} ${item.bg} p-3`}>
            <item.icon size={14} className={item.color} />
            <p className="text-lg font-black text-foreground leading-none mt-2">{item.value}</p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
