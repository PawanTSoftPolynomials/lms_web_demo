"use client";

import { CheckCircle2, Shield, Layers, Award, Sparkles, BookOpen } from "lucide-react";
import Eyebrow from "@/components/ui/Eyebrow";

const CAPABILITIES = [
  {
    title: "Structured Course Hierarchy",
    description: "Every course is organized into clear Modules, Lessons, and Topics for seamless learning flow.",
    icon: Layers,
  },
  {
    title: "Interactive Assessment",
    description: "Real-time quizzes and graded assignments ensure deep comprehension before moving forward.",
    icon: CheckCircle2,
  },
  {
    title: "Automated Certificate Issuance",
    description: "Earn verifiable digital certificates immediately upon completing all course requirements.",
    icon: Award,
  },
  {
    title: "AI-Assisted Content Authoring",
    description: "Instructors generate structured lesson outlines and quiz questions using integrated AI tools.",
    icon: Sparkles,
  },
  {
    title: "Real-Time Progress Tracking",
    description: "Student progress and module completion rates are calculated and saved automatically.",
    icon: Shield,
  },
  {
    title: "Public & Dedicated Learning",
    description: "Access open catalog courses or enrolled student batch portals with direct instructor Q&A.",
    icon: BookOpen,
  },
];

export default function SocialProof() {
  return (
    <section id="features" className="scroll-mt-20 py-12 lg:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <Eyebrow>Platform Capabilities</Eyebrow>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
          Why Learn on Orange Tree LMS?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          A platform built around authentic educational tools, structured content, and verified achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-border-strong hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                <Icon size={20} />
              </span>

              <div>
                <h3 className="text-base font-bold text-foreground mb-1">{cap.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{cap.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
