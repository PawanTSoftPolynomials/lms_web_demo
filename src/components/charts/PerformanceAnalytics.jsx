'use client';

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
import CustomTooltip from './CustomTooltip';

export default function PerformanceAnalytics({ role, data }) {
  const isAuthor = role === 'course-author';
  const metricKey = isAuthor ? 'popularity' : 'mastery';
  const labelKey = isAuthor ? 'course' : 'concept';
  const title = isAuthor ? 'Course Popularity' : 'Concept Mastery Overview';
  const subtitle = isAuthor
    ? 'How strongly each authored course is resonating with learners'
    : 'Percentage of students who mastered each concept';
  const yLabel = isAuthor ? 'Popularity' : 'Concept Mastery';
  const getColor = (value) => {
    if (value >= 90) return '#fb923c';
    if (value >= 80) return '#f59e0b';
    if (value >= 70) return '#38bdf8';
    return '#ef4444';
  };

  return (
    <ChartCard title={title} subtitle={subtitle} filter="This Quarter">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
              tick={{ fill: '#94a3b8', fontSize: 12 }}
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
                  titleKey={isAuthor ? 'Course' : 'Concept'}
                  valueKey={isAuthor ? 'Popularity' : 'Mastery'}
                />
              }
              cursor={{ fill: 'rgba(249,115,22,0.08)' }}
            />
            <Bar
              dataKey={metricKey}
              radius={[10, 10, 0, 0]}
              animationDuration={900}
            >
              {data.map((entry) => (
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
