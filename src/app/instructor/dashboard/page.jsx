'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  ChevronDown,
  Loader2
} from 'lucide-react';

import { getInstructorDashboard } from '@/services/dashboard.service';

import ActionCenter from '@/components/sections/ActionCenter';
import KPIGrid from '@/components/sections/KPIGrid';
import PerformanceAnalytics from '@/components/charts/PerformanceAnalytics';
import StudentEngagement from '@/components/charts/StudentEngagement';
import CoursePerformance from '@/components/tables/CoursePerformance';
import ConceptMastery from '@/components/tables/ConceptMastery';
import RecommendedActions from '@/components/actions/RecommendedActions';

const iconMap = {
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar
};

// Simple card layout helper for teaching calendar
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition hover:border-slate-700/60 ${className}`}>
      {children}
    </div>
  );
}

export default function InstructorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await getInstructorDashboard(selectedCourse);
        setDashboardData(res);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err.message || 'Failed to fetch instructor dashboard analytics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedCourse]);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Instructor Dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-white">Connection Error</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          {error || 'Unable to retrieve records from the API server. Please check backend configuration.'}
        </p>
        <button
          onClick={() => setSelectedCourse(selectedCourse)} // triggers reload
          className="mt-6 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Map icon strings to Lucide components
  const mappedKpis = (dashboardData.kpis ?? []).map(kpi => ({
    ...kpi,
    icon: iconMap[kpi.icon] || Users
  }));

  const mappedPriorities = (dashboardData.priorities ?? []).map(priority => ({
    ...priority,
    icon: iconMap[priority.icon] || Sparkles
  }));

  const processedData = {
    ...dashboardData,
    kpis: mappedKpis,
    priorities: mappedPriorities
  };

  // Convert daily engagement stats (Sun-Sat) to match the monthly trend component's format
  const enrollmentTrends = (processedData.studentEngagement ?? []).map(item => ({
    month: item.day,
    enrollments: item.activeStudents
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Today's Summary Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today&apos;s Summary
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
              {processedData.summary?.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Filter Dropdown Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Course Focus</h2>
          <p className="text-xs text-slate-400">
            Filter your dashboard metrics by a specific course
          </p>
        </div>
        <div className="relative">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-56 appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-10 text-sm font-medium text-slate-200 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="all">All Courses</option>
            {dashboardData.courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Action Center Grid */}
      <ActionCenter data={processedData} role="instructor" />

      {/* KPIs Grid */}
      <KPIGrid data={processedData} />

      {/* Charts Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        <PerformanceAnalytics data={processedData.performanceAnalytics} />
        <StudentEngagement data={{ enrollmentTrends }} role="instructor" />
      </div>

      {/* Tables & Teaching Schedule Section */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CoursePerformance data={processedData.coursePerformance} />
        </div>
        
        {/* Teaching Calendar schedule card */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-bold pl-1">Teaching Schedule</h3>
          <Card className="flex flex-col justify-between h-[300px]">
            <div className="space-y-3 overflow-y-auto pr-1">
              {processedData.schedule?.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-slate-805 pb-2 last:border-0 last:pb-0">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Calendar size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{slot.topic}</p>
                    <p className="text-[10px] text-slate-400">
                      {slot.day} &bull; {slot.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 font-medium flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Calendar Synced
            </div>
          </Card>
        </div>
      </div>

      {/* Concept Mastery & Recommended Remediation */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ConceptMastery data={processedData.conceptMastery} role="instructor" />
        <RecommendedActions data={processedData.recommendedActions} role="instructor" />
      </div>
    </div>
  );
}