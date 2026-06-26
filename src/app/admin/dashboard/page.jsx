"use client";

import { useEffect, useState } from "react";

import {
  FaUsers,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCertificate,
} from "react-icons/fa";

import { getUsers } from "@/services/user.service";
import { getCourses } from "@/services/course.service";
import { getCertificates } from "@/services/certificate.service";

import Loader from "@/components/common/Loader";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import CourseStatusChart from "@/components/dashboard/CourseStatusChart";
import QuickActions from "@/components/dashboard/QuickActions";
import LatestCourses from "@/components/dashboard/LatestCourses";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    students: 0,
    instructors: 0,
    certificates: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [usersData, coursesData, certificatesData] = await Promise.all([
          getUsers(),
          getCourses(),
          getCertificates(),
        ]);

        setCourses(coursesData);

        setStats({
          users: usersData.length,

          courses: coursesData.length,

          students: usersData.filter((user) => user.role === "STUDENT").length,

          instructors: usersData.filter((user) => user.role === "INSTRUCTOR")
            .length,

          certificates: certificatesData.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const analyticsData = [
    {
      name: "Users",
      value: stats.users,
    },
    {
      name: "Courses",
      value: stats.courses,
    },
    {
      name: "Students",
      value: stats.students,
    },
    {
      name: "Teachers",
      value: stats.instructors,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <DashboardStatCard
          title="Total Users"
          value={stats.users}
          icon={FaUsers}
          href="/admin/users"
        />

        <DashboardStatCard
          title="Courses"
          value={stats.courses}
          icon={FaBook}
          href="/admin/courses"
        />

        <DashboardStatCard
          title="Students"
          value={stats.students}
          icon={FaUserGraduate}
          href="/admin/students"
        />

        <DashboardStatCard
          title="Instructors"
          value={stats.instructors}
          icon={FaChalkboardTeacher}
          href="/admin/instructors"
        />

        <DashboardStatCard
          title="Certificates"
          value={stats.certificates}
          icon={FaCertificate}
          href="/admin/certificates"
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <AnalyticsChart title="Platform Overview" data={analyticsData} />

        <CourseStatusChart courses={courses} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <QuickActions />

        <div className="lg:col-span-2">
          <LatestCourses courses={courses} />
        </div>
      </div>

      <RecentActivity users={[...Array(stats.users)]} courses={courses} />
    </div>
  );
}
