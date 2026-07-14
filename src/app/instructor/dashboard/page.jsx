'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import DashboardHeader from '@/components/instructor/dashboard/DashboardHeader';
import CourseFilter from '@/components/instructor/dashboard/CourseFilter';
import KPIGrid from '@/components/instructor/dashboard/KPIGrid';
import RecommendedActions from '@/components/instructor/dashboard/RecommendedActions';
import ActionCenter from '@/components/instructor/dashboard/ActionCenter';
import StudentEngagement from '@/components/instructor/dashboard/StudentEngagement';
import CoursePerformance from '@/components/instructor/dashboard/CoursePerformance';
import QuickActions from '@/components/instructor/dashboard/QuickActions';
import RecentActivity from '@/components/instructor/dashboard/RecentActivity';
import MiniCalendar from '@/components/dashboard/MiniCalendar';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      
      {/* 1. Header Banner & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <DashboardHeader name={user?.name ?? 'Dr. Sarah Johnson'} />
        <CourseFilter selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
      </div>

      {/* 2. Horizontal Quick Actions Toolbar (Now at the top of the page) */}
      <QuickActions />

      {/* 3. Executive KPI Cards Row (6 Columns) */}
      <KPIGrid courseId={selectedCourse} />

      {/* 4. Middle Cards Row: Recommended Actions (1/3) + Action Center (1/3) + Calendar (1/3) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="min-h-[290px]">
          <RecommendedActions courseId={selectedCourse} />
        </div>
        <div className="min-h-[290px]">
          <ActionCenter courseId={selectedCourse} />
        </div>
        <div className="min-h-[290px]">
          <MiniCalendar role="INSTRUCTOR" />
        </div>
      </div>

      {/* 5. Cohort Insights: Full-Width Student Engagement Line Chart */}
      <div className="grid gap-6">
        <StudentEngagement courseId={selectedCourse} />
      </div>

      {/* 6. Bottom Row: Course Performance table (3/5 width) next to Recent Activity timeline (2/5 width) */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CoursePerformance courseId={selectedCourse} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity courseId={selectedCourse} />
        </div>
      </div>

    </div>
  );
}