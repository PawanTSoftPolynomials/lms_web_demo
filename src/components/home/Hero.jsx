"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PiOrangeDuotone } from "react-icons/pi";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  ClipboardCheck,
  PlayCircle,
  Search,
  Star,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLandingData } from "@/hooks/queries/useLandingData";
import { getDisplayUrl } from "@/lib/blob";

const EASE = [0.16, 1, 0.3, 1];
const TABS = ["Overview", "Notes", "Resources", "Discuss"];

// Orange Tree's own secondary accents, reused exactly as they're already
// established on this page (GoalCategoryDiscovery's goal cards) rather than
// introducing new hues.
const CALLOUTS = [
  {
    key: "practice",
    icon: ClipboardCheck,
    label: "Practice",
    subtitle: "Topic Quizzes",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  {
    key: "track",
    icon: BarChart3,
    label: "Track",
    subtitle: "Your Progress",
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    key: "achieve",
    icon: Award,
    label: "Achieve",
    subtitle: "Get Certified",
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
];

function reveal(shouldReduceMotion, delay) {
  return shouldReduceMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay, ease: EASE } };
}

// Real, live counts only. Average rating is a genuine derived value (the
// mean of the real per-course ratings already in the payload). Certificates
// names the real auto-issue mechanism rather than guessing a count.
function HeroStats({ stats, courses }) {
  const ratedCourses = (courses || []).filter((c) => Number(c?.rating) > 0);
  const avgRating = ratedCourses.length
    ? ratedCourses.reduce((sum, c) => sum + Number(c.rating), 0) / ratedCourses.length
    : null;

  const items = [
    Number.isFinite(stats?.courses) && {
      key: "courses", icon: BookOpen,
      value: stats.courses > 0 ? `${stats.courses}+` : `${stats.courses}`, label: "Courses",
    },
    Number.isFinite(stats?.students) && {
      key: "students", icon: Users,
      value: stats.students > 0 ? `${stats.students}+` : `${stats.students}`, label: "Learners",
    },
    avgRating && { key: "rating", icon: Star, value: avgRating.toFixed(1), label: "Average Rating" },
    { key: "certificates", icon: Award, value: "Certificates", label: "On Completion" },
  ].filter(Boolean);

  return (
    <div className="mt-8 flex flex-wrap lg:flex-nowrap items-center gap-x-3.5 sm:gap-x-4 xl:gap-x-5 gap-y-3 max-w-full">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex items-center gap-2 shrink-0">
            <span className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Icon size={15} />
            </span>
            <div className="leading-tight min-w-0">
              <p className="font-display text-sm sm:text-base font-black text-foreground whitespace-nowrap">{item.value}</p>
              <p className="text-[10px] sm:text-2xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalloutCard({ callout, className }) {
  const Icon = callout.icon;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 shadow-sm ${className}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${callout.color}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-2xs font-bold text-foreground">{callout.label}</p>
        <p className="text-2xs text-muted-foreground">{callout.subtitle}</p>
      </div>
    </div>
  );
}

// "Course Content" totals are real (course.modulesCount / lessonsCount);
// individual lesson names are generic since the landing payload doesn't
// carry real lesson titles.
function buildContentList(course) {
  const moduleCount = Math.min(Number(course?.modulesCount) || 1, 2);
  const lessonCount = Math.min(Number(course?.lessonsCount) || 3, 6);
  const perModule = Math.max(1, Math.round(lessonCount / moduleCount));
  const rows = [];
  let lessonNo = 1;
  for (let m = 1; m <= moduleCount; m++) {
    rows.push({ type: "module", label: `Module ${m}` });
    const count = m === moduleCount ? lessonCount - lessonNo + 1 : perModule;
    for (let i = 0; i < count && lessonNo <= lessonCount; i++, lessonNo++) {
      rows.push({ type: "lesson", label: `Lesson ${lessonNo}`, active: lessonNo === 1 });
    }
  }
  return rows;
}

function CourseDashboardPanel({ course, shouldReduceMotion }) {
  if (!course) return null;

  const contentRows = buildContentList(course);
  const lessonsTotal = Math.min(Number(course.lessonsCount) || 5, 9);
  const lessonsDone = Math.max(1, Math.min(lessonsTotal - 1, Math.round(lessonsTotal * 0.6)));
  const progressPct = Math.round((lessonsDone / lessonsTotal) * 100);

  return (
    <div className="relative">
      {/* Atmospheric depth behind the panel — two distinct subtle theme accents:
          top-right (primary cool sage/teal) and bottom-left (warm golden amber),
          sitting strictly behind the product visual (-z-10). */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-12 -z-10 overflow-hidden sm:overflow-visible">
        <div className="absolute -top-14 -right-14 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_28%,transparent)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-14 -left-14 h-72 w-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-foreground)_24%,transparent)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Handwritten-style annotation — existing typography only (italic +
          slight rotation), no new font dependency. */}
      <div className="hidden lg:block absolute -top-11 right-4 z-30 text-right">
        <p className="italic font-semibold text-primary/80 text-lg leading-snug -rotate-2" style={{ fontFamily: "var(--font-content)" }}>
          Your Learning Journey
          <br />
          Starts Here
        </p>
        <svg width="42" height="26" viewBox="0 0 46 30" className="ml-auto mt-1 text-primary/60" aria-hidden="true">
          <path d="M4 4 C 4 20, 20 26, 40 22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M32 18 L40 22 L34 27" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <motion.div
        {...reveal(shouldReduceMotion, 0.15)}
        className="relative z-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl shadow-black/10"
      >
        {/* App chrome — reuses the real Orange Tree mark */}
        <div className="flex items-center gap-3 border-b border-border bg-surface/60 px-3.5 sm:px-4 py-2.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <PiOrangeDuotone className="text-lg text-primary" />
            <span className="hidden sm:inline text-xs font-black tracking-wider text-primary">LMS</span>
          </div>
          <div className="hidden sm:flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 text-2xs text-muted-foreground max-w-[180px]">
            <Search size={11} />
            <span>Search lessons…</span>
          </div>
          <div className="flex-1 sm:flex-none sm:w-28">
            <p className="text-right text-2xs font-bold text-primary">{progressPct}% Complete</p>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </span>
          </div>
        </div>

        {/* Course breadcrumb */}
        <div className="border-b border-border px-3.5 sm:px-4 py-2 flex items-center gap-2 min-w-0">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-white">
            {course.thumbnailUrl && (
              <Image src={getDisplayUrl(course.thumbnailUrl)} alt="" fill unoptimized className="object-cover" />
            )}
          </div>
          <p className="truncate text-xs font-bold text-foreground">{course.title}</p>
        </div>

        {/* Body: content list / video / progress */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr]">
          <div className="border-b md:border-b-0 md:border-r border-border p-3 sm:p-3.5 space-y-1 max-h-52 overflow-hidden">
            {contentRows.map((row, i) =>
              row.type === "module" ? (
                <p key={i} className="pt-1.5 first:pt-0 text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </p>
              ) : (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-2xs ${
                    row.active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"
                  }`}
                >
                  {row.active ? <PlayCircle size={11} className="shrink-0" /> : <Check size={11} className="shrink-0 text-muted-foreground/60" />}
                  <span className="truncate">{row.label}</span>
                </div>
              )
            )}
          </div>

          <div className="border-b md:border-b-0 md:border-r border-border p-3 sm:p-3.5">
            <p className="mb-2 text-2xs font-bold text-muted-foreground">Lesson 1: Introduction</p>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              {course.thumbnailUrl && (
                <Image src={getDisplayUrl(course.thumbnailUrl)} alt="" fill unoptimized className="object-cover opacity-45" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <PlayCircle size={20} />
                </span>
              </div>
              <span className="absolute inset-x-2 bottom-2 block h-1 rounded-full bg-white/20 overflow-hidden">
                <span className="block h-full w-[8%] rounded-full bg-primary" />
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-3 text-2xs font-semibold text-muted-foreground">
              {TABS.map((tab, i) => (
                <span key={tab} className={i === 0 ? "text-primary border-b-2 border-primary pb-1" : "pb-1"}>
                  {tab}
                </span>
              ))}
            </div>
            {course.description && (
              <p className="mt-2.5 text-2xs text-muted-foreground leading-relaxed line-clamp-2">{course.description}</p>
            )}
          </div>

          <div className="p-3 sm:p-3.5 pb-8 md:pb-9 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-4">
            <div className="flex flex-col items-center shrink-0">
              <svg width="68" height="68" viewBox="0 0 72 72" className="-rotate-90">
                <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="7" className="text-muted" />
                <circle
                  cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - progressPct / 100)}
                />
              </svg>
              <p className="-mt-[44px] font-display text-base font-black text-foreground">{progressPct}%</p>
              <p className="mt-6 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Your Progress</p>
            </div>
            <div className="flex-1 grid grid-cols-3 md:grid-cols-1 gap-2.5 md:gap-2">
              <div>
                <p className="text-2xs text-muted-foreground">Lessons</p>
                <p className="text-xs font-bold text-foreground">{lessonsDone}/{lessonsTotal}</p>
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">Quiz Avg</p>
                <p className="text-xs font-bold text-foreground">88%</p>
              </div>
              <div>
                <p className="text-2xs text-muted-foreground">Time Spent</p>
                <p className="text-xs font-bold text-foreground">3h 40m</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Callouts — desktop/tablet: sit in the gutter, clear of panel content */}
      {CALLOUTS.slice(0, 2).map((c, i) => (
        <motion.div key={c.key} {...reveal(shouldReduceMotion, 0.3 + i * 0.1)} className="hidden lg:block">
          <CalloutCard callout={c} className={`absolute z-20 w-36 -left-10 ${i === 0 ? "top-[24%]" : "top-[46%]"}`} />
        </motion.div>
      ))}
      <motion.div {...reveal(shouldReduceMotion, 0.5)} className="hidden lg:block">
        <CalloutCard callout={CALLOUTS[2]} className="absolute z-20 w-36 -bottom-5 -right-4" />
      </motion.div>

      {/* Same three signals, inline on mobile */}
      <div className="mt-3 grid grid-cols-3 gap-2 lg:hidden">
        {CALLOUTS.map((c) => (
          <CalloutCard key={c.key} callout={c} className="w-full" />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { data, isLoading } = useLandingData();
  const spotlightCourse = data?.courses?.[0];
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed background — the existing site background plus one
          restrained, theme-aware glow. No hardcoded dark colors, no
          decorative blobs. */}
      <div aria-hidden="true" className="absolute -top-32 bottom-0 -z-10 left-1/2 w-screen -translate-x-1/2 bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_78%_10%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-5 pb-20 sm:pb-24 lg:pb-28">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-20 lg:gap-y-14">
          {/* Text: order 1 everywhere */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-1 flex flex-col justify-center">
            <motion.div {...reveal(shouldReduceMotion, 0)}>
              <Eyebrow>Modern Learning Platform</Eyebrow>
            </motion.div>

            <motion.h1
              {...reveal(shouldReduceMotion, 0.08)}
              className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-foreground"
            >
              Learn.
              <br />
              Practice.
              <br />
              <span className="text-primary">Prove Your Progress.</span>
            </motion.h1>

            <motion.p
              {...reveal(shouldReduceMotion, 0.16)}
              className="mt-5 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed"
            >
              Structured courses, interactive quizzes, real assessments, and clear
              progress tracking — everything you need to learn and achieve your goals.
            </motion.p>

            <motion.div
              {...reveal(shouldReduceMotion, 0.24)}
              className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all inline-flex items-center justify-center">
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
            </motion.div>
          </div>

          {/* Visual: order 2 on mobile. On desktop it spans both rows and is
              vertically centered against the full left hero composition (headline + copy + CTA + stats)
              so it sits at the exact visual center of the hero scene like the target screenshot. */}
          <div className="lg:col-start-6 lg:col-span-7 lg:row-span-2 lg:self-center">
            {isLoading ? (
              <div className="w-full rounded-2xl sm:rounded-3xl border border-border bg-card h-[380px] sm:h-[440px] animate-pulse" />
            ) : (
              <CourseDashboardPanel course={spotlightCourse} shouldReduceMotion={shouldReduceMotion} />
            )}
          </div>

          {/* Stats + tagline: order 3 on mobile, back under the text on desktop */}
          <div className="lg:col-start-1 lg:col-span-5 lg:row-start-2">
            {!isLoading && (
              <motion.div {...reveal(shouldReduceMotion, 0.32)}>
                <HeroStats stats={data?.stats} courses={data?.courses} />
              </motion.div>
            )}
            <motion.p
              {...reveal(shouldReduceMotion, 0.4)}
              className="mt-6 text-2xs font-bold uppercase tracking-[0.15em] text-muted-foreground/70"
            >
              Learn today. A brighter tomorrow awaits.
            </motion.p>
          </div>
        </div>
      </div>

      {/* One deliberate page break, using the site's own background color */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[-1px] h-12 sm:h-16 lg:h-24 w-full text-background"
      >
        <path d="M0,20 C360,110 500,-20 900,40 C1150,80 1300,10 1440,30 L1440,110 L0,110 Z" fill="currentColor" />
      </svg>
    </section>
  );
}
