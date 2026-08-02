"use client";

import useAuth from "@/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/shadcn/tooltip";

import { WelcomeHeroCard } from "@/components/instructor/dashboard/WelcomeHeroCard";
import { InstructorKPIs } from "@/components/instructor/dashboard/InstructorKPIs";
import { CourseOverviewTable } from "@/components/instructor/dashboard/CourseOverviewTable";
import { RecentSubmissionsList } from "@/components/instructor/dashboard/RecentSubmissionsList";
import { PerformancePieChart } from "@/components/instructor/dashboard/PerformancePieChart";
import { UpcomingEventsPanel } from "@/components/instructor/dashboard/UpcomingEventsPanel";
import { DashboardCalendarWidget } from "@/components/instructor/dashboard/DashboardCalendarWidget";
import { RecentActivitiesSidebar } from "@/components/instructor/dashboard/RecentActivitiesSidebar";

import {
  useDashboardStats,
  useUpcomingClasses,
  useRecentActivities,
  useCourseProgressOverview,
  useRecentSubmissions,
  useGradeDistribution,
  useEngagementAnalytics,
} from "@/hooks/queries/instructor/useDashboardHome";

export default function InstructorDashboardHomePage() {
  const { user } = useAuth();

  // Data fetching
  const stats = useDashboardStats();
  const schedule = useUpcomingClasses();
  const activities = useRecentActivities();
  const courses = useCourseProgressOverview();
  const submissions = useRecentSubmissions();
  const grades = useGradeDistribution();
  const engagement = useEngagementAnalytics();

  // Extract needed KPIs from the stats payload
  const activeCourses = stats.data?.find(s => s.id === "active-courses")?.value || 0;
  const totalStudents = stats.data?.find(s => s.id === "students")?.value || 0;
  const pendingReviews = stats.data?.find(s => s.id === "pending-reviews")?.value || 0;
  
  // We can use engagement hook to extract summary data safely without re-fetching
  const { data: engagementData } = useEngagementAnalytics();
  
  // Using active quizzes and completion rate from the summary API if available, else defaulting
  // Since we don't expose summary directly here, we can extract it from useRawQuizzes, but we don't have it directly. 
  // Let's use the quizzes count directly from our imported hooks if we have one, or just default to 0 to be truly dynamic.
  // We don't have useRawQuizzes exposed here, but we can just use 0 and let it be if it's not in stats.
  // Actually, wait, let's just add quizzes to deriveDashboardStats or use a fallback if not found.
  const activeQuizzes = stats.data?.find(s => s.id === "active-quizzes")?.value || 0;
  
  // We don't have engagement percentage in `stats.data` by default. We'll use 0 or calculate it.
  const avgEngagement = engagementData && engagementData.length > 0 
    ? Math.round(engagementData.reduce((acc, point) => acc + (point.lessonCompletion || 0), 0) / engagementData.length)
    : 0;

  return (
    <TooltipProvider>
      <div className="-m-3 sm:-m-6 min-h-[calc(100vh-3.5rem)] bg-[#080B11] p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex flex-col max-w-[1600px] mx-auto">
          
          <div className="mt-4 mb-2">
            <InstructorKPIs 
              coursesCount={Number(activeCourses)}
              studentsCount={Number(totalStudents)}
              pendingAssignments={Number(pendingReviews)}
              activeQuizzes={Number(activeQuizzes)}
              engagementPercentage={Number(avgEngagement)}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
            {/* Left Main Column (occupies 8/12 on large screens) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              <WelcomeHeroCard instructorName={user?.name || "Instructor"} />
              
              <CourseOverviewTable 
                courses={courses.data} 
                isLoading={courses.isLoading} 
              />

              {/* Bottom Row inside Main Column */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentSubmissionsList 
                  submissions={submissions.data} 
                  isLoading={submissions.isLoading} 
                />
                <PerformancePieChart 
                  data={grades.data} 
                  isLoading={grades.isLoading} 
                />
              </div>
            </div>

            {/* Right Sidebar Column (occupies 4/12 on large screens) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <UpcomingEventsPanel 
                events={schedule.data?.today || []} 
                isLoading={schedule.isLoading} 
              />
              
              <DashboardCalendarWidget />

              <RecentActivitiesSidebar 
                activities={activities.data || []} 
                isLoading={activities.isLoading} 
              />
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}

