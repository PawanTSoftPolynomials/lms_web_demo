"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardCheck, HelpCircle, LineChart, ArrowUpRight } from "lucide-react";

export function InstructorKPIs({
  coursesCount = 0,
  studentsCount = 0,
  pendingAssignments = 0,
  activeQuizzes = 0,
  engagementPercentage = 0,
}) {
  const kpis = [
    {
      label: "My Courses",
      value: coursesCount,
      icon: BookOpen,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bottomText: "View all courses",
      href: "/instructor/courses",
      showArrow: true,
    },
    {
      label: "Total Students",
      value: studentsCount,
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bottomText: "Across all courses",
    },
    {
      label: "Assignments",
      value: pendingAssignments,
      icon: ClipboardCheck,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bottomText: "Pending to grade",
    },
    {
      label: "Quizzes",
      value: activeQuizzes,
      icon: HelpCircle,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bottomText: "Active quizzes",
    },
    {
      label: "Average Class Engagement",
      value: `${engagementPercentage}%`,
      icon: LineChart,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bottomText: "This month",
      trend: "up",
    },
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-[2.4px] w-full">
      {kpis.map((kpi, i) => (
        <div key={i} className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm hover:border-primary/50 transition">
          <div className={`p-2 rounded-xl ${kpi.iconBg} shrink-0`}>
            <kpi.icon size={16} className={kpi.iconColor} />
          </div>
          
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10.5px] font-bold uppercase tracking-wider truncate">{kpi.label}</p>
            <div className="flex items-end gap-1.5 mt-0.5">
              <p className="text-lg font-black text-foreground leading-none">{kpi.value}</p>
              
              {kpi.href ? (
                <Link href={kpi.href} className="text-[10.5px] text-primary font-bold hover:opacity-80 truncate block">
                  View &rarr;
                </Link>
              ) : (
                <p className="text-[10.5px] text-muted-foreground font-medium hidden xl:flex items-center">
                  {kpi.trend === "up" && <ArrowUpRight size={10} className="text-primary mr-0.5" />}
                  {kpi.bottomText}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
