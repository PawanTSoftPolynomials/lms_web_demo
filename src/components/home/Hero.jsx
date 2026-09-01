"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ClipboardCheck, TrendingUp, Award, ArrowRight, Layers, PlayCircle, Check, Users, Sparkles, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLandingData } from "@/hooks/queries/useLandingData";
import { getDisplayUrl } from "@/lib/blob";

const HERO_STATES = [
  {
    id: "lesson",
    step: "01",
    title: "Study Lessons & Modules",
    subtitle: "Module 1: Foundations",
    icon: Layers,
    color: "text-primary bg-primary/10 border-primary/20",
  },
  {
    id: "quiz",
    step: "02",
    title: "Practice & Topic Quizzes",
    subtitle: "Topic Assessment",
    icon: ClipboardCheck,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "progress",
    step: "03",
    title: "Real-time Progress Tracking",
    subtitle: "75% Mastery Recorded",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "achievement",
    step: "04",
    title: "Earn Verifiable Certificate",
    subtitle: "Course Completion Award",
    icon: Award,
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

function SequentialProductVisual({ course, studentsCount }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeStateIndex, setActiveStateIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setActiveStateIndex((prev) => (prev + 1) % HERO_STATES.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const currentState = HERO_STATES[shouldReduceMotion ? 3 : activeStateIndex];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg lg:mx-0">
      {/* Layered Background Glow Effects */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

      {/* Floating Badges */}
      <div className="hidden sm:flex items-center gap-1.5 absolute -top-3 -left-3 z-20 px-3 py-1 rounded-full bg-card/90 border border-border shadow-xs backdrop-blur-md text-2xs font-extrabold text-primary">
        <Sparkles size={12} />
        <span>Interactive Learning Studio</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 absolute -bottom-3 -right-3 z-20 px-3 py-1 rounded-full bg-card/90 border border-border shadow-xs backdrop-blur-md text-2xs font-extrabold text-emerald-600 dark:text-emerald-400">
        <ShieldCheck size={12} />
        <span>Verifiable Certificates</span>
      </div>

      {/* Main Elevated Preview Card Enclosure */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Header Strip */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">Product Preview</span>
          </div>
          {Number.isFinite(studentsCount) && studentsCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-2xs font-bold border border-primary/20">
              <Users size={11} />
              <span>{studentsCount}+ Learners Enrolled</span>
            </span>
          )}
        </div>

        {/* Course Banner */}
        {course ? (
          <Link href={`/courses/${course.id}`} className="block group">
            <div className="flex items-center gap-3 p-2.5 rounded-xl sm:rounded-2xl border border-border/80 bg-surface/60 hover:border-primary/40 hover:bg-surface transition-all">
              <div className="relative aspect-video w-16 sm:w-20 shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-muted">
                {course.thumbnailUrl ? (
                  <Image
                    src={getDisplayUrl(course.thumbnailUrl)}
                    alt={course.title || "Course thumbnail"}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/10 text-primary font-bold text-2xs">
                    LMS
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-2xs font-bold uppercase tracking-wider text-primary truncate block">{course.category || "Featured Track"}</span>
                <h3 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition">{course.title}</h3>
                <p className="text-2xs text-muted-foreground mt-0.5 hidden sm:block">Click to explore curriculum →</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-2.5 rounded-xl border border-border bg-muted/30 text-xs font-bold text-foreground">
            Structured Course Architecture
          </div>
        )}

        {/* State Indicator Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {HERO_STATES.map((s, idx) => {
            const isActive = (shouldReduceMotion ? 3 : activeStateIndex) === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStateIndex(idx)}
                className={`py-1 px-1 rounded-lg text-[10px] font-bold transition text-center border cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border/60 bg-surface/70 text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {s.step}
              </button>
            );
          })}
        </div>

        {/* Dynamic Animated State Surface */}
        <div className="min-h-[110px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState.id}
              initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : -6 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              className="w-full p-3.5 rounded-xl sm:rounded-2xl border border-border bg-background shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-2xs font-bold ${currentState.color}`}>
                  <currentState.icon size={13} />
                  <span>{currentState.title}</span>
                </span>
                <span className="text-2xs font-mono font-bold text-muted-foreground">{currentState.subtitle}</span>
              </div>

              {/* State 0: Lessons */}
              {currentState.id === "lesson" && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-card border border-border text-foreground text-2xs">
                    <span className="flex items-center gap-1 truncate">
                      <Check size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">Lesson 1: Introduction</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Passed</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-foreground text-2xs font-semibold">
                    <span className="flex items-center gap-1 truncate">
                      <PlayCircle size={11} className="text-primary shrink-0" />
                      <span className="truncate">Lesson 2: Core Concepts</span>
                    </span>
                    <span className="text-primary font-bold">Active</span>
                  </div>
                </div>
              )}

              {/* State 1: Quiz */}
              {currentState.id === "quiz" && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-foreground space-y-0.5">
                  <p className="font-bold text-xs text-amber-700 dark:text-amber-300">Topic Practice Quiz</p>
                  <p className="text-2xs text-muted-foreground">3 Multiple choice questions • Immediate score evaluation</p>
                </div>
              )}

              {/* State 2: Progress */}
              {currentState.id === "progress" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-2xs font-bold text-foreground">
                    <span>Overall Course Progress</span>
                    <span className="text-emerald-600 dark:text-emerald-400">75% Complete</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[75%]" />
                  </div>
                </div>
              )}

              {/* State 3: Achievement */}
              {currentState.id === "achievement" && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                    <Award size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">Course Completion Certificate</p>
                    <p className="text-2xs text-muted-foreground truncate">Issued automatically upon completion</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { data, isLoading } = useLandingData();
  const spotlightCourse = data?.courses?.[0];
  const studentsCount = data?.stats?.students;

  return (
    <section className="py-6 sm:py-10 lg:py-14">
      <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Content Column */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <Eyebrow>Modern Learning Platform</Eyebrow>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight text-foreground">
            Learn Faster.
            <br />
            Build Skills.
            <br />
            <span className="text-primary">Grow Your Career.</span>
          </h1>

          <p className="max-w-xl text-xs sm:text-base text-muted-foreground leading-relaxed">
            Courses, quizzes, and progress tracking on one connected path — from your first lesson to a certificate you can show for it.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all">
              <Link href="#courses">
                <span>Explore Courses</span>
                <ArrowRight size={15} className="ml-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold bg-card hover:bg-surface border border-border/90 hover:border-primary/50 text-foreground shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all"
            >
              <Link href="/register">Start Learning</Link>
            </Button>
          </div>
        </div>

        {/* Right Visual Column */}
        <div className="lg:col-span-5">
          {isLoading ? (
            <div className="w-full max-w-md mx-auto aspect-square rounded-2xl border border-border bg-card p-5 animate-pulse space-y-3">
              <div className="h-5 w-1/2 bg-muted rounded" />
              <div className="h-20 bg-muted rounded-xl" />
              <div className="h-20 bg-muted rounded-xl" />
            </div>
          ) : (
            <SequentialProductVisual course={spotlightCourse} studentsCount={studentsCount} />
          )}
        </div>
      </div>
    </section>
  );
}
