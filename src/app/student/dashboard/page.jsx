"use client";


import { getMyEnrollments } from "@/services/enrollment.service";
import { getProgress } from "@/services/progress.service";

import Loader from "@/components/common/Loader";
import DashboardHeader from "@/components/student/DashboardHeader";
import DashboardStats from "@/components/student/DashboardStats";
import useAuth from "@/hooks/useAuth";
import useDashboard from "@/hooks/queries/student/useDashboard";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useDashboard(user?.id);
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />
      <DashboardStats
        stats={
          stats || {
            enrolled: 0,
            completed: 0,
            progress: 0,
          }
        }
      />
    </div>
  );
}
