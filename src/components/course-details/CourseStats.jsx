"use client";

import {
  FaBook,
  FaBookOpen,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";

import DashboardStatCard from "@/components/dashboard/common/DashboardStatCard";

export default function CourseStats({
  modules = 0,
  lessons = 0,
  quizzes = 0,
  status = "DRAFT",
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <DashboardStatCard
        title="Modules"
        value={modules}
        icon={FaBook}
        color="orange"
      />

      <DashboardStatCard
        title="Lessons"
        value={lessons}
        icon={FaBookOpen}
        color="blue"
      />

      <DashboardStatCard
        title="Quizzes"
        value={quizzes}
        icon={FaClipboardList}
        color="purple"
      />

      <DashboardStatCard
        title="Status"
        value={status}
        icon={FaCheckCircle}
        color={
          status === "PUBLISHED"
            ? "green"
            : status === "ARCHIVED"
            ? "red"
            : "orange"
        }
      />

    </div>
  );
}