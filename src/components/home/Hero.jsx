"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, ClipboardCheck, TrendingUp, Award, CheckCircle2, Users, Star } from "lucide-react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { useLandingData } from "@/hooks/queries/useLandingData";
import { getDisplayUrl } from "@/lib/blob";

const PATH_STEPS = [
  { icon: BookOpen, label: "Structured course modules" },
  { icon: ClipboardCheck, label: "Practice with quizzes" },
  { icon: TrendingUp, label: "Progress tracked in real time" },
];

function DecorativeGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-4 h-24 w-24 rounded-full bg-accent/60 blur-2xl sm:h-32 sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl"
      />
    </>
  );
}

// Real-data spotlight: the most recently published course, presented as a
// featured-course preview card rather than an abstract mockup. Links to the
// same public course-detail route the Featured Courses grid uses below.
function FeaturedCourseSpotlight({ course, studentsCount }) {
  const isLogo = course.thumbnailUrl && (
    course.thumbnailUrl.includes("gstatic.com") ||
    course.thumbnailUrl.includes("miro.medium.com") ||
    course.thumbnailUrl.includes("logo") ||
    course.thumbnailUrl.includes("brand")
  );

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <DecorativeGlow />

      {Number.isFinite(studentsCount) && studentsCount > 0 && (
        <div
          aria-hidden="true"
          className="absolute -top-4 -left-4 z-10 hidden items-center gap-2 rounded-2xl border border-card-border bg-card px-3.5 py-2.5 shadow-luxury-sm sm:flex"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users size={15} />
          </span>
          <div>
            <p className="text-sm font-black leading-none text-foreground">{studentsCount}+</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Learners</p>
          </div>
        </div>
      )}

      <Link
        href={`/courses/${course.id}`}
        className="group relative block overflow-hidden rounded-3xl border border-card-border bg-card shadow-luxury-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnailUrl ? (
            <Image
              src={getDisplayUrl(course.thumbnailUrl)}
              alt={`${course.title} thumbnail`}
              fill
              unoptimized
              className={`motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105 ${isLogo ? "object-contain p-8" : "object-cover"}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/20">
              <span className="text-5xl" aria-hidden="true">📚</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
            Featured Course
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold leading-snug text-foreground line-clamp-1">
            {course.title}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            {course.category && <span>{course.category}</span>}
            {course.rating && (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {Number(course.rating).toFixed(1)}
              </span>
            )}
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            View Course
            <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </Link>
    </div>
  );
}

// Fallback when there's no real course data yet (still loading failed, or
// none published) — a purely conceptual learning-path panel, no invented
// numbers or claims, just the real capabilities the platform offers.
function LearningPathFallback() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <DecorativeGlow />

      <div className="relative rounded-3xl border border-card-border bg-card p-6 shadow-luxury-md sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-label uppercase tracking-wider text-muted-foreground">Your Learning Path</span>
          <Award size={18} className="text-primary" />
        </div>

        <ol className="mt-5 space-y-4">
          {PATH_STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon size={16} />
              </span>
              <span className="text-sm font-semibold text-foreground">{step.label}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Certificate on completion</p>
            <p className="text-xs text-muted-foreground">Awarded once every module is finished</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroVisualSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-card-border bg-card shadow-luxury-md lg:mx-0">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function Hero() {
  const { data, isLoading } = useLandingData();
  const spotlightCourse = data?.courses?.[0];
  const studentsCount = data?.stats?.students;

  return (
    <section className="flex min-h-[70vh] items-center py-16 sm:py-20">
      <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Content */}
        <div>
          <Eyebrow>Modern Learning Platform</Eyebrow>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Learn Faster.
            <br />
            Build Skills.
            <br />
            <span className="text-primary">Grow Your Career.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Courses, quizzes, and progress tracking on one connected path —
            from your first lesson to a certificate you can show for it.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">Get Started</Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="#courses">Explore Courses</Link>
            </Button>
          </div>
        </div>

        {/* Right Visual */}
        {isLoading ? (
          <HeroVisualSkeleton />
        ) : spotlightCourse ? (
          <FeaturedCourseSpotlight course={spotlightCourse} studentsCount={studentsCount} />
        ) : (
          <LearningPathFallback />
        )}
      </div>
    </section>
  );
}
