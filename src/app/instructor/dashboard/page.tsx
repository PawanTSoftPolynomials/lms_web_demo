"use client";

import { TooltipProvider } from "@/components/ui/shadcn/tooltip";
import { InstructorHeader } from "@/components/instructor/Header/InstructorHeader";
import { StatsGrid } from "@/components/instructor/StatsCard/StatsGrid";
import { ActivityTimeline } from "@/components/instructor/ActivityTimeline/ActivityTimeline";
import { ContinueEditingCard } from "@/components/instructor/ContinueEditing/ContinueEditingCard";
import { NeedsAttentionList } from "@/components/instructor/NeedsAttention/NeedsAttentionList";
import { TodaysSchedule } from "@/components/instructor/ScheduleCard/TodaysSchedule";
import useAuth from "@/hooks/useAuth";
import {
  useContinueEditing,
  useDashboardStats,
  useNeedsAttention,
  useRecentActivities,
  useUpcomingClasses,
} from "@/hooks/queries/instructor/useDashboardHome";

/**
 * Home is a daily productivity workspace, not a second analytics dashboard:
 * it answers "what needs my attention today, what should I continue, and
 * what's happening today" — nothing more. Course-level performance
 * (completion rate, quiz/review averages, ratings) intentionally lives in
 * Course Cards and Analytics instead of here. Notifications live in the
 * top-nav bell, not as a duplicate panel on this page.
 */
export default function InstructorDashboardHomePage() {
  const { user } = useAuth();

  const stats = useDashboardStats();
  const continueEditing = useContinueEditing();
  const needsAttention = useNeedsAttention();
  const schedule = useUpcomingClasses();
  const activities = useRecentActivities();

  return (
    <TooltipProvider>
      <div className="-m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-background p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex flex-col gap-5 max-w-[1600px] mx-auto">
          <InstructorHeader instructorName={user?.name || "Instructor"} />

          <StatsGrid stats={stats.data} isLoading={stats.isLoading} />

          <ContinueEditingCard item={continueEditing.data} isLoading={continueEditing.isLoading} />

          <NeedsAttentionList items={needsAttention.data} isLoading={needsAttention.isLoading} />

          <TodaysSchedule events={schedule.data?.today} isLoading={schedule.isLoading} />

          <ActivityTimeline activities={activities.data} isLoading={activities.isLoading} />
        </div>
      </div>
    </TooltipProvider>
  );
}
