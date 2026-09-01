"use client";

import { Users, BookOpen, Award } from "lucide-react";

import { useLandingData } from "@/hooks/queries/useLandingData";

const STAT_ITEMS = [
  { key: "students", label: "Students Learning", icon: Users },
  { key: "courses", label: "Published Courses", icon: BookOpen },
  { key: "certificates", label: "Certificates Earned", icon: Award },
];

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 border-y border-border py-6 sm:grid-cols-3 sm:gap-4">
      {STAT_ITEMS.map((item) => (
        <div key={item.key} className="flex items-center justify-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-6 w-16 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlatformStats() {
  const { data, isLoading, isError } = useLandingData();

  if (isLoading) {
    return (
      <section className="pb-4">
        <StatsSkeleton />
      </section>
    );
  }

  // No fabricated numbers: if real stats aren't available, the section
  // simply doesn't render rather than showing placeholder/fake data.
  if (isError || !data?.stats) {
    return null;
  }

  const { stats } = data;

  return (
    <section className="pb-4">
      <h2 className="sr-only">Orange Tree LMS in numbers</h2>
      <div className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {STAT_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-center gap-3 py-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon size={17} />
            </span>
            <div>
              <p className="text-2xl font-black text-foreground sm:text-3xl">
                {Number(stats[item.key] ?? 0).toLocaleString("en-IN")}+
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
