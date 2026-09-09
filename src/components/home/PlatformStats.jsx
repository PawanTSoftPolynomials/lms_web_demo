"use client";

import { Users, BookOpen, Award } from "lucide-react";
import { useLandingData } from "@/hooks/queries/useLandingData";

const STAT_ITEMS = [
  { key: "students", label: "Active Learners", icon: Users },
  { key: "courses", label: "Published Courses", icon: BookOpen },
  { key: "certificates", label: "Certificates Earned", icon: Award },
];

export default function PlatformStats() {
  const { data, isLoading, isError } = useLandingData();

  if (isLoading) {
    return (
      <div className="py-6 border-y border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {STAT_ITEMS.map((item) => (
            <div key={item.key} className="h-10 animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.stats) {
    return null;
  }

  const { stats } = data;

  return (
    <section className="py-6 border-y border-border my-6">
      <h2 className="sr-only">Platform Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {STAT_ITEMS.map((item) => {
          const Icon = item.icon;
          const val = Number(stats[item.key] ?? 0);
          return (
            <div key={item.key} className="flex items-center justify-center gap-3 py-3 sm:py-0 px-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-xl sm:text-2xl font-black text-foreground">
                  {val.toLocaleString("en-IN")}+
                </p>
                <p className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
