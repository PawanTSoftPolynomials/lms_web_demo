"use client";

import Link from "next/link";

export default function QuickActionButton({ href, icon: Icon, label, color, bg }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-card border border-border py-3 min-h-[44px] active:scale-95 transition"
    >
      <div className={`h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
        <Icon size={15} className={color} />
      </div>
      <span className="text-[10px] font-bold text-foreground">{label}</span>
    </Link>
  );
}
