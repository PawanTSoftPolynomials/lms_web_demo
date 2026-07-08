"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import DashboardChart from "@/components/dashboard/common/DashboardChart";
import ChartTooltip from "@/components/dashboard/components/ChartTooltip";

const DEFAULT_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444"];

export default function DoughnutChartCard({
  title,
  subtitle,
  data = [],
  dataKey = "value",
  nameKey = "name",
  colors = DEFAULT_COLORS,
  height = 300,
}) {
  return (
    <DashboardChart title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>

          <Tooltip content={<ChartTooltip />} />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </DashboardChart>
  );
}
