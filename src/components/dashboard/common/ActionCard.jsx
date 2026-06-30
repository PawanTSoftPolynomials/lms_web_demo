"use client";

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

const colorClasses = {
  violet: {
    icon: "bg-violet-500/15 text-violet-400",
    border: "hover:border-violet-500/40",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400",
    border: "hover:border-emerald-500/40",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-400",
    border: "hover:border-blue-500/40",
  },
};

export default function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  color = "violet",
}) {
  const styles = colorClasses[color];

  return (
    <Link
      href={href}
      className={`
        group rounded-2xl
        border border-slate-700/50
        bg-slate-900/60
        p-6
        transition-all duration-300
        hover:-translate-y-1
        ${styles.border}
      `}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-6 flex items-center justify-end text-slate-500 transition group-hover:text-orange-400">
        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}