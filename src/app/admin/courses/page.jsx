"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { FaBook, FaCheckCircle, FaClock } from "react-icons/fa";

import CourseTable from "@/components/courses/CourseTable";
import Loader from "@/components/common/Loader";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";
import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

import { getCourses, deleteCourse } from "@/services/course.service";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDelete = async (courseId) => {
    const confirmed = confirm("Delete this course?");

    if (!confirmed) return;

    try {
      await deleteCourse(courseId);

      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const published = courses.filter(
    (course) => course.status === "PUBLISHED",
  ).length;

  const draft = courses.filter((course) => course.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" subtitle="Manage all platform courses">
        <Link href="/admin/courses/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create Course</Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard
          title="Total Courses"
          value={courses.length}
          icon={<FaBook />}
          href="/admin/courses"
        />

        <DashboardStatCard
          title="Published"
          value={published}
          icon={<FaCheckCircle />}
          href="/admin/courses"
        />

        <DashboardStatCard
          title="Draft"
          value={draft}
          icon={<FaClock />}
          href="/admin/courses"
        />
      </div>

      <CourseTable courses={courses} onDelete={handleDelete} />
    </div>
  );
}
