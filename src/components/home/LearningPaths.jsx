"use client";

import { Compass, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const PATHS = [
  {
    level: "Beginner",
    title: "Foundational Entry",
    description: "Start from scratch with clear intro modules, step-by-step guidance, and core concepts.",
    icon: Compass,
    badge: "Level 1",
    color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  },
  {
    level: "Intermediate",
    title: "Skill Application",
    description: "Deepen understanding with complex topics, practical quizzes, and structured assignments.",
    icon: Zap,
    badge: "Level 2",
    color: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  },
  {
    level: "Advanced",
    title: "Mastery & Expertise",
    description: "Tackle comprehensive course tracks, domain specializations, and final assessments.",
    icon: ShieldCheck,
    badge: "Level 3",
    color: "border-purple-500/30 bg-purple-500/5 text-purple-700 dark:text-purple-400",
  },
];

export default function LearningPaths() {
  return (
    <section id="paths" className="scroll-mt-20 py-12 lg:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <Eyebrow>Structured Progression</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Step-by-Step Skill Progression
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Course content categorized by difficulty to ensure smooth, continuous learning growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PATHS.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.level}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-border-strong hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${path.color}`}>
                    <Icon size={14} />
                    <span>{path.level}</span>
                  </span>
                  <span className="text-2xs font-mono font-bold text-muted-foreground">{path.badge}</span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">{path.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{path.description}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-primary">
                <span>View {path.level} Courses</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
