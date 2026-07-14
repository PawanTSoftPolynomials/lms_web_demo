'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import ChartCard from '@/components/ui/ChartCard';
import CustomTooltip from '@/components/charts/CustomTooltip';
import { ChartCardSkeleton } from '@/components/ui/Skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function PerformanceAnalytics({ courseId }) {
  const { data: analyticsData = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    select: (data) => data?.performanceAnalytics ?? [],
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (isLoading && analyticsData.length === 0) {
    return <ChartCardSkeleton title="Loading Performance Analytics" height="h-96" />;
  }

  if (isError) {
    return (
      <ChartCard title="Performance Analytics" subtitle="Overall learning performance">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="flex justify-center text-red-400">
            <AlertTriangle size={32} />
          </div>
          <h4 className="font-bold text-white text-sm">Failed to load Performance Analytics</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{error?.message || 'Error occurred while loading charts.'}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-650 rounded-lg transition"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </ChartCard>
    );
  }

  const isConceptMastery = courseId && courseId !== 'all';
  const metricKey = 'popularity';
  const labelKey = 'course';
  const title = isConceptMastery ? 'Concept Mastery Focus' : 'Course Popularity Overview';
  const subtitle = isConceptMastery
    ? 'Percentage of students who mastered each sub-concept'
    : 'How strongly each course is resonating with learners';
  const yLabel = isConceptMastery ? 'Mastery Score' : 'Popularity / Enrollments';

  const getColor = (value) => {
    if (value >= 90) return '#fb923c';
    if (value >= 80) return '#f59e0b';
    if (value >= 70) return '#38bdf8';
    return '#ef4444';
  };

  return (
    <ChartCard title={title} subtitle={subtitle} filter="This Quarter">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData}
            margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey={labelKey}
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              unit="%"
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
              }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  titleKey={!isConceptMastery ? 'Course' : 'Concept'}
                  valueKey={!isConceptMastery ? 'Popularity' : 'Mastery'}
                />
              }
              cursor={{ fill: 'rgba(249,115,22,0.08)' }}
            />
            <Bar
              dataKey={metricKey}
              radius={[10, 10, 0, 0]}
              maxBarSize={48}
              animationDuration={900}
            >
              {analyticsData.map((entry) => (
                <Cell
                  key={`${entry[labelKey]}-${entry[metricKey]}`}
                  fill={getColor(entry[metricKey])}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
