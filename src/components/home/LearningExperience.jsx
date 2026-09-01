"use client";

import { BookOpen, ClipboardCheck, TrendingUp, Award, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const STAGES = [
  {
    step: "01",
    primary: "Learn",
    icon: BookOpen,
    subtitle: "Structured Curriculum",
    supporting: ["Modules, Lessons & Topics", "Rich Text & Document Cells", "Real Instructor Material"],
  },
  {
    step: "02",
    primary: "Practice",
    icon: Layers,
    subtitle: "Interactive Application",
    supporting: ["Topic Exercises", "Code & Reading Notes", "Concept Reinforcement"],
  },
  {
    step: "03",
    primary: "Assess",
    icon: ClipboardCheck,
    subtitle: "Real-time Feedback",
    supporting: ["Topic Quizzes", "Graded Assignments", "Immediate Evaluation"],
  },
  {
    step: "04",
    primary: "Track",
    icon: TrendingUp,
    subtitle: "Automated Metrics",
    supporting: ["Lesson Completion Rates", "Enrollment Records", "Mastery Progress"],
  },
  {
    step: "05",
    primary: "Achieve",
    icon: Award,
    subtitle: "Verifiable Credential",
    supporting: ["Automated Issuance", "Downloadable Record", "Verified Outcome"],
  },
];

export default function LearningExperience() {
  return (
    <section id="experience" className="scroll-mt-20 py-6 sm:py-8 lg:py-10 border-t border-border">
      <div className="mb-6 text-center max-w-2xl mx-auto">
        <Eyebrow>Learning System</Eyebrow>
        <h2 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Why Orange Tree is Different
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          A connected 5-stage learning progression designed for structured study, instant evaluation, and verified mastery.
        </p>
      </div>

      {/* 5 Connected Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-3.5 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border bg-card shadow-2xs transition-all hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    STAGE {stage.step}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon size={14} />
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground mb-0.5">{stage.primary}</h3>
                <p className="text-2xs font-semibold text-primary mb-2.5">{stage.subtitle}</p>

                <ul className="space-y-1.5 pt-2 border-t border-border/60">
                  {stage.supporting.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {idx < STAGES.length - 1 && (
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-2xs">
                  <ArrowRight size={9} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
