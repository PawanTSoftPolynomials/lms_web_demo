"use client";

import { Award } from "lucide-react";
import { useLandingData } from "@/hooks/queries/useLandingData";
import Eyebrow from "@/components/ui/Eyebrow";

// A dedicated "outcome" scene — completion and the certificate it earns you,
// presented as the payoff of the learning story, not another feature card.
// The badge below is deliberately abstract/iconographic (never a mocked-up
// document) so it can't be mistaken for a real certificate screenshot.
export default function OutcomeSection() {
  const { data } = useLandingData();
  const certificates = data?.stats?.certificates;

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 left-1/2 w-screen -translate-x-1/2 bg-surface" />
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[-1px] h-8 sm:h-12 lg:h-16 w-full text-background"
      >
        <path d="M0,80 L0,40 C360,-10 500,90 900,50 C1150,25 1300,55 1440,40 L1440,80 Z" fill="currentColor" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <Eyebrow>Outcome</Eyebrow>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
            Finish what you start.
          </h2>
          <p className="mt-4 max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
            Complete every lesson in a course and Orange Tree issues your certificate
            automatically — a real record of what you finished, on completion.
          </p>
          {Number.isFinite(certificates) && (
            <p className="mt-6 text-2xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="font-display text-lg text-foreground">{certificates}</span> certificates issued so far
            </p>
          )}
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative flex h-52 w-52 sm:h-64 sm:w-64 items-center justify-center rounded-full border border-primary/20">
            <div className="absolute inset-5 rounded-full border border-dashed border-primary/25" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]" />
            <span className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Award size={36} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
