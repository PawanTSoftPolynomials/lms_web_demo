"use client";

import { useEffect, useState } from "react";

import {
  FaUsers,
  FaBook,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";

import { getUsers } from "@/services/user.service";

import { getCourses } from "@/services/course.service";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    students: 0,
    instructors: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersResponse = await getUsers();

        const coursesResponse = await getCourses();

        const users = usersResponse.data || [];

        const courses = coursesResponse.data || [];

        setStats({
          users: users.length,

          courses: courses.length,

          students: users.filter((user) => user.role === "STUDENT").length,

          instructors: users.filter((user) => user.role === "INSTRUCTOR")
            .length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Manage your LMS platform" />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
}
