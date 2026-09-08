'use client';

import dynamic from 'next/dynamic';
import { ChartCardSkeleton } from '@/components/ui/Skeleton';

// recharts is loaded only when this chart actually mounts, and only once —
// keeping it out of every route's static bundle instead of duplicated per
// route (see PERFORMANCE_AUDIT.md Phase 5 / recommendation #6).
const StudentEngagement = dynamic(() => import('./StudentEngagement.chart'), {
  ssr: false,
  loading: () => <ChartCardSkeleton title="Loading Student Engagement" height="h-96" />,
});

export default StudentEngagement;
