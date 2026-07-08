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
        "#DFBA73", // Champagne Gold (Active)
        "#C5A059", // Polished Brass (Completed)
        "#1D1D21", // Satin Charcoal (Inactive)
      ]}
    />
  );
}
