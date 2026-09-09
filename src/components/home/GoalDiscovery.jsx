"use client";

import { Target, Sparkles, Award, Zap, ArrowUpRight } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const GOAL_ITEMS = [
  {
    id: "skill",
    title: "Learn a new skill",
    description: "Build job-ready capability through structured, module-based courses taught by real instructors.",
    icon: Target,
    badge: "Foundational",
  },
  {
    id: "knowledge",
    title: "Build practical knowledge",
    description: "Go beyond theoretical concepts with hands-on lesson content, real examples, and structured notes.",
    icon: Sparkles,
    badge: "Hands-on",
  },
  {
    id: "certification",
    title: "Prepare for certification",
    description: "Complete course requirements and earn verifiable certificates to showcase your achievements.",
    icon: Award,
    badge: "Verified",
  },
  {
    id: "practice",
    title: "Practice and improve",
    description: "Test your understanding with quizzes, assignments, and immediate feedback on every topic.",
    icon: Zap,
    badge: "Interactive",
  },
];

export default function GoalDiscovery() {
  return (
    <section id="goals" className="scroll-mt-20 py-12 lg:py-16">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <Eyebrow>Goal-Based Discovery</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          What do you want to achieve?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Choose a goal to guide your learning path on Orange Tree LMS.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {GOAL_ITEMS.map((goal) => {
          const Icon = goal.icon;
          return (
            <div
              key={goal.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-caption font-bold text-muted-foreground">
                    {goal.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {goal.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {goal.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                <span>Explore Path</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
