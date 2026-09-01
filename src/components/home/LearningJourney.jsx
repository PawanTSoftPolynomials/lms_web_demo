"use client";

import { Search, BookOpen, ClipboardCheck, TrendingUp, Award, ArrowRight } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const STAGES = [
  {
    step: "01",
    title: "Discover",
    icon: Search,
    subtitle: "Explore Subjects",
    description: "Browse verified course tracks by domain, category, and skill level.",
  },
  {
    step: "02",
    title: "Learn",
    icon: BookOpen,
    subtitle: "Structured Modules",
    description: "Work through lessons, rich content cells, and instructor guides.",
  },
  {
    step: "03",
    title: "Practice",
    icon: ClipboardCheck,
    subtitle: "Interactive Quizzes",
    description: "Reinforce comprehension with topic-level assessments and exercises.",
  },
  {
    step: "04",
    title: "Track",
    icon: TrendingUp,
    subtitle: "Real-time Metrics",
    description: "Monitor lesson completion rates and mastery progress automatically.",
  },
  {
    step: "05",
    title: "Achieve",
    icon: Award,
    subtitle: "Verify Credentials",
    description: "Receive automated course certificates upon completing all requirements.",
  },
];

export default function LearningJourney() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-12 lg:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <Eyebrow>The Learning Flow</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          How Learning Works on Orange Tree
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          A structured 5-stage progression designed to take you from initial curiosity to verified mastery.
        </p>
      </div>

      {/* Desktop Horizontal Progression */}
      <div className="hidden lg:grid grid-cols-5 gap-4 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    STAGE {stage.step}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon size={18} />
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-1">{stage.title}</h3>
                <p className="text-[11px] font-semibold text-primary mb-2">{stage.subtitle}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{stage.description}</p>
              </div>

              {idx < STAGES.length - 1 && (
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-xs">
                  <ArrowRight size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical Timeline */}
      <div className="lg:hidden relative space-y-6 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.step} className="relative pl-14">
              <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-xs">
                <Icon size={20} />
              </span>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xs font-mono font-bold text-primary uppercase">Stage {stage.step}</span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-xs font-semibold text-primary">{stage.subtitle}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{stage.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{stage.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
