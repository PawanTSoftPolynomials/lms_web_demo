"use client";

import { useMemo, useState } from "react";
import { Folder, Code, Terminal, Layers, BookOpen, ChevronRight } from "lucide-react";
import { useLandingData } from "@/hooks/queries/useLandingData";
import Eyebrow from "@/components/ui/Eyebrow";

const CATEGORY_ICONS = {
  Development: Code,
  Engineering: Terminal,
  Design: Layers,
  "Entrance Exam": Folder,
  General: BookOpen,
};

export default function CategoryExplorer() {
  const { data, isLoading } = useLandingData();
  const allCourses = useMemo(() => data?.courses ?? [], [data]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Derive categories dynamically from actual courses
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
    <section id="categories" className="scroll-mt-20 py-12 lg:py-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
        <div>
          <Eyebrow>Category Navigation</Eyebrow>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Explore Learning Domains
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Structured course tracks grouped by subject area and skill domain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          type="button"
          onClick={() => setSelectedCategory("All")}
          className={`flex flex-col justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            selectedCategory === "All"
              ? "border-primary bg-primary/10 text-primary shadow-xs"
              : "border-border bg-card text-foreground hover:border-border-strong hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`p-2 rounded-xl ${selectedCategory === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <BookOpen size={18} />
            </span>
            <ChevronRight size={14} className="opacity-60" />
          </div>
          <div>
            <h3 className="text-sm font-bold truncate">All Subjects</h3>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              {isLoading ? "..." : `${allCourses.length} ${allCourses.length === 1 ? "Course" : "Courses"}`}
            </p>
          </div>
        </button>

        {categoriesList.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Folder;
          const count = categoryStats[cat] || 0;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-card text-foreground hover:border-border-strong hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon size={18} />
                </span>
                <ChevronRight size={14} className="opacity-60" />
              </div>
              <div>
                <h3 className="text-sm font-bold truncate">{cat}</h3>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  {isLoading ? "..." : `${count} ${count === 1 ? "Course" : "Courses"}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
