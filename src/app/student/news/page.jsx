"use client";

import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { isToday, isYesterday, isThisWeek, format } from "date-fns";
import {
  Newspaper,
  BookOpen,
  Users,
  Sparkles,
  FolderOpen,
  Calendar,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Video,
  X,
  ExternalLink
} from "lucide-react";
import PageHeader from "@/components/layouts/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/common/Loader";
import useDashboard from "@/hooks/queries/student/useDashboard";
import { getCalendarEvents } from "@/services/calendar.service";

const PAGE_SIZE = 10;

const CATEGORY_TABS = [
  { key: "ALL", label: "All Updates" },
  { key: "COURSE", label: "Course Updates" },
  { key: "BATCH", label: "Batch Updates" },
  { key: "PLATFORM", label: "Announcements" },
];

const RECENT_LABELS = new Set(["Today", "Yesterday", "This Week", "Upcoming"]);

function getGroupLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (date.getTime() > Date.now()) return "Upcoming";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "This Week";
  return format(date, "MMMM yyyy");
}

function LoadMoreSentinel({ onVisible }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div ref={ref} className="flex items-center gap-3 sm:gap-4 py-3">
      <span className="w-[17px] sm:w-[21px] shrink-0" aria-hidden="true" />
      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Loading more…</span>
    </div>
  );
}

function NewsCard({ item, onOpen }) {
  return (
    <div className="relative flex items-start gap-3 sm:gap-4 pb-3">
      <span
        aria-hidden="true"
        className="relative z-10 mt-5 sm:mt-6 h-[17px] w-[17px] sm:h-[21px] sm:w-[21px] shrink-0 rounded-full border-2 border-orange-500 bg-[#080B11]"
      />
      <div
        onClick={() => onOpen(item)}
        className="flex-1 min-w-0 rounded-2xl border border-card-border bg-card p-4 hover:border-slate-700 transition duration-200 cursor-pointer group shadow-sm hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${item.badgeColor}`}>
            {item.categoryLabel}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <Calendar size={11} className="text-slate-500" />
            {item.timestamp}
          </span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
          {item.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {item.summary}
        </p>

        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-300 border-t border-slate-800/60 pt-2.5">
          <FolderOpen size={13} className="text-orange-400 shrink-0" />
          <span className="truncate">{item.courseTag}</span>
        </div>

        <div className="pt-2.5 mt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold">
          <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">
            Click for details
          </span>
          <Link
            href={item.actionLink}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition text-[11px] font-black uppercase tracking-wider"
          >
            <span>START</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeedRow({ row, onOpenNews, onExpandOlder }) {
  if (row.type === "header") {
    return (
      <div className="flex items-center gap-3 sm:gap-4 pt-4 pb-1.5 first:pt-0">
        <span className="w-[17px] sm:w-[21px] shrink-0" aria-hidden="true" />
        <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-500">{row.label}</h2>
      </div>
    );
  }

  if (row.type === "olderToggle") {
    return (
      <div className="flex items-center gap-3 sm:gap-4 py-2">
        <span className="w-[17px] sm:w-[21px] shrink-0" aria-hidden="true" />
        <button
          type="button"
          onClick={onExpandOlder}
          className="flex-1 min-w-0 flex items-center justify-center gap-2 rounded-xl border border-dashed border-card-border py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-orange-400 hover:border-slate-700 transition cursor-pointer"
        >
          <span>Show Older Updates ({row.count})</span>
          <ChevronDown size={13} />
        </button>
      </div>
    );
  }

  if (row.type === "loadMoreSentinel") {
    return <LoadMoreSentinel onVisible={row.onVisible} />;
  }

  return <NewsCard item={row.data} onOpen={onOpenNews} />;
}

export default function StudentNewsPage() {
  const [activeCategory, setActiveCategory] = useState("ALL"); // 'ALL', 'COURSE', 'BATCH', 'PLATFORM'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [visibleRecentCount, setVisibleRecentCount] = useState(PAGE_SIZE);
  const [olderExpanded, setOlderExpanded] = useState(false);
  const [visibleOlderCount, setVisibleOlderCount] = useState(PAGE_SIZE);

  const tabScrollRef = useRef(null);
  const listContainerRef = useRef(null);
  const listOffsetRef = useRef(0);

  // Real backend queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar_events"],
    queryFn: getCalendarEvents,
    staleTime: 1000 * 60 * 5,
  });

  const enrolledCourses = dashboardData?.enrolledCoursesList ?? [];

  // Generate dynamic + curated news feed related to student's courses and batches
  const newsItems = useMemo(() => {
    const now = new Date();
    const todayFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const makeDate = (daysAgo, hours, minutes) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const feed = [
      {
        id: "news-1",
        category: "COURSE",
        categoryLabel: "Course Update",
        title: "New Module Added: Advanced Microservices with Spring Cloud",
        summary: "We have released 4 new video lessons and 2 practical lab assignments for the Spring Boot & Microservices module.",
        content: "We are excited to announce a major course update! The 'Advanced Microservices with Spring Cloud' module is now live in your enrolled Java Full Stack curriculum. It covers API Gateways, Eureka Service Discovery, and Resilience4j Fault Tolerance with hands-on code labs.",
        timestamp: `${todayFormatted} • 09:30 AM`,
        date: makeDate(0, 9, 30),
        badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        courseTag: enrolledCourses[0]?.course?.title || "Java Full Stack LR-01",
        actionLink: enrolledCourses[0] ? `/student/learn/${enrolledCourses[0].courseId}` : "/student/my-courses",
        actionLabel: "Start New Module",
        icon: BookOpen,
      },
      {
        id: "news-2",
        category: "BATCH",
        categoryLabel: "Batch Alert",
        title: "Weekend Live Doubt Solving Session Scheduled",
        summary: "Special live Q&A session with Senior Instructor regarding System Design and Data Structures.",
        content: "Attention all students in Active Batches! A live interactive doubt-clearing session has been scheduled for this Saturday at 4:00 PM IST. Please bring your project questions and assignment queries. Meeting link is active in your Live Classes section.",
        timestamp: `${todayFormatted} • 08:00 AM`,
        date: makeDate(0, 8, 0),
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        courseTag: "Batch LR-01 Live Class",
        actionLink: "/student/live-classes",
        actionLabel: "View Live Schedule",
        icon: Video,
      },
      {
        id: "news-3",
        category: "PLATFORM",
        categoryLabel: "Platform News",
        title: "Interactive AI Quiz Generator & Performance Analytics 2.0",
        summary: "Students can now generate custom practice quizzes by topic and track detailed speed metrics.",
        content: "Orange Tree LMS has launched Self-Generate Quiz feature! You can now select any category or difficulty level to test your knowledge with instant AI feedback, detailed answer explanations, and automated progress reports.",
        timestamp: "Yesterday • 04:15 PM",
        date: makeDate(1, 16, 15),
        badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        courseTag: "New Platform Feature",
        actionLink: "/student/quizzes",
        actionLabel: "Try Self Quiz",
        icon: Sparkles,
      },
      {
        id: "news-4",
        category: "COURSE",
        categoryLabel: "Course Update",
        title: "React 19 & Next.js App Router Masterclass Content Refreshed",
        summary: "Updated code repositories, React Server Components exercises, and Turbopack build guidelines.",
        content: "All source code examples in the Frontend Architecture section have been updated to support React 19 and Next.js 16 Edge runtime patterns. Re-download project resources from your course lesson view.",
        timestamp: "2 days ago",
        date: makeDate(2, 12, 0),
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        courseTag: "Frontend Engineering",
        actionLink: "/student/my-courses",
        actionLabel: "View Course Assets",
        icon: BookOpen,
      },
      {
        id: "news-5",
        category: "BATCH",
        categoryLabel: "Batch Alert",
        title: "Upcoming Project Review Deadline & Mock Interview Drive",
        summary: "Batch LR-01 capstone submission deadline is approaching. Placement mock interviews start next week.",
        content: "Please ensure your capstone assignments are submitted prior to the upcoming Sunday midnight deadline. Mock technical interviews with industry mentors will begin next Monday. Check your calendar for individual interview slots.",
        timestamp: "3 days ago",
        date: makeDate(3, 12, 0),
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        courseTag: "Placement Drive",
        actionLink: "/student/assignments",
        actionLabel: "Check Assignments",
        icon: Users,
      },
    ];

    // Inject any live calendar events as daily batch updates
    if (calendarEvents && calendarEvents.length > 0) {
      calendarEvents.slice(0, 2).forEach((event, idx) => {
        const parsedDate = new Date(event.date);
        feed.push({
          id: `cal-news-${idx}`,
          category: "BATCH",
          categoryLabel: "Batch Schedule",
          title: `Upcoming Scheduled Session: ${event.title}`,
          summary: `Scheduled event on ${event.date} (${event.startTime || "All Day"}). ${event.courseName || "Course Schedule"}.`,
          content: `Your batch has a scheduled session '${event.title}' on ${event.date} starting at ${event.startTime || "the specified time"}. Make sure to join on time!`,
          timestamp: `Scheduled for ${event.date}`,
          date: Number.isNaN(parsedDate.getTime()) ? now : parsedDate,
          badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          courseTag: event.courseName || "Batch Event",
          actionLink: "/student/calendar",
          actionLabel: "Open Calendar",
          icon: Calendar,
        });
      });
    }

    return feed;
  }, [enrolledCourses, calendarEvents]);

  // Filtered feed based on active tab & search query
  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseTag.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [newsItems, activeCategory, searchQuery]);

  // Split into "recent" (always visible) vs "older" (collapsed behind a toggle)
  const { recentItems, olderItems } = useMemo(() => {
    const recent = [];
    const older = [];
    for (const item of filteredNews) {
      const groupLabel = getGroupLabel(item.date);
      (RECENT_LABELS.has(groupLabel) ? recent : older).push({ ...item, groupLabel });
    }
    return { recentItems: recent, olderItems: older };
  }, [filteredNews]);

  // Reset pagination whenever the filtered set changes
  useEffect(() => {
    setVisibleRecentCount(PAGE_SIZE);
    setOlderExpanded(false);
    setVisibleOlderCount(PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  const loadMoreRecent = useCallback(() => {
    setVisibleRecentCount((c) => Math.min(c + PAGE_SIZE, recentItems.length));
  }, [recentItems.length]);

  const loadMoreOlder = useCallback(() => {
    setVisibleOlderCount((c) => Math.min(c + PAGE_SIZE, olderItems.length));
  }, [olderItems.length]);

  const expandOlder = useCallback(() => setOlderExpanded(true), []);

  // Flatten into virtualizer rows: date headers, cards, the "older" toggle, and load-more sentinels
  const rows = useMemo(() => {
    const out = [];
    let lastLabel = null;

    for (const item of recentItems.slice(0, visibleRecentCount)) {
      if (item.groupLabel !== lastLabel) {
        out.push({ type: "header", id: `h-${item.groupLabel}`, label: item.groupLabel });
        lastLabel = item.groupLabel;
      }
      out.push({ type: "item", id: item.id, data: item });
    }

    if (recentItems.length > visibleRecentCount) {
      out.push({ type: "loadMoreSentinel", id: "sentinel-recent", onVisible: loadMoreRecent });
    }

    if (olderItems.length > 0) {
      if (!olderExpanded) {
        out.push({ type: "olderToggle", id: "older-toggle", count: olderItems.length });
      } else {
        let lastOlderLabel = null;
        for (const item of olderItems.slice(0, visibleOlderCount)) {
          if (item.groupLabel !== lastOlderLabel) {
            out.push({ type: "header", id: `h-older-${item.groupLabel}`, label: item.groupLabel });
            lastOlderLabel = item.groupLabel;
          }
          out.push({ type: "item", id: item.id, data: item });
        }
        if (olderItems.length > visibleOlderCount) {
          out.push({ type: "loadMoreSentinel", id: "sentinel-older", onVisible: loadMoreOlder });
        }
      }
    }

    return out;
  }, [recentItems, olderItems, visibleRecentCount, olderExpanded, visibleOlderCount, loadMoreRecent, loadMoreOlder]);

  useLayoutEffect(() => {
    listOffsetRef.current = listContainerRef.current?.offsetTop ?? 0;
  });

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: (index) => {
      const row = rows[index];
      if (!row) return 0;
      if (row.type === "header") return 32;
      if (row.type === "olderToggle") return 52;
      if (row.type === "loadMoreSentinel") return 44;
      return 190;
    },
    overscan: 6,
    gap: 12,
    scrollMargin: listOffsetRef.current,
  });

  const scrollTabs = (direction) => {
    tabScrollRef.current?.scrollBy({ left: direction * 140, behavior: "smooth" });
  };

  if (isDashboardLoading) return <Loader />;

  return (
    <div className="space-y-4 pb-16 animate-fade-in duration-300">
      <PageHeader
        title="News & Updates"
        subtitle="Stay informed with real-time course updates, batch announcements, live session alerts, and platform feature releases."
      />

      {/* Control Bar: Categories & Search */}
      <div className="space-y-3">
        {/* Quick Action Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scrollTabs(-1)}
            aria-label="Scroll tabs left"
            className="shrink-0 p-1 text-slate-500 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={tabScrollRef}
            className="flex items-center gap-7 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-2"
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={`shrink-0 snap-start whitespace-nowrap text-sm font-semibold pb-1.5 border-b-2 transition cursor-pointer ${
                  activeCategory === tab.key
                    ? "text-orange-400 border-orange-500"
                    : "text-white border-transparent hover:text-orange-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollTabs(1)}
            aria-label="Scroll tabs right"
            className="shrink-0 p-1 text-slate-500 hover:text-white transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search news & updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-card-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition"
          />
        </div>
      </div>

      {/* News Feed Timeline */}
      {filteredNews.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No News Items Found"
          description={
            searchQuery
              ? `No updates match "${searchQuery}". Try searching for another course or category.`
              : "Check back later for fresh daily course updates and batch news."
          }
        />
      ) : (
        <div ref={listContainerRef} className="relative max-w-3xl mx-auto md:mx-0 w-full">
          <div style={{ height: rowVirtualizer.getTotalSize(), width: "100%", position: "relative" }}>
            <span
              aria-hidden="true"
              className="absolute left-[8px] sm:left-[10px] top-0 bottom-0 w-px bg-slate-800"
            />
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                  }}
                >
                  <FeedRow row={row} onOpenNews={setSelectedNews} onExpandOlder={expandOlder} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* News Detail Modal Overlay */}
      {selectedNews && (
        <div
          onClick={() => setSelectedNews(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-card-border bg-card p-5 sm:p-6 shadow-2xl space-y-4 relative text-left"
          >
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${selectedNews.badgeColor}`}>
                {selectedNews.categoryLabel}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {selectedNews.timestamp}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <FolderOpen size={14} className="shrink-0" />
              <span>{selectedNews.courseTag}</span>
            </div>

            <h2 className="text-lg font-black text-white leading-tight">
              {selectedNews.title}
            </h2>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-card-border text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{selectedNews.content}</p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <Link href={selectedNews.actionLink}>
                <button className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer">
                  <span>{selectedNews.actionLabel}</span>
                  <ExternalLink size={13} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
