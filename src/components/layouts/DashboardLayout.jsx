"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChatWidget, ChatButton } from "@/components/chat";
import { MentorWidget } from "@/components/mentor";
import Sidebar from "@/components/layouts/Sidebar";
import DashboardNavbar from "@/components/layouts/DashboardNavbar";

export default function DashboardLayout({ children, role, title }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Exclude AI Mentor widget from My Courses list page (/instructor/courses)
  const isMyCoursesPage = pathname === "/instructor/courses" || pathname === "/instructor/courses/";
  const showMentor = !isMyCoursesPage;

  // Students, Instructors, and Admins navigate via top headers or on-page widgets instead of a side rail.
  const showSidebar = !['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role);

  return (
    <div className={`flex min-h-screen ${['INSTRUCTOR', 'ADMIN'].includes(role) ? 'bg-[#080B11]' : 'bg-slate-950'}`}>
      {showSidebar && (
        <Sidebar
          role={role}
          open={open}
          setOpen={setOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}

      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          transition-all
          duration-300
        "
      >
        <DashboardNavbar
          title={title}
          role={role}
          setOpen={setOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className={`${role === 'STUDENT' ? 'p-4' : 'p-3'} sm:p-6 flex-1 ${['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role) ? 'pb-24 sm:pb-6' : ''}`}>{children}</main>
      </div>
      <ChatWidget />
      {!['INSTRUCTOR', 'ADMIN'].includes(role) && <ChatButton />}
      {showMentor && <MentorWidget />}
    </div>
  );
}
