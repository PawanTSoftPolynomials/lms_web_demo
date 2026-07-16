'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import ChartCard from '@/components/ui/ChartCard';
import CustomTooltip from './CustomTooltip';

export default function CoursePerformanceChart({ data }) {
  // Map our course list directly to Recharts
  const chartData = data?.map((c) => ({
    name: c.course,
    'Completion Rate (%)': c.completion,
    'Quiz Average (%)': c.quizAverage,
  })) ?? [];

  return (
    <ChartCard
      title="Course Performance Comparison"
      subtitle="Completion rates and average quiz scores across all courses"
      filter="All Courses"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              content={
                <CustomTooltip
                  titleKey="Course"
                  valueKey="Value"
                />
              }
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Bar
              dataKey="Completion Rate (%)"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar
              dataKey="Quiz Average (%)"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
