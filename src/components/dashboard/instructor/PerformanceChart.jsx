"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import ChartTooltip from "@/components/dashboard/components/ChartTooltip";
import ChartEmptyState from "@/components/dashboard/components/ChartEmptyState";

export default function PerformanceChart({ data = [] }) {
  if (!data.length) {
    return <ChartEmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
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
          dataKey="month"
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

        <Legend
          verticalAlign="top"
          align="right"
          wrapperStyle={{
            color: "#cbd5e1",
            paddingBottom: 20,
          }}
        />

        <Line
          type="monotone"
          dataKey="students"
          name="Students"
          stroke="#f97316"
          strokeWidth={3}
          animationDuration={1200}
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
          dataKey="quizzes"
          name="Quizzes"
          stroke="#3b82f6"
          strokeWidth={3}
          animationDuration={1200}
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
  );
}