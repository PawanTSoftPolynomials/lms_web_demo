"use client";

import { useMemo, useState } from "react";
import { Target, Sparkles, Award, Zap, BookOpen, Users, ArrowUpRight } from "lucide-react";
import { useLandingData } from "@/hooks/queries/useLandingData";
import Eyebrow from "@/components/ui/Eyebrow";

const GOAL_ITEMS = [
  { id: "skill", title: "Learn a Skill", desc: "Job-ready course modules", icon: Target, color: "text-primary bg-primary/10" },
  { id: "knowledge", title: "Build Knowledge", desc: "Practical lessons & notes", icon: Sparkles, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { id: "certification", title: "Get Certified", desc: "Verifiable credentials", icon: Award, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10" },
  { id: "practice", title: "Practice & Improve", desc: "Quizzes & topic reviews", icon: Zap, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
];

export default function GoalCategoryDiscovery() {
  const { data } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const stats = data?.stats;
  const [selectedCat, setSelectedCat] = useState("All");

  // Derive categories dynamically from real course data
  const categoryStats = useMemo(() => {
    const counts = {};
    allCourses.forEach((c) => {
      const cat = c.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allCourses]);

  const categoriesList = useMemo(() => {
    const keys = Object.keys(categoryStats);
    if (keys.length === 0) return ["General", "Entrance Exam", "Development"];
    return keys;
  }, [categoryStats]);

  return (
    <section id="discovery" className="scroll-mt-20 py-6 sm:py-8 lg:py-10 border-t border-border">
      {/* Header */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
        <div>
          <Eyebrow>Discovery & Domains</Eyebrow>
          <h2 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            What do you want to learn?
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Explore learning goals and course tracks by subject domain.
          </p>
        </div>

        {/* Tertiary Slim Trust Metrics Row */}
        {stats && (
          <div className="flex items-center gap-3 text-2xs text-muted-foreground border border-border bg-card px-3 py-1.5 rounded-full shadow-2xs shrink-0">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-primary" />
              <strong className="text-foreground">{stats.students || 0}+</strong> Learners
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} className="text-primary" />
              <strong className="text-foreground">{stats.courses || 0}+</strong> Courses
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1">
              <Award size={12} className="text-primary" />
              <strong className="text-foreground">{stats.certificates || 0}+</strong> Certificates
            </span>
          </div>
        )}
      </div>

      {/* Primary Goal Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
        {GOAL_ITEMS.map((goal) => {
          const Icon = goal.icon;
          return (
            <div
              key={goal.id}
              className="group p-3 sm:p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`p-1.5 rounded-lg ${goal.color}`}>
                    <Icon size={14} />
                  </span>
                  <ArrowUpRight size={13} className="text-muted-foreground group-hover:text-primary transition" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition">{goal.title}</h3>
                <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-1">{goal.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Subject Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">Domains:</span>
        <button
          type="button"
          onClick={() => setSelectedCat("All")}
          className={`px-3 py-1 rounded-full text-2xs font-bold transition cursor-pointer shrink-0 ${
            selectedCat === "All"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All Subjects ({allCourses.length})
        </button>

        {categoriesList.map((cat) => {
          const count = categoryStats[cat] || 0;
          const isSelected = selectedCat === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-2xs font-bold transition cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>
    </section>
  );
}
