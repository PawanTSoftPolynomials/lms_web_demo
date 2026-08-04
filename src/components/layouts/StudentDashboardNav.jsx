"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
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
  Menu,
  X,
  User,
  Settings,
  Award,
  Bookmark,
  FileText,
  Trophy,
  Video,
  HelpCircle,
  ClipboardCheck,
  Star,
  LayoutDashboard,
} from "lucide-react";

import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "@/components/student/NavigationStrip/navigationItems";
import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useNotification } from "@/context/NotificationContext";
import { useQa } from "@/context/QaContext";
import { getCalendarEvents } from "@/services/calendar.service";

// The mobile drawer additionally surfaces unread/pending counts per section —
// an existing Student-only affordance the shared (Instructor-derived)
// QuickActionStrip pills don't have, so it's computed only for this branch.
function useMobileNavItems() {
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

// Every Student screen the mobile compact bar might need to label — broader
// than `useMobileNavItems()` above, which only covers the 10 curated
// shortcuts in the drawer. Order matters: more specific paths (e.g.
// "/student/my-courses") must come before shorter ones that could otherwise
// prefix-match too eagerly.
const PAGE_TITLES = [
  { href: "/student/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/student/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/student/courses", label: "Browse Courses", icon: BookOpen },
  { href: "/student/assignments", label: "My Work", icon: CheckSquare },
  { href: "/student/calendar", label: "Calendar", icon: Calendar },
  { href: "/student/qa", label: "Q/A", icon: MessageSquare },
  { href: "/student/reports", label: "Reports", icon: BarChart3 },
  { href: "/student/news", label: "News", icon: Newspaper },
  { href: "/student/announcements", label: "Announcements", icon: Megaphone },
  { href: "/student/activity", label: "Activity", icon: Activity },
  { href: "/student/feedback", label: "Suggestions", icon: Lightbulb },
  { href: "/student/progress", label: "Progress", icon: BarChart3 },
  { href: "/student/profile", label: "My Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/student/notes", label: "Notes", icon: FileText },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/live-classes", label: "Live Classes", icon: Video },
  { href: "/student/messages", label: "Messages", icon: MessageSquare },
  { href: "/student/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/student/attempt", label: "Quiz Attempt", icon: ClipboardCheck },
  { href: "/student/result", label: "Quiz Result", icon: ClipboardCheck },
  { href: "/student/reviews", label: "Reviews", icon: Star },
];

const isPageMatch = (pathname, entry) =>
  entry.exact ? pathname === entry.href : pathname === entry.href || pathname?.startsWith(`${entry.href}/`);

const humanizeSegment = (segment = "") =>
  segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Dashboard";

// Context-aware label for whichever Student screen is currently open — falls
// back to a humanized route segment (instead of silently defaulting to the
// first nav item) so every screen, not just the 10 curated shortcuts, shows
// its own title.
function getCurrentPage(pathname) {
  const match = PAGE_TITLES.find((entry) => isPageMatch(pathname, entry));
  if (match) return match;

  const segment = pathname?.split("/").filter(Boolean)[1];
  return { label: humanizeSegment(segment), icon: LayoutDashboard };
}

export default function StudentDashboardNav() {
  const pathname = usePathname();
  const mobileItems = useMobileNavItems();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isItemActive = (item) => pathname && pathname.startsWith(item.href);
  const currentPage = getCurrentPage(pathname);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop / tablet: the exact same floating quick-action strip as Instructor */}
      <div className="hidden sm:block">
        <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Student dashboard sections" />
      </div>

      {/* Mobile: existing compact bar + drawer, given the same floating-card
          framing since it now lives in the quick-action zone instead of the header. */}
      <div className="flex sm:hidden items-center gap-2 rounded-2xl border border-card-border bg-card/80 backdrop-blur-md px-3 py-2 shadow-sm">
        <div className="flex-1 min-w-0 flex items-center gap-2 text-foreground">
          <currentPage.icon size={16} className="text-primary" />
          <span className="text-xs font-bold truncate">{currentPage.label}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer: every section in one reusable list */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm sm:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-[#090D16] border-l border-slate-800/60 z-[70] sm:hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-right duration-200">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/60 shrink-0">
              <span className="text-sm font-black text-white tracking-tight">Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
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
      )}
    </>
  );
}
