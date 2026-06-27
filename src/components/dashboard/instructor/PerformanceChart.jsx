"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import DashboardChart from "@/components/dashboard/common/DashboardChart";
import ChartTooltip from "@/components/dashboard/components/ChartTooltip";
import ChartEmptyState from "@/components/dashboard/components/ChartEmptyState";

export default function PerformanceChart({
  data = [],
  title = "Performance Overview",
  subtitle = "Last 30 Days",
}) {
  if (!data.length) {
    return (
      <DashboardChart title={title} subtitle={subtitle}>
        <ChartEmptyState />
      </DashboardChart>
    );
  }

  return (
    <DashboardChart title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="#334155"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<ChartTooltip />} />

          <Line
            type="monotone"
            dataKey="students"
            name="Students"
            stroke="#f97316"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#f97316",
            }}
            activeDot={{
              r: 6,
            }}
          />

          <Line
            type="monotone"
            dataKey="courses"
            name="Courses"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#3b82f6",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </DashboardChart>
  );
}
