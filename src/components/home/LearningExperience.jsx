"use client";

import { Award, BookOpen, Check, ClipboardCheck, PlayCircle, TrendingUp } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

// One unified panel, not five equal cards — each stage is a column inside
// the same object, sharing one border/shadow. The last stage (the outcome)
// is visually dominant; the rest are quieter supporting steps.
const STAGES = [
  {
    id: "learn",
    label: "Learn",
    icon: BookOpen,
    subtitle: "Structured lessons",
    visual: (
      <div className="space-y-1.5 rounded-lg bg-muted/60 p-2.5">
        <div className="flex items-center gap-1.5 text-2xs text-foreground">
          <Check size={11} className="shrink-0 text-emerald-500" />
          <span className="truncate">Module 1 · Basics</span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs font-semibold text-primary">
          <PlayCircle size={11} className="shrink-0" />
          <span className="truncate">Module 2 · Core</span>
        </div>
      </div>
    ),
  },
  {
    id: "practice",
    label: "Practice",
    icon: ClipboardCheck,
    subtitle: "Topic quizzes",
    visual: (
      <div className="space-y-1 rounded-lg bg-muted/60 p-2.5">
        <p className="truncate text-2xs font-semibold text-foreground">Which keyword defines a class?</p>
        <span className="block truncate rounded-md bg-primary/10 px-2 py-1 text-2xs font-semibold text-primary">
          class
        </span>
      </div>
    ),
  },
  {
    id: "assess",
    label: "Assess",
    icon: Check,
    subtitle: "Instant results",
    visual: (
      <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check size={13} />
        </span>
        <p className="text-2xs font-bold text-emerald-600 dark:text-emerald-400">Passed</p>
      </div>
    ),
  },
  {
    id: "track",
    label: "Track",
    icon: TrendingUp,
    subtitle: "Real progress",
    visual: (
      <div className="space-y-1.5 rounded-lg bg-muted/60 p-2.5">
        <p className="text-2xs font-semibold text-foreground">Course progress</p>
        <span className="block h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-2/3 rounded-full bg-emerald-500" />
        </span>
      </div>
    ),
  },
];

export default function LearningExperience() {
  return (
    <section id="experience" className="scroll-mt-20 relative py-20 sm:py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 left-1/2 w-screen -translate-x-1/2 bg-[radial-gradient(ellipse_60%_45%_at_50%_15%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%)]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 max-w-2xl mx-auto text-center">
          <Eyebrow>Why Orange Tree</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            One connected learning story.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Every course moves the same way — from your first lesson to a certificate you&apos;ve earned.
          </p>
        </div>

        {/* One unified object, not five separate cards */}
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_1fr_1fr_1fr_1.3fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="p-5 sm:p-6 flex flex-col">
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{stage.label}</h3>
                  <p className="mb-3 text-2xs text-muted-foreground">{stage.subtitle}</p>
                  <div className="mt-auto">{stage.visual}</div>
                </div>
              );
            })}

            {/* Achieve — the dominant, culminating column */}
            <div className="p-6 sm:p-8 flex flex-col justify-center bg-primary/5">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Award size={22} />
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black text-foreground">Achieve</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Finish the course and your certificate is issued automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
