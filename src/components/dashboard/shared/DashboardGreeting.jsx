"use client";

import { HiOutlineSparkles } from "react-icons/hi2";

export default function DashboardGreeting({
  name = "User",
  role = "User",
  subtitle = "",
}) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-gradient-to-br
        from-orange-500/15
        via-orange-500/5
        to-slate-900
        p-6
        shadow-xl
        backdrop-blur-md
      "
    >
      {/* Background Glow */}
      <div
        className="
          absolute
          -right-10
          -top-10
          h-40
          w-40
          rounded-full
          bg-orange-500/10
          blur-3xl
        "
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-orange-500/15
              text-orange-400
            "
          >
            <HiOutlineSparkles className="text-3xl" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              {greeting}, <span className="text-orange-400">{name}</span>
            </h1>

            <p className="mt-2 text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <span
            className="
              rounded-full
              border
              border-orange-500/20
              bg-orange-500/10
              px-4
              py-1
              text-sm
              font-medium
              text-orange-400
            "
          >
            {role}
          </span>

          <span className="text-sm text-slate-400">{date}</span>
        </div>
      </div>
    </div>
  );
}
