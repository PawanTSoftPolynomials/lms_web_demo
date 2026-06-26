"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

export default function CourseStatusChart({
  courses,
}) {
  const published =
    courses.filter(
      (course) =>
        course.status === "PUBLISHED"
    ).length;

  const draft =
    courses.filter(
      (course) =>
        course.status === "DRAFT"
    ).length;

  const archived =
    courses.filter(
      (course) =>
        course.status === "ARCHIVED"
    ).length;

  const data = [
    {
      name: "Published",
      value: published,
    },
    {
      name: "Draft",
      value: draft,
    },
    {
      name: "Archived",
      value: archived,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold">
        Course Status
      </h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {data.map(
              (_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[index]
                  }
                />
              )
            )}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}