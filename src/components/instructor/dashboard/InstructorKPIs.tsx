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
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      bottomText: "View all courses",
      href: "/instructor/courses",
    },
    {
      label: "Total Students",
      value: studentsCount,
      icon: Users,
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      bottomText: "Across all courses",
    },
    {
      label: "Assignments",
      value: pendingAssignments,
      icon: ClipboardCheck,
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      bottomText: "Pending to grade",
    },
    {
      label: "Quizzes",
      value: activeQuizzes,
      icon: HelpCircle,
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      bottomText: "Active quizzes",
    },
    {
      label: "Average Engagement",
      value: `${engagementPercentage}%`,
      icon: LineChart,
      iconBg: "bg-primary/10 border-primary/20",
      iconColor: "text-primary",
      bottomText: "This month",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
      {kpis.map((kpi, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3.5 rounded-2xl bg-card border border-border/80 p-4 shadow-luxury-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`p-2.5 rounded-xl border ${kpi.iconBg} shrink-0`}>
            <kpi.icon size={18} className={kpi.iconColor} />
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-[10px] font-extrabold uppercase tracking-wider truncate">{kpi.label}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <p className="text-xl font-extrabold text-foreground leading-none">{kpi.value}</p>
              
              {kpi.href ? (
                <Link href={kpi.href} className="text-[10px] text-primary font-bold hover:underline truncate hidden sm:inline">
                  View &rarr;
                </Link>
              ) : (
                <p className="text-[10px] text-muted-foreground font-semibold hidden sm:flex items-center">
                  {kpi.trend === "up" && <ArrowUpRight size={11} className="text-primary mr-0.5" />}
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
