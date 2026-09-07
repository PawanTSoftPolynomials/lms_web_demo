"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FinalCta() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 left-1/2 w-screen -translate-x-1/2 bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_70%)]"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05]">
          Start learning today.
        </h2>
        <p className="mt-5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
          Choose a course, build your knowledge, and track your progress from your
          first lesson to completion.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto font-bold inline-flex items-center justify-center">
            <Link href="#courses">
              <span>Explore Courses</span>
              <ArrowRight size={15} className="ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto font-bold">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
