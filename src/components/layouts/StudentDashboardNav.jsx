"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
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
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useNotification } from "@/context/NotificationContext";
import { useQa } from "@/context/QaContext";
import { getCalendarEvents } from "@/services/calendar.service";

// Number of items shown inline before the "More" menu kicks in on mobile.
const MOBILE_VISIBLE_COUNT = 4;
// On desktop, show everything through "Announcements" inline; the rest
// (Activity, Suggestions, AI Recommendations) live in the "More" menu so the
// bar never has to scroll/slide to reveal items.
const DESKTOP_VISIBLE_COUNT = 7;

// Single source of truth for nav items, grouped for subtle visual separation.
// Groups get slightly more breathing room between them than items within a group.
function useNavItems() {
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
    { id: "myCourses", label: "My Courses", icon: BookOpen, href: "/student/my-courses", badge: enrolledCount, group: "learning" },
    { id: "myWork", label: "My Work", icon: CheckSquare, href: "/student/assignments", badge: pendingAssignmentsCount, group: "learning" },
    { id: "calendar", label: "Calendar", icon: Calendar, href: "/student/calendar", badge: calendarCount, group: "learning" },
    { id: "qa", label: "Q/A", icon: MessageSquare, href: "/student/qa", badge: qaPendingCount, group: "learning" },
    { id: "reports", label: "Reports", icon: BarChart3, href: "/student/reports", badge: 0, group: "analytics" },
    { id: "news", label: "News", icon: Newspaper, href: "/student/news", badge: 0, group: "analytics" },
    { id: "announcements", label: "Announcements", icon: Megaphone, href: "/student/announcements", badge: unreadNotificationsCount, group: "analytics" },
    { id: "recentActivities", label: "Activity", icon: Activity, href: "/student/activity", badge: 0, group: "analytics" },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "/student/feedback", badge: 0, group: "ai" },
    { id: "recommendations", label: "AI Recommendations", icon: Sparkles, href: "/student/courses", badge: 0, group: "ai", highlight: true },
  ];
}

function NavPill({ item, isActive, isGroupStart, onClick, layoutId }) {
  const Icon = item.icon;
  const isHighlight = item.highlight;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`group relative inline-flex shrink-0 items-center gap-2.5 rounded-full px-5 py-3 text-[14px] outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12121C] ${
        isGroupStart ? "ml-3" : ""
      } ${
        isActive
          ? "scale-[1.02] font-semibold text-white"
          : isHighlight
          ? "font-medium text-purple-300 hover:-translate-y-0.5 hover:bg-purple-500/10 hover:text-purple-200"
          : "font-medium text-slate-400 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className={`absolute inset-0 rounded-full ${
            isHighlight
              ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-[0_8px_24px_rgba(168,85,247,0.4)]"
              : "bg-gradient-to-r from-[#ff7a18] to-[#ff9800] shadow-[0_8px_24px_rgba(255,140,0,0.35)]"
          }`}
        />
      )}

      <span className="relative z-10 inline-flex shrink-0">
        <Icon
          size={20}
          strokeWidth={2.25}
          className={`transition-transform duration-200 group-hover:scale-110 ${
            isActive
              ? "text-white"
              : isHighlight
              ? "text-purple-400"
              : "text-slate-400 group-hover:text-orange-400"
          }`}
          aria-hidden="true"
        />
        <AnimatePresence>
          {!!item.badge && (
            <motion.span
              key={item.badge}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 550, damping: 22 }}
              className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 px-1 text-[9px] font-bold leading-none text-white shadow-[0_2px_6px_rgba(255,140,0,0.5)] ring-2 ring-[#12121C]"
              aria-label={`${item.badge} unread`}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="relative z-10 whitespace-nowrap">{item.label}</span>
    </Link>
  );
}

// Closes a "More" dropdown on outside click or Escape.
function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, ref]);
}

function MoreMenu({ overflowItems, isOverflowActive, isItemActive, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, setOpen, ref);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More dashboard sections"
        className={`relative inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-[14px] font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12121C] ${
          open || isOverflowActive
            ? "scale-[1.02] bg-gradient-to-r from-[#ff7a18] to-[#ff9800] font-semibold text-white shadow-[0_8px_24px_rgba(255,140,0,0.35)]"
            : "text-slate-400 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
        <span>More</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="More dashboard sections"
          className={`absolute top-[calc(100%+10px)] z-50 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0D0D18]/95 p-2 shadow-2xl backdrop-blur-xl scrollbar-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {overflowItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  active
                    ? item.highlight
                      ? "bg-purple-500/15 text-purple-300"
                      : "bg-[#f97316]/15 text-orange-400"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? (item.highlight ? "text-purple-400" : "text-orange-400") : "text-slate-400"}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
                {!!item.badge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 px-1.5 text-[10px] font-black text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentDashboardNav() {
  const pathname = usePathname();
  const items = useNavItems();

  const isItemActive = (item) => pathname && pathname.startsWith(item.href);

  const mobilePrimaryItems = items.slice(0, MOBILE_VISIBLE_COUNT);
  const mobileOverflowItems = items.slice(MOBILE_VISIBLE_COUNT);
  const isMobileOverflowActive = mobileOverflowItems.some(isItemActive);

  const desktopPrimaryItems = items.slice(0, DESKTOP_VISIBLE_COUNT);
  const desktopOverflowItems = items.slice(DESKTOP_VISIBLE_COUNT);
  const isDesktopOverflowActive = desktopOverflowItems.some(isItemActive);

  return (
    <div className="w-full px-4 pb-3 sm:px-6 sm:pb-4">
      <nav
        aria-label="Student dashboard sections"
        className="relative flex h-16 items-center gap-2 rounded-2xl border border-white/[0.06] bg-[rgba(18,18,28,0.85)] px-3 shadow-[0_10px_30px_rgba(0,0,0,0.30)] backdrop-blur-lg select-none sm:px-4 font-sans"
      >
        {/* Desktop: primary items through Announcements + More dropdown for the rest */}
        <div className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
          {desktopPrimaryItems.map((item, idx) => (
            <NavPill
              key={item.id}
              item={item}
              isActive={isItemActive(item)}
              isGroupStart={idx > 0 && item.group !== desktopPrimaryItems[idx - 1].group}
              layoutId="student-nav-active-pill-desktop"
            />
          ))}
          {desktopOverflowItems.length > 0 && (
            <MoreMenu
              overflowItems={desktopOverflowItems}
              isOverflowActive={isDesktopOverflowActive}
              isItemActive={isItemActive}
              align="right"
            />
          )}
        </div>

        {/* Mobile: first N items + More dropdown */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none md:hidden [-webkit-overflow-scrolling:touch]">
          {mobilePrimaryItems.map((item) => (
            <NavPill
              key={item.id}
              item={item}
              isActive={isItemActive(item)}
              isGroupStart={false}
              layoutId="student-nav-active-pill-mobile"
            />
          ))}
          {mobileOverflowItems.length > 0 && (
            <MoreMenu
              overflowItems={mobileOverflowItems}
              isOverflowActive={isMobileOverflowActive}
              isItemActive={isItemActive}
              align="left"
            />
          )}
        </div>
      </nav>
    </div>
  );
}
