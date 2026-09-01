import { Search, BookOpen, ClipboardCheck, TrendingUp, Award, Check } from "lucide-react";

import Eyebrow from "@/components/ui/Eyebrow";

// Every point below maps to a real, existing capability — not invented copy:
// - Discover: /public/landing-data returns category + level + instructor +
//   lessonsCount per course; FeaturedCourses filters by that real category field.
// - Learn: the Course -> Module -> Lesson -> Topic -> Content hierarchy, and
//   course.creator (real instructor), both served by the courses API.
// - Practice: the quizzes and assignments modules (course.quizzes / course.assignments).
// - Track: the progress module + per-lesson completion/lock state computed
//   for enrolled students, and the enrollments relation.
// - Achieve: the certificates module — the same real count shown in PlatformStats.
const JOURNEY = [
  {
    title: "Discover",
    icon: Search,
    description: "Browse published courses and find the one that matches what you want to learn.",
    points: [
      "Browse courses by category",
      "See level, lesson count, and instructor before you start",
    ],
  },
  {
    title: "Learn",
    icon: BookOpen,
    description: "Work through structured modules and lessons built by real instructors.",
    points: [
      "Every course is organized into modules and lessons",
      "Taught by real instructors, not generic content",
    ],
  },
  {
    title: "Practice",
    icon: ClipboardCheck,
    description: "Reinforce what you've learned with quizzes and assignments.",
    points: [
      "Quizzes after lessons check your understanding",
      "Assignments let you apply what you've learned",
    ],
  },
  {
    title: "Track",
    icon: TrendingUp,
    description: "Progress and completion are tracked at every step, automatically.",
    points: [
      "Lesson-by-lesson completion tracking",
      "Enrollment and progress kept for every course",
    ],
  },
  {
    title: "Achieve",
    icon: Award,
    description: "Finish a course and walk away with proof of it.",
    points: [
      "A certificate is issued automatically on completion",
      "A real, countable record of what you've finished",
    ],
  },
];

export default function LearningJourney() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mb-14 max-w-2xl">
        <Eyebrow>The Learning Journey</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          From discovering a course to earning your certificate
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every course on Orange Tree follows the same five-stage path — so
          you always know what's next, and finishing always means something.
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-6 w-px bg-border"
        />

        <ol className="space-y-10">
          {JOURNEY.map((stage, index) => (
            <li key={stage.title} className="relative pl-16">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              >
                <stage.icon size={20} />
              </span>

              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Stage {index + 1}
              </p>
              <h3 className="mt-1 text-xl font-bold text-foreground">{stage.title}</h3>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{stage.description}</p>

              <ul className="mt-3 space-y-1.5">
                {stage.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
