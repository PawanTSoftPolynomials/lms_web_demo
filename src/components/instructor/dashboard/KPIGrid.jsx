'use client';

import { useQuery } from '@tanstack/react-query';
import { getInstructorDashboard } from '@/services/dashboard.service';
import KPICard from '@/components/instructor/dashboard/KPICard';
import { KPICardSkeleton } from '@/components/ui/Skeleton';
import { Users, GraduationCap, TrendingUp, ClipboardCheck, Star, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';

const iconMap = {
  Users,
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
  Star,
  BookOpen
};

// SVG paths for mini sparklines
const sparklines = {
  active: 'M0,25 Q15,5 30,20 T60,5 T90,22 T120,5',
  enrollments: 'M0,20 Q15,25 30,10 T60,18 T90,5 T120,8',
  completion: 'M0,25 Q15,15 30,22 T60,12 T90,18 T120,5',
  quizzes: 'M0,18 Q15,22 30,8 T60,15 T90,12 T120,5',
  ratings: 'M0,25 Q15,10 30,20 T60,8 T90,15 T120,5',
  published: 'M0,22 Q15,18 30,15 T60,20 T90,18 T120,12'
};

const cardConfigs = {
  'Active Learners': {
    icon: Users,
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-400',
    sparklineColor: '#a855f7',
    sparklinePath: sparklines.active,
  },
  'Total Enrollments': {
    icon: GraduationCap,
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    sparklineColor: '#3b82f6',
    sparklinePath: sparklines.enrollments,
  },
  'Avg. Course Completion': {
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    sparklineColor: '#10b981',
    sparklinePath: sparklines.completion,
  },
  'Avg. Quiz Score': {
    icon: ClipboardCheck,
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    iconColor: 'text-orange-400',
    sparklineColor: '#f97316',
    sparklinePath: sparklines.quizzes,
  },
  'Avg. Course Rating': {
    icon: Star,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    sparklineColor: '#f59e0b',
    sparklinePath: sparklines.ratings,
  },
  'Published Courses': {
    icon: BookOpen,
    iconBg: 'bg-pink-500/10 border-pink-500/20',
    iconColor: 'text-pink-400',
    sparklineColor: '#ec4899',
    sparklinePath: sparklines.published,
  }
};

export default function KPIGrid({ courseId }) {
  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['instructorDashboard', courseId],
    queryFn: () => getInstructorDashboard(courseId),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  if (isLoading && !dashboardData) {
    return (
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <KPICardSkeleton key={idx} />
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-4">
        <div className="flex justify-center text-red-400">
          <AlertTriangle size={32} className="animate-pulse" />
        </div>
        <h4 className="font-bold text-white text-sm">Failed to load KPIs</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error?.message || 'Error occurred while loading dashboard statistics.'}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    );
  }

  const kpis = dashboardData?.kpis ?? [];
  const courses = dashboardData?.coursePerformance ?? [];

  // Parse total published courses dynamically
  const publishedCount = courses.filter(c => c.status === 'Published' || c.completion > 0).length || courses.length || 18;

  // Render 6 KPI cards
  const items = [
    ...kpis.map((kpi) => {
      const config = cardConfigs[kpi.title] || {
        icon: Users,
        iconBg: 'bg-slate-500/10 border-slate-500/20',
        iconColor: 'text-slate-400',
        sparklineColor: '#94a3b8',
        sparklinePath: sparklines.active,
      };
      return {
        ...kpi,
        ...config,
      };
    }),
    {
      id: 'published-courses',
      title: 'Published Courses',
      value: publishedCount,
      trend: 0,
      trendLabel: 'vs last 7 days',
      ...cardConfigs['Published Courses']
    }
  ];

  // Make sure we limit to maximum of 6 elements
  const displayItems = items.slice(0, 6);

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {displayItems.map((item) => (
        <KPICard 
          key={item.id} 
          {...item} 
        />
      ))}
    </section>
  );
}
