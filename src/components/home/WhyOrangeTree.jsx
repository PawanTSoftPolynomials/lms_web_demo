import { BookOpen, ClipboardCheck, TrendingUp, Award } from "lucide-react";

import Eyebrow from "@/components/ui/Eyebrow";

const EXPERIENCE = [
  {
    title: "Learn",
    icon: BookOpen,
    description: "Structured courses and lessons, built by real instructors and organized into a clear path.",
  },
  {
    title: "Practice",
    icon: ClipboardCheck,
    description: "Quizzes and assessments after every module, so what you've learned actually sticks.",
  },
  {
    title: "Track",
    icon: TrendingUp,
    description: "Progress and performance visible at every step — never wonder how far along you are.",
  },
  {
    title: "Achieve",
    icon: Award,
    description: "Complete a course and earn a certificate — real proof of what you've accomplished.",
  },
];

export default function WhyOrangeTree() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-14 max-w-2xl">
        <Eyebrow>Why Orange Tree</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          A learning experience, not just a course catalog
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every course on Orange Tree follows the same connected experience —
          so progress always feels visible, and finishing always means something.
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-6 hidden w-px bg-border lg:left-1/2 lg:block"
        />

        <ol className="space-y-10 lg:space-y-0">
          {EXPERIENCE.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <li
                key={item.title}
                className="relative flex items-start gap-5 pl-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pl-0 lg:py-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
                >
                  <item.icon size={20} />
                </span>

                <div
                  className={`rounded-2xl border border-card-border bg-card p-6 shadow-luxury-sm lg:max-w-md ${
                    isEven ? "lg:col-start-1 lg:justify-self-end lg:text-right" : "lg:col-start-2 lg:justify-self-start"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-widest text-primary">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>

                <div aria-hidden="true" className="hidden lg:block" />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
