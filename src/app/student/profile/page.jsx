"use client";

import { useEffect, useState } from "react";

import ProfileCard from "@/components/students/ProfileCard";
import { getProfile } from "../../../services/auth.service";
import { getStudentDashboard } from "@/services/dashboard.service";

export default function ProfilePage() {
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, dashboardRes] =
          await Promise.all([
            getProfile(),
            getStudentDashboard(),
          ]);

        const profile =
          profileRes.data || profileRes;

        const dashboard =
          dashboardRes.data || dashboardRes;

        setStudent({
          name: profile.name || "N/A",
          email: profile.email || "N/A",
          phone:
            profile.studentProfile?.phone ||
            "N/A",
          education:
            profile.studentProfile
              ?.education || "N/A",
        });

        setStats(dashboard.stats);
      } catch (error) {
        console.error(
          "Profile fetch failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-white">
        Loading profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-white">
        Profile not found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          My Profile
        </h1>

        <p className="text-gray-400 mt-2">
          Manage your account details.
        </p>
      </div>

      <ProfileCard student={student} />

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">
            Enrolled Courses
          </h3>

          <p className="text-4xl font-bold text-orange-500 mt-2">
            {stats?.enrolledCourses || 0}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">
            Completed Lessons
          </h3>

          <p className="text-4xl font-bold text-green-500 mt-2">
            {stats?.completedLessons || 0}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <h3 className="text-gray-400">
            Certificates
          </h3>

          <p className="text-4xl font-bold text-yellow-500 mt-2">
            {stats?.certificates || 0}
          </p>
        </div>
      </div>
    </div>
  );
}