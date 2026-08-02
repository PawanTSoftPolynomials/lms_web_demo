"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function QuickActionsBar() {
  const actions = [
    { label: "Create Course", href: "/instructor/courses/create" },
    { label: "Create Quiz", href: "/instructor/quizzes/create" },
    { label: "Schedule Class", href: "/instructor/calendar" },
    { label: "Upload Material", href: "/instructor/work/documents" },
    { label: "Create Assignment", href: "/instructor/assignments" },
  ];

  return (
    <div className="flex items-center gap-6 px-2 py-3 border-b border-[#1A1F35] text-xs font-bold text-slate-300">
      {actions.map((action) => (
        <Link key={action.label} href={action.href} className="hover:text-white transition">
          {action.label}
        </Link>
      ))}
      <button className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition cursor-pointer">
        More <ChevronDown size={14} />
      </button>
    </div>
  );
}
