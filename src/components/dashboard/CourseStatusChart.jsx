"use client";

import dynamic from "next/dynamic";

import DashboardChart from "./common/DashboardChart";

// Dynamically imported so recharts is bundled once via this shared
// dynamic() boundary instead of duplicated into this route's own chunk.
const DoughnutChartCard = dynamic(() => import("./common/DoughnutChartCard"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-slate-800/50 rounded-2xl" />,
});

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