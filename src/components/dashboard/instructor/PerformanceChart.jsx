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
          stroke="rgba(140, 111, 61, 0.12)"
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="month"
          tick={{
            fill: "#66625B",
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fill: "#66625B",
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
            color: "#F4EFE6",
            paddingBottom: 20,
          }}
        />

        <Line
          type="monotone"
          dataKey="students"
          name="Students"
          stroke="#DFBA73"
          strokeWidth={3}
          animationDuration={1200}
          dot={{
            r: 4,
            fill: "#DFBA73",
          }}
          activeDot={{
            r: 6,
          }}
        />

        <Line
          type="monotone"
          dataKey="quizzes"
          name="Quizzes"
          stroke="#C5A059"
          strokeWidth={3}
          animationDuration={1200}
          dot={{
            r: 4,
            fill: "#C5A059",
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}