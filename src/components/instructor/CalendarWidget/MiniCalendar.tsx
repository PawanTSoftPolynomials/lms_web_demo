"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { cn } from "@/lib/utils";
import type { CalendarHighlight } from "@/types/instructor-dashboard";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const TYPE_DOT: Record<CalendarHighlight["type"], string> = {
  class: "bg-sky-500",
  deadline: "bg-amber-500",
  live: "bg-destructive",
  meeting: "bg-violet-500",
};

const TYPE_LABEL: Record<CalendarHighlight["type"], string> = {
  class: "Class",
  deadline: "Deadline",
  live: "Live session",
  meeting: "Meeting",
};

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

interface MiniCalendarProps {
  highlights?: CalendarHighlight[];
}

export function MiniCalendar({ highlights = [] }: MiniCalendarProps) {
  const [cursor, setCursor] = useState(() => new Date());
  const todayISO = toISODate(new Date());

  const highlightsByDate = useMemo(() => {
    const map = new Map<string, CalendarHighlight["type"][]>();
    highlights.forEach((h) => {
      const existing = map.get(h.date) ?? [];
      if (!existing.includes(h.type)) existing.push(h.type);
      map.set(h.date, existing);
    });
    return map;
  }, [highlights]);

  const { weeks, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeksArr: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeksArr.push(cells.slice(i, i + 7));

    return {
      weeks: weeksArr,
      monthLabel: firstDay.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mini Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <p className="text-xs font-bold text-foreground">{monthLabel}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="flex size-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((wd, idx) => (
            <span key={idx} className="text-[9.5px] font-bold text-muted-foreground/70">
              {wd}
            </span>
          ))}
          {weeks.flatMap((week, wIdx) =>
            week.map((day, dIdx) => {
              if (!day) return <span key={`${wIdx}-${dIdx}`} />;
              const iso = toISODate(day);
              const types = highlightsByDate.get(iso) ?? [];
              const isToday = iso === todayISO;
              return (
                <div key={`${wIdx}-${dIdx}`} className="flex flex-col items-center gap-0.5 py-1">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-[10.5px] font-semibold",
                      isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground"
                    )}
                    title={types.map((t) => TYPE_LABEL[t]).join(", ")}
                  >
                    {day.getDate()}
                  </span>
                  <span className="flex gap-0.5 h-1">
                    {types.slice(0, 3).map((t) => (
                      <span key={t} className={cn("size-1 rounded-full", TYPE_DOT[t])} />
                    ))}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-card-border pt-3">
          {(Object.keys(TYPE_LABEL) as CalendarHighlight["type"][]).map((type) => (
            <span key={type} className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", TYPE_DOT[type])} />
              {TYPE_LABEL[type]}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
