"use client";

import StatCard from "@/components/ui/StatCard";
import {
  Users,
  Shield,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function UserStats({
  users = [],
}) {
  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
    },
    {
      title: "Admins",
      value: users.filter(
        (user) => user.role === "ADMIN"
      ).length,
      icon: Shield,
    },
    {
      title: "Instructors",
      value: users.filter(
        (user) => user.role === "INSTRUCTOR"
      ).length,
      icon: GraduationCap,
    },
    {
      title: "Students",
      value: users.filter(
        (user) => user.role === "STUDENT"
      ).length,
      icon: BookOpen,
    },
  ];

  return (
    <div
      className="
        mb-6
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-2
        lg:grid-cols-4
        lg:gap-6
      "
    >
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          className="h-full"
        />
      ))}
    </div>
  );
}