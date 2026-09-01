"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";

import { useLandingData } from "@/hooks/queries/useLandingData";
import FeaturedCourseCard from "@/components/courses/FeaturedCourseCard";
import Eyebrow from "@/components/ui/Eyebrow";

const TABS = [
  { id: "popular", label: "Most Popular" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New Release" },
  { id: "all", label: "All Courses" },
];

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-3.5 space-y-3">
      <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function CourseDiscovery() {
  const { data, isLoading, isError } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const [activeTab, setActiveTab] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = useMemo(() => {
    let result = [...allCourses];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allCourses, searchQuery]);

  return (
    <section id="courses" className="scroll-mt-20 py-6 sm:py-8 lg:py-10 border-t border-border">
      {/* Header & Catalog Link */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
        <div>
          <Eyebrow>Course Catalog</Eyebrow>
          <h2 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Explore Recently Published Courses
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">
            Start learning with verified curriculum, structured modules, and interactive assessments.
          </p>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary hover:text-primary-hover transition shrink-0"
        >
          <span>Full Catalog</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-border sm:border-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : isError || filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-border bg-card/40">
          <BookOpen size={24} className="text-muted-foreground mb-2" />
          <h3 className="text-sm font-bold text-foreground">No courses found</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            {searchQuery
              ? `No published courses match "${searchQuery}".`
              : "No courses published yet. Check back soon for new learning releases."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredCourses.slice(0, 8).map((course) => (
            <FeaturedCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
