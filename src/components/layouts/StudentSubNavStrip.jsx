"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckSquare,
  Newspaper,
  Megaphone,
  BarChart3,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Calendar,
  Activity,
} from "lucide-react";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useNotification } from "@/context/NotificationContext";
import useChat from "@/hooks/useChat";
import { getCalendarEvents } from "@/services/calendar.service";

export default function StudentSubNavStrip() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("myLearning");

  // Connected APIs
  const { data: dashboardData } = useDashboard();
  const { data: assignments = [] } = useAssignments();
  const { notifications = [] } = useNotification();
  const { chatUnreadCount = 0 } = useChat();

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  // Derived API counts
  const enrolledCount = dashboardData?.enrolledCoursesList?.length ?? 1;
  const pendingAssignmentsCount = assignments.filter(
    (a) => a.status !== "Submitted" && a.status !== "Graded"
  ).length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const calendarCount = calendarEvents.length;

  const items = [
    {
      id: "myLearning",
      label: "My Learning",
      icon: BookOpen,
      badge: enrolledCount > 0 ? enrolledCount : null,
      href: "/student/my-courses",
      apiPresent: true,
      apiEndpoint: "/dashboard/student",
    },
    {
      id: "work",
      label: "Work",
      icon: CheckSquare,
      badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : null,
      href: "/student/assignments",
      apiPresent: true,
      apiEndpoint: "/assignments/my-assignments",
    },
    {
      id: "news",
      label: "News",
      icon: Newspaper,
      badge: null,
      href: "/student/news",
      apiPresent: true,
      apiEndpoint: "/courses & /notifications",
    },
    {
      id: "announcement",
      label: "Announcement",
      icon: Megaphone,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      href: "/student/announcements",
      apiPresent: true,
      apiEndpoint: "/notifications",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      badge: null,
      href: "/student/progress",
      apiPresent: true,
      apiEndpoint: "/progress",
    },
    {
      id: "suggestions",
      label: "Suggestions",
      icon: Lightbulb,
      badge: null,
      href: "/student/feedback",
      apiPresent: false,
      apiEndpoint: null,
    },
    {
      id: "recommendations",
      label: "Recommendations",
      icon: Sparkles,
      badge: null,
      href: "/student/courses",
      apiPresent: false,
      apiEndpoint: null,
    },
    {
      id: "Q/A",
      label: "Q/A",
      icon: MessageSquare,
      badge: chatUnreadCount > 0 ? chatUnreadCount : null,
      href: "/student/messages",
      apiPresent: true,
      apiEndpoint: "/messages or /conversations",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      badge: calendarCount > 0 ? calendarCount : null,
      href: "/student/calendar",
      apiPresent: true,
      apiEndpoint: "/calendar",
    },
    {
      id: "recentActivity",
      label: "Recent Activity",
      icon: Activity,
      badge: null,
      href: "/student/progress",
      apiPresent: true,
      apiEndpoint: "/dashboard/student",
    },
  ];

  return (
    <nav className="w-full h-[48px] bg-[#080B11] border-b border-[#1A1F35] px-6 flex items-center whitespace-nowrap overflow-x-auto scrollbar-none select-none text-xs font-sans">
      <div className="flex items-center gap-6">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (pathname && pathname.includes(item.href) && item.id !== "news" && item.id !== "recommendations");

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 ease-in-out shrink-0 ${
                isActive
                  ? "bg-[#f97316] text-white font-bold shadow-md shadow-orange-500/20"
                  : "bg-transparent text-slate-400 font-medium hover:bg-[#f97316]/12 hover:text-white"
              }`}
              title={
                item.apiPresent
                  ? `Connected to API (${item.apiEndpoint})`
                  : `API Not Present in backend`
              }
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black leading-none ${
                    isActive
                      ? "bg-white text-[#f97316] shadow-sm"
                      : "bg-[#f97316] text-white shadow-sm"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
