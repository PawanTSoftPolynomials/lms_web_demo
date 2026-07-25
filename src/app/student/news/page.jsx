"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Newspaper,
  BookOpen,
  Users,
  Sparkles,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle,
  Video,
  X,
  ExternalLink
} from "lucide-react";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import useDashboard from "@/hooks/queries/student/useDashboard";
import { getCalendarEvents } from "@/services/calendar.service";

export default function StudentNewsPage() {
  const [activeCategory, setActiveCategory] = useState("ALL"); // 'ALL', 'COURSE', 'BATCH', 'PLATFORM'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);

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
    const today = new Date();
    const todayFormatted = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const feed = [
      {
        id: "news-1",
        category: "COURSE",
        categoryLabel: "Course Update",
        title: "New Module Added: Advanced Microservices with Spring Cloud",
        summary: "We have released 4 new video lessons and 2 practical lab assignments for the Spring Boot & Microservices module.",
        content: "We are excited to announce a major course update! The 'Advanced Microservices with Spring Cloud' module is now live in your enrolled Java Full Stack curriculum. It covers API Gateways, Eureka Service Discovery, and Resilience4j Fault Tolerance with hands-on code labs.",
        timestamp: `${todayFormatted} • 09:30 AM`,
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
        feed.push({
          id: `cal-news-${idx}`,
          category: "BATCH",
          categoryLabel: "Batch Schedule",
          title: `Upcoming Scheduled Session: ${event.title}`,
          summary: `Scheduled event on ${event.date} (${event.startTime || "All Day"}). ${event.courseName || "Course Schedule"}.`,
          content: `Your batch has a scheduled session '${event.title}' on ${event.date} starting at ${event.startTime || "the specified time"}. Make sure to join on time!`,
          timestamp: `Scheduled for ${event.date}`,
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

  if (isDashboardLoading) return <Loader />;

  return (
    <div className="space-y-6 pb-16 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Newspaper size={22} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Daily News & Course Updates
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-xl">
            Stay informed with real-time course updates, batch announcements, live session alerts, and platform feature releases.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Total Updates</span>
            <span className="text-base font-black text-orange-400">{newsItems.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">My Courses</span>
            <span className="text-base font-black text-white">{enrolledCourses.length}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategory === "ALL"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => setActiveCategory("COURSE")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeCategory === "COURSE"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen size={13} className="text-orange-400" />
            <span>Course Updates</span>
          </button>
          <button
            onClick={() => setActiveCategory("BATCH")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeCategory === "BATCH"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={13} className="text-blue-400" />
            <span>Batch Schedules</span>
          </button>
          <button
            onClick={() => setActiveCategory("PLATFORM")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeCategory === "PLATFORM"
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>Platform News</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search news & updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition"
          />
        </div>
      </div>

      {/* News Feed Grid */}
      {filteredNews.length === 0 ? (
        <Card className="p-12 text-center border border-slate-800/80 bg-slate-900/40 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Newspaper size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No News Items Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No updates match "${searchQuery}". Try searching for another course or category.`
              : "Check back later for fresh daily course updates and batch news."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNews.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition duration-200 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Card Header row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border ${item.badgeColor}`}>
                      {item.categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock size={11} className="text-slate-500" />
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Course Tag */}
                  <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span>{item.courseTag}</span>
                  </div>

                  {/* News Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Footer Link Button */}
                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="text-[11px] text-slate-400 group-hover:text-white transition-colors">
                    Click for details
                  </span>
                  <Link
                    href={item.actionLink}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition text-[11px] font-black uppercase tracking-wider"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
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
            className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 relative text-left"
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

            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {selectedNews.courseTag}
            </div>

            <h2 className="text-lg font-black text-white leading-tight">
              {selectedNews.title}
            </h2>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
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
