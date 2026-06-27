"use client";

import DoughnutChartCard from "@/components/dashboard/common/DoughnutChartCard";

export default function StudentEngagement({
  activeStudents = 0,
  completedStudents = 0,
  inactiveStudents = 0,
}) {
  const data = [
    {
      name: "Active",
      value: activeStudents,
    },
    {
      name: "Completed",
      value: completedStudents,
    },
    {
      name: "Inactive",
      value: inactiveStudents,
    },
  ];

  return (
    <DoughnutChartCard
      title="Student Engagement"
      subtitle="Current course activity"
      data={data}
      colors={[
        "#22c55e", // Green
        "#3b82f6", // Blue
        "#f97316", // Orange
      ]}
    />
  );
}