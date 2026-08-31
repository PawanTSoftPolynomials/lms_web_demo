'use client';

import { useStudentEngagement } from '@/hooks/queries/instructor/useInstructorDashboard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import ChartCard from '@/components/ui/ChartCard';
import { ChartCardSkeleton } from '@/components/ui/Skeleton';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function StudentEngagement({ courseId }) {
  const { data: dashboardData, isLoading, isError, refetch } = useStudentEngagement(courseId);

  if (isLoading && !dashboardData) {
    return <ChartCardSkeleton title="Loading Student Engagement" height="h-96" />;
  }

  if (isError) {
    return (
      <ChartCard title="Student Engagement" subtitle="Cohort activity footprint">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 h-96">
          <div className="flex justify-center text-red-400">
            <AlertTriangle size={24} />
          </div>
          <h4 className="font-bold text-foreground text-xs">Failed to load Student Engagement</h4>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-foreground bg-red-500 hover:bg-red-650 rounded-lg transition self-center"
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      </ChartCard>
    );
  }

  const engagement = dashboardData ?? [];

  // Scale data dynamically to display high-fidelity lines (0 to 1.5K range)
  const chartData = engagement.map((item) => {
    return {
      name: item.day,
      active: item.activeStudents ?? 0,
      lessons: item.lessonsCompleted ?? 0,
      quizzes: item.quizAttempts ?? 0,
    };
  });

  return (
    <ChartCard
      title="Student Engagement"
      subtitle="Detailed learner activity footprints"
      filter="This Week"
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                color: 'var(--popover-foreground)',
              }}
              itemStyle={{ fontSize: '11px' }}
              labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="active"
              name="Active Students"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 4, stroke: 'var(--primary)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="lessons"
              name="Course completed"
              stroke="var(--foreground)"
              strokeWidth={3}
              dot={{ r: 4, stroke: 'var(--foreground)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="quizzes"
              name="Quiz Attempts"
              stroke="var(--secondary)"
              strokeWidth={3}
              dot={{ r: 4, stroke: 'var(--secondary)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
