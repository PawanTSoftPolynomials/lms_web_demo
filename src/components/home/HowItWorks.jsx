import { Search, BookOpen, ClipboardCheck, Award } from "lucide-react";

import Eyebrow from "@/components/ui/Eyebrow";

const STEPS = [
  {
    step: "01",
    title: "Discover",
    icon: Search,
    description: "Browse published courses and find the one that matches what you want to learn.",
  },
  {
    step: "02",
    title: "Learn",
    icon: BookOpen,
    description: "Work through structured modules and lessons built by real instructors.",
  },
  {
    step: "03",
    title: "Practice",
    icon: ClipboardCheck,
    description: "Test what you've learned with quizzes, and keep improving.",
  },
  {
    step: "04",
    title: "Complete",
    icon: Award,
    description: "Finish the course and earn a certificate — proof of what you've learned.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mb-12 flex flex-col items-center text-center">
        <Eyebrow>How It Works</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          From discovery to certificate, in four steps
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Orange Tree is more than a course catalog — it's a complete
          learning journey from your first search to your last quiz.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-11 right-0 left-0 hidden h-px bg-border lg:block"
        />

        {STEPS.map((item) => (
          <div
            key={item.step}
            className="relative flex flex-col items-center rounded-2xl border border-card-border bg-card p-6 text-center shadow-luxury-sm transition-shadow duration-300 hover:shadow-luxury-md"
          >
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <item.icon size={22} />
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-black text-accent-foreground">
                {item.step}
              </span>
            </span>

            <h3 className="mt-4 text-lg font-bold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
