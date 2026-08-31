"use client";

import Link from "next/link";
import { BookOpen, Users, GraduationCap, UserCog, Layers } from "lucide-react";

export function AdminKPIs({
  coursesCount = 0,
  studentsCount = 0,
  instructorsCount = 0,
  enrollmentsCount = 0,
  usersCount = 0,
  trends = {},
}) {
  const {
    newCoursesThisMonth = 0,
    newStudentsToday = 0,
    newEnrollmentsToday = 0,
    newUsersToday = 0,
  } = trends;

  const kpis = [
    {
      label: "Total Courses",
      value: coursesCount,
      icon: BookOpen,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      href: "/admin/courses",
      delta: newCoursesThisMonth > 0 ? `+${newCoursesThisMonth} this month` : null,
    },
    {
      label: "Total Students",
      value: studentsCount,
      icon: GraduationCap,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      href: "/admin/students",
      delta: newStudentsToday > 0 ? `+${newStudentsToday} today` : null,
    },
    {
      label: "Total Instructors",
      value: instructorsCount,
      icon: UserCog,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      href: "/admin/instructors",
    },
    {
      label: "Enrollments",
      value: enrollmentsCount,
      icon: Layers,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      href: "/admin/enrollments",
      delta: newEnrollmentsToday > 0 ? `+${newEnrollmentsToday} today` : null,
    },
    {
      label: "Total Users",
      value: usersCount,
      icon: Users,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      delta: newUsersToday > 0 ? `+${newUsersToday} today` : null,
    },
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm hover:border-transparent transition">
          <div className={`p-2 rounded-xl ${kpi.iconBg} shrink-0`}>
            <kpi.icon size={16} className={kpi.iconColor} />
          </div>

          <div className="min-w-0">
            <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider truncate">{kpi.label}</p>
            <div className="flex items-end gap-1.5 mt-0.5">
              <p className="text-lg font-black text-foreground leading-none">{kpi.value}</p>
              {kpi.href && (
                <Link href={kpi.href} className="text-[9px] text-primary font-bold hover:text-orange-300 truncate hidden xl:block">
                  View &rarr;
                </Link>
              )}
            </div>
            {kpi.delta && (
              <p className="text-[9px] text-emerald-400 font-bold mt-0.5 truncate">{kpi.delta}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
