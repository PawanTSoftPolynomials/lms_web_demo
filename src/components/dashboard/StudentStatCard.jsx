"use client";

import Link from "next/link";

export default function StudentStatCard({ stat, isLoading, variant = "desktop" }) {
  const Icon = stat.icon;

  if (variant === "mobile") {
    return (
      <div className="rounded-xl bg-[#0D1021] border border-[#1A1F35] p-2">
        <div className={`h-6 w-6 rounded-md ${stat.bg} flex items-center justify-center mb-1`}>
          <Icon size={11} className={stat.color} />
        </div>
        {isLoading ? (
          <div className="h-4 w-8 bg-slate-800 rounded animate-pulse" />
        ) : (
          <p className="text-sm font-black text-white leading-none">{stat.value}</p>
        )}
        <p className="text-[8.5px] text-slate-400 font-semibold leading-tight mt-1">{stat.label}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[140px] flex items-center gap-3 rounded-2xl bg-[#0D1021] border border-[#1A1F35] p-3 shadow-sm hover:border-slate-700 transition">
      <div className={`p-2 rounded-xl ${stat.bg} shrink-0`}>
        <Icon size={16} className={stat.color} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">{stat.label}</p>
        {isLoading ? (
          <div className="h-5 w-10 bg-slate-800 rounded animate-pulse mt-1.5" />
        ) : (
          <p className="text-lg font-black text-white leading-none mt-1">{stat.value}</p>
        )}

        {stat.progress !== undefined ? (
          <div className="w-full max-w-[110px] h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${stat.progress}%` }}
            />
          </div>
        ) : stat.href ? (
          <Link href={stat.href} className="text-[9px] font-bold text-orange-400 hover:text-orange-300 transition truncate block mt-1.5">
            {stat.hint} &rarr;
          </Link>
        ) : (
          <p className="text-[9px] text-slate-500 font-medium truncate mt-1.5">{stat.hint}</p>
        )}
      </div>
    </div>
  );
}
