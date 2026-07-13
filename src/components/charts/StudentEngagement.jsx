'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import ChartCard from '@/components/ui/ChartCard';
import CustomTooltip from './CustomTooltip';

export default function StudentEngagement({ role, data }) {
  const isAuthor = role === 'course-author';
  const enrollmentData = data?.enrollmentTrends ?? [];

  return (
    <ChartCard
      title="Enrollment Trends"
      subtitle={
        isAuthor
          ? 'Monthly authored course enrollment momentum'
          : 'Monthly active cohort size growth'
      }
      filter="Last 6 Months"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={enrollmentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="enrollmentGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  titleKey="Month"
                  valueKey="Enrollments"
                />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="enrollments"
              name="Total Enrolled"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#enrollmentGlow)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
