"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  Newspaper,
  Megaphone,
  Activity,
  Lightbulb,
  Sparkles,
  X,
} from "lucide-react";

import { useStudentNavDrawer } from "@/context/StudentNavDrawerContext";
import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useNotification } from "@/context/NotificationContext";
import { useQa } from "@/context/QaContext";
import { getCalendarEvents } from "@/services/calendar.service";

// Unread/pending counts per section — a Student-only affordance the drawer
// surfaces that the desktop QuickActionStrip pills don't have.
function useDrawerItems() {
  const { data: dashboardData } = useDashboard();
  const { data: assignments = [] } = useAssignments();
  const { notifications = [] } = useNotification();
  const { pendingCount: qaPendingCount } = useQa();

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const enrolledCount = dashboardData?.enrolledCoursesList?.length ?? 0;
  const pendingAssignmentsCount = assignments.filter(
    (a) => a.status !== "Submitted" && a.status !== "Graded"
  ).length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const calendarCount = calendarEvents.length;

  return [
    { id: "myCourses", label: "My Courses", icon: BookOpen, href: "/student/my-courses", badge: enrolledCount },
    { id: "myWork", label: "My Work", icon: CheckSquare, href: "/student/assignments", badge: pendingAssignmentsCount },
    { id: "calendar", label: "Calendar", icon: Calendar, href: "/student/calendar", badge: calendarCount },
    { id: "qa", label: "Q/A", icon: MessageSquare, href: "/student/qa", badge: qaPendingCount },
    { id: "reports", label: "Reports", icon: BarChart3, href: "/student/reports", badge: 0 },
    { id: "news", label: "News", icon: Newspaper, href: "/student/news", badge: 0 },
    { id: "announcements", label: "Announcements", icon: Megaphone, href: "/student/announcements", badge: unreadNotificationsCount },
    { id: "recentActivities", label: "Activity", icon: Activity, href: "/student/activity", badge: 0 },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "/student/feedback", badge: 0 },
    { id: "recommendations", label: "AI Recommendations", icon: Sparkles, href: "/student/courses", badge: 0, highlight: true },
  ];
}

// The Student mobile navigation drawer — opened from the header's hamburger
// button (see DashboardNavbar) via shared context, instead of its own
// per-page trigger. Same 10 curated destinations/badges as before.
export default function StudentNavDrawer() {
  const pathname = usePathname();
  const { isOpen, close } = useStudentNavDrawer();
  const items = useDrawerItems();

  const isItemActive = (item) => pathname && pathname.startsWith(item.href);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm sm:hidden" onClick={close} />
      <div className="fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-[#090D16] border-l border-slate-800/60 z-[70] sm:hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-right duration-200">
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/60 shrink-0">
          <span className="text-sm font-black text-white tracking-tight">Navigation</span>
          <button
            onClick={close}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={close}
                className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? item.highlight
                      ? "bg-purple-500 text-white font-bold shadow-[0_2px_12px_rgba(168,85,247,0.35)]"
                      : "bg-orange-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(249,115,22,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-semibold"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className={active ? (item.highlight ? "text-white" : "text-slate-950") : "text-slate-400"} />
                  <span className="text-sm">{item.label}</span>
                </span>
                {!!item.badge && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                      active ? "bg-white/20 text-white" : "bg-orange-500 text-white"
                    }`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
