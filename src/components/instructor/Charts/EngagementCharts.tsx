"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { cn } from "@/lib/utils";
import type { EngagementSeriesPoint } from "@/types/instructor-dashboard";

interface MetricConfig {
  key: keyof Omit<EngagementSeriesPoint, "label">;
  title: string;
  format: (v: number) => string;
  light: string;
  dark: string;
}

const METRICS: MetricConfig[] = [
  { key: "dailyActiveStudents", title: "Daily Active Students", format: (v) => `${v}`, light: "#2a78d6", dark: "#3987e5" },
  { key: "quizParticipation", title: "Quiz Participation", format: (v) => `${v}%`, light: "#1baf7a", dark: "#199e70" },
  { key: "lessonCompletion", title: "Lesson Completion", format: (v) => `${v}%`, light: "#4a3aa7", dark: "#9085e9" },
  { key: "watchTimeMinutes", title: "Watch Time", format: (v) => `${Math.round(v / 60)}h ${v % 60}m`, light: "#e87ba4", dark: "#d55181" },
];

function MetricTile({ config, data }: { config: MetricConfig; data: EngagementSeriesPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const color = isDark ? config.dark : config.light;
  const gridColor = isDark ? "#2c2c2a" : "#e1e0d9";
  const inkMuted = isDark ? "#8b8fae" : "#6b6b8a";

  const current = data[data.length - 1]?.[config.key] ?? 0;
  const previous = data[0]?.[config.key] ?? 0;
  const deltaPct = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
  const isUp = deltaPct >= 0;

  const gradientId = `metric-gradient-${config.key}`;

  return (
    <div className="rounded-xl border border-card-border bg-surface-muted/40 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground leading-tight">
          {config.title}
        </p>
        <span
          className={cn(
            "text-[10px] font-bold shrink-0",
            isUp ? "text-success" : "text-destructive"
          )}
        >
          {isUp ? "+" : ""}
          {deltaPct}%
        </span>
      </div>
      <p className="mt-1 text-xl font-bold text-foreground">{config.format(Number(current))}</p>
      <div className="h-16 -ml-2 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" hide />
            <Tooltip
              cursor={{ stroke: gridColor, strokeWidth: 1 }}
              contentStyle={{
                background: isDark ? "#0d1021" : "#ffffff",
                border: `1px solid ${isDark ? "#1a1f35" : "#e7e7f1"}`,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? "#f1f1f5" : "#131321",
                padding: "6px 10px",
              }}
              labelStyle={{ color: inkMuted, fontSize: 10, marginBottom: 2 }}
              formatter={(value) => [config.format(Number(value)), config.title]}
            />
            <Area
              type="monotone"
              dataKey={config.key}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, fill: color, stroke: isDark ? "#0d1021" : "#ffffff", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface EngagementChartsProps {
  data?: EngagementSeriesPoint[];
  isLoading?: boolean;
}

export function EngagementCharts({ data, isLoading }: EngagementChartsProps) {
  const points = useMemo(() => data ?? [], [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Engagement</CardTitle>
        <span className="text-[10px] font-semibold text-muted-foreground">Last 7 days</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading || points.length === 0
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[124px] rounded-xl" />
            ))
          : METRICS.map((config) => (
              <MetricTile key={config.key} config={config} data={points} />
            ))}
      </CardContent>
    </Card>
  );
}
