"use client";

import Link from "next/link";

export default function QuickActionButton({ href, icon: Icon, label, color, bg }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#0D1021] border border-[#1A1F35] py-3 min-h-[44px] active:scale-95 transition"
    >
      <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
        <Icon size={15} className={color} />
      </div>
      <span className="text-[10px] font-bold text-slate-300">{label}</span>
    </Link>
  );
}
