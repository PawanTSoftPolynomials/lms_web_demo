"use client";

import Link from "next/link";
import { BookOpen, Users, GraduationCap, UserCog, Layers } from "lucide-react";

export function AdminKPIs({
  coursesCount = 0,
  studentsCount = 0,
  instructorsCount = 0,
  enrollmentsCount = 0,
  usersCount = 0,
}) {
  const kpis = [
    {
      label: "Total Courses",
      value: coursesCount,
      icon: BookOpen,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      href: "/admin/courses",
    },
    {
      label: "Total Students",
      value: studentsCount,
      icon: GraduationCap,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      href: "/admin/students",
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
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      href: "/admin/enrollments",
    },
    {
      label: "Total Users",
      value: usersCount,
      icon: Users,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-3 shadow-sm hover:border-slate-700 transition">
          <div className={`p-2 rounded-xl ${kpi.iconBg} shrink-0`}>
            <kpi.icon size={16} className={kpi.iconColor} />
          </div>

          <div className="min-w-0">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{kpi.label}</p>
            <div className="flex items-end gap-1.5 mt-0.5">
              <p className="text-lg font-black text-white leading-none">{kpi.value}</p>
              {kpi.href && (
                <Link href={kpi.href} className="text-[9px] text-orange-400 font-bold hover:text-orange-300 truncate hidden xl:block">
                  View &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
