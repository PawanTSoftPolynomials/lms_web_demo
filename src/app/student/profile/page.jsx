"use client";

import PageHeader from "@/components/layouts/PageHeader";
import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import ProfileCard from "@/components/student/profile/ProfileCard";

import useProfile from "@/hooks/queries/student/useProfile";
import useDashboard from "@/hooks/queries/student/useDashboard";

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile();
  const { data: dashboardData, isLoading: dashboardLoading, isError: dashboardError } = useDashboard();

  const stats = dashboardData?.stats || {};
  const student = {
    name: profile?.name || profile?.fullName || "N/A",
    email: profile?.email || "N/A",
    phone: profile?.studentProfile?.phone || profile?.phone || "N/A",
    education: profile?.studentProfile?.education || profile?.education || "N/A",
  };

  if (profileLoading || dashboardLoading) {
    return <Loader />;
  }

  if (profileError || dashboardError || !profile) {
    return <Card className="text-slate-300">Unable to load profile right now.</Card>;
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Profile" subtitle="Manage your account details." />

      <ProfileCard student={student} />

      <div className="grid md:grid-cols-3 gap-5">
        <Card>
          <h3 className="text-slate-400">Enrolled Courses</h3>
          <p className="text-4xl font-bold text-orange-500 mt-2">{stats?.enrolledCourses || 0}</p>
        </Card>

        <Card>
          <h3 className="text-slate-400">Completed Lessons</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">{stats?.completedLessons || 0}</p>
        </Card>

        <Card>
          <h3 className="text-slate-400">Certificates</h3>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{stats?.certificates || 0}</p>
        </Card>
      </div>
    </div>
  );
}