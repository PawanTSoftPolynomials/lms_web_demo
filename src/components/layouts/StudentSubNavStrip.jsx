"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
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
  Video,
  HelpCircle,
  FileText,
  Bookmark,
  Trophy,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import useDashboard from "@/hooks/queries/student/useDashboard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { useNotification } from "@/context/NotificationContext";
import useChat from "@/hooks/useChat";
import { getCalendarEvents } from "@/services/calendar.service";

// Links that used to live only in the left sidebar; always tucked behind "More".
const MORE_ITEMS = [
  { label: "Live Classes", icon: Video, href: "/student/live-classes" },
  { label: "Quizzes", icon: HelpCircle, href: "/student/quizzes" },
  { label: "Notes", icon: FileText, href: "/student/notes" },
  { label: "Bookmarks", icon: Bookmark, href: "/student/bookmarks" },
  { label: "Achievements", icon: Trophy, href: "/student/achievements" },
  { label: "Settings", icon: Settings, href: "/student/settings" },
];

// Single, unchanged pill style (the current >=1440px look) used at every breakpoint.
// Fewer items are shown on narrower screens instead of shrinking this further.
const PILL_BASE =
  "relative inline-flex items-center shrink-0 rounded-full transition-all duration-200 ease-in-out gap-1.5 px-2.5 py-1.5";
const ICON_BASE = "w-4 h-4";
const BADGE_BASE =
  "absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-[3px] text-[8px] font-black leading-none";
const NAV_GAP_PX = 4; // matches `gap-1` below

// SSR-safe default: the item count that's guaranteed to fit down to 768px.
// Corrected (without a flash) by measurement before first paint on wider screens.
const DEFAULT_VISIBLE_COUNT = 5;

export default function StudentSubNavStrip() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navRef = useRef(null);
  const shadowRefs = useRef([]);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);

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

  // Priority order (highest first): items at the front are the last to be collapsed into "More".
  const items = [
    { id: "home", label: "Home", icon: Home, badge: null, href: "/student/dashboard" },
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
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      badge: calendarCount > 0 ? calendarCount : null,
      href: "/student/calendar",
      apiPresent: true,
      apiEndpoint: "/calendar",
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
      id: "recentActivity",
      label: "Recent Activity",
      icon: Activity,
      badge: null,
      href: "/student/progress",
      apiPresent: true,
      apiEndpoint: "/dashboard/student",
    },
  ];

  const isItemActive = (item) =>
    activeTab === item.id || (pathname && pathname.includes(item.href) && item.id !== "news" && item.id !== "recommendations");

  const isMoreActive = MORE_ITEMS.some((item) => pathname?.includes(item.href));
  // For the mobile bar's "current section" label, also recognize sidebar-only ("More") pages.
  const activeItem =
    items.find((item) => isItemActive(item)) ??
    MORE_ITEMS.find((item) => pathname?.includes(item.href)) ??
    items[0];

  // Measure how many items actually fit in the space the flexbox gives `<nav>` (which already
  // excludes the "More" button and the strip's own edge padding), and only render that many.
  // Re-measures on resize (and whenever the active item changes, since the active pill is
  // rendered bolder/wider) so the cutoff is driven by real available width, not a fixed breakpoint.
  useLayoutEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    const recalc = () => {
      const available = navEl.clientWidth;
      // Mid-hydration the box can transiently report 0 before layout has settled; skip
      // committing that reading rather than latching onto a bogus 1-item count — a real
      // 0-width strip isn't a state we need to render differently for anyway.
      if (available <= 0) return;

      let used = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const shadowEl = shadowRefs.current[i];
        if (!shadowEl) break;
        const needed = count === 0 ? shadowEl.offsetWidth : shadowEl.offsetWidth + NAV_GAP_PX;
        if (used + needed > available) break;
        used += needed;
        count++;
      }
      setVisibleCount(Math.min(Math.max(count, 1), items.length));
    };

    recalc();
    // Re-measure once more next frame in case the very first read above raced hydration/
    // stylesheet application and undercounted — cheap, idempotent when the first read was fine.
    const rafId = requestAnimationFrame(recalc);
    const ro = new ResizeObserver(recalc);
    ro.observe(navEl);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [items.length, activeItem.id]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  // Close the mobile drawer on Escape for keyboard users.
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
      {/* Mobile (<768px): compact bar showing the current section + a drawer trigger, no horizontal nav */}
      <div className="w-full h-[48px] bg-[#080B11] border-b border-[#1A1F35] flex md:hidden items-center gap-2 px-3">
        <div className="flex-1 min-w-0 flex items-center gap-2 text-slate-200">
          <activeItem.icon size={16} className="text-orange-400 shrink-0" />
          <span className="text-xs font-bold truncate">{activeItem.label}</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Tablet and up (>=768px): horizontal pill strip. Item count is measured, not breakpoint-guessed. */}
      <div className="w-full h-[48px] bg-[#080B11] border-b border-[#1A1F35] hidden md:flex items-center gap-1 pl-2 pr-1.5 sm:pl-4 sm:pr-2">
        <nav
          ref={navRef}
          className="flex-1 min-w-0 h-full flex items-center gap-1 whitespace-nowrap overflow-hidden select-none text-[11px] font-sans"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`${PILL_BASE} ${
                  isActive
                    ? "bg-[#f97316] text-white font-bold shadow-md shadow-orange-500/20"
                    : "bg-transparent text-slate-400 font-medium hover:bg-[#f97316]/12 hover:text-white"
                }`}
                title={
                  item.apiPresent
                    ? `Connected to API (${item.apiEndpoint})`
                    : item.apiPresent === false
                    ? `API Not Present in backend`
                    : undefined
                }
              >
                <Icon className={`${ICON_BASE} ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`${BADGE_BASE} ${isActive ? "bg-white text-[#f97316] shadow-sm" : "bg-[#f97316] text-white shadow-sm"}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Invisible measurement row: mirrors the real pills' markup and font weight (bold only for
            the active item, same as below) so measured widths match actual rendered widths exactly
            — using a uniformly bold estimate here would undercount how many items actually fit and
            leave dead space before "More". Positioned off-screen so it never affects layout or scrolling. */}
        <div
          aria-hidden="true"
          className="fixed flex items-center gap-1 invisible pointer-events-none text-[11px] font-sans"
          style={{ top: -9999, left: -9999 }}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            return (
              <span
                key={item.id}
                ref={(el) => {
                  shadowRefs.current[idx] = el;
                }}
                className={`${PILL_BASE} ${isActive ? "font-bold" : "font-medium"}`}
              >
                <Icon className={ICON_BASE} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={BADGE_BASE}>{item.badge}</span>
                )}
              </span>
            );
          })}
        </div>

        {/* "More": always holds the sidebar-only links, plus whichever priority items don't fit */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              moreOpen || isMoreActive
                ? "bg-[#f97316] text-white shadow-md shadow-orange-500/20"
                : "bg-transparent text-slate-400 hover:bg-[#f97316]/12 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">More</span>
            <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>

          {moreOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-56 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                {overflowItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMoreOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/20"
                          : "text-slate-300 hover:text-white hover:bg-white/5 font-semibold"
                      }`}
                    >
                      <Icon size={15} className={isActive ? "text-orange-400" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {overflowItems.length > 0 && <div className="my-1.5 border-t border-[#1A1F35]" />}

                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.includes(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/20"
                          : "text-slate-300 hover:text-white hover:bg-white/5 font-semibold"
                      }`}
                    >
                      <Icon size={15} className={isActive ? "text-orange-400" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer: the full navigation (main items + sidebar-only links) in one reusable list */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-[#090D16] border-l border-slate-800/60 z-[70] md:hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-right duration-200">
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
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActiveTab(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(249,115,22,0.35)]"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-semibold"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-slate-950" : "text-slate-400"} />
                      <span className="text-sm">{item.label}</span>
                    </span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                          isActive ? "bg-slate-950/20 text-slate-950" : "bg-[#f97316] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="my-2 border-t border-slate-800/60" />

              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-semibold"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-orange-400" : "text-slate-400"} />
                    <span className="text-sm">{item.label}</span>
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
