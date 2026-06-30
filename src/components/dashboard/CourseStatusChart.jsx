"use client";

import DashboardChart from "./common/DashboardChart";
import DoughnutChartCard from "./common/DoughnutChartCard";

export default function CourseStatusChart({
  publishedCourses,
  draftCourses,
}) {
  const data = [
    {
      name: "Published",
      value: publishedCourses,
    },
    {
      name: "Draft",
      value: draftCourses,
    },
  ];

  return (
    <DashboardChart title="Course Status">
      <DoughnutChartCard data={data} />
    </DashboardChart>
  );
}