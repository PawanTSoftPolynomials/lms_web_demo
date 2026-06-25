"use client";

import { useEffect, useState } from "react";

import { getMyEnrollments } from "@/services/enrollment.service";

import { getProgress } from "@/services/progress.service";

import Loader from "@/components/common/Loader";

import DashboardHeader from "@/components/student/DashboardHeader";

import DashboardStats from "@/components/student/DashboardStats";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    progress: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) return;

      const enrollments = await getMyEnrollments(user.id);

      let completed = 0;
      let totalLessons = 0;

      for (const enrollment of enrollments) {
        const progressResponse = await getProgress(enrollment.courseId);

        completed += progressResponse.data.completedLessons;

        totalLessons += progressResponse.data.totalLessons;
      }

      const percentage =
        totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

      setStats({
        enrolled: enrollments.length,
        completed,
        progress: percentage,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />

      <DashboardStats stats={stats} />
    </div>
  );
}
