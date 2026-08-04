"use client";

import Image from "next/image";

export function WelcomeHeroCard({ instructorName = "Instructor" }: { instructorName?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F1A] to-[#12182B] border border-[#1A1F35] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between min-h-[140px]">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-500/10 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-sky-500/10 blur-[40px] pointer-events-none" />

      {/* Left Content */}
      <div className="relative z-10 w-full md:w-2/3 space-y-2">
        <div className="space-y-0.5">
          <p className="text-slate-400 text-xs font-medium">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            {instructorName}! <span className="animate-wave origin-bottom-right inline-block text-xl">👋</span>
          </h1>
        </div>
        
        <div className="mt-2 p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/20 max-w-lg inline-block">
          <p className="text-orange-400 text-xs font-semibold italic">
            "Teaching is the one profession that creates all other professions."
          </p>
        </div>
      </div>

      {/* Right Content - 3D Illustration */}
      <div className="relative z-10 hidden md:flex w-1/3 justify-end items-center">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <Image
            src="/images/instructor_3d.jpg"
            alt="Instructor 3D Illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
