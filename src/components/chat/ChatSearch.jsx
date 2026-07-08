"use client";

import { Search } from "lucide-react";

export default function ChatSearch({ value, onChange }) {
  return (
    <div className="border-b border-slate-800/50 p-4 bg-slate-900/20">
      <div className="relative">
        <Search
          size={16}
          className="
          absolute

          left-3.5
          top-1/2

          -translate-y-1/2

          text-slate-400
          transition-colors
          group-focus-within:text-orange-500
          "
        />

        <input
          value={value}
          onChange={onChange}
          placeholder="Search conversations..."
          className="
          h-10
          w-full

          rounded-xl

          border
          border-slate-800/80

          bg-slate-950/50
          backdrop-blur-sm

          pl-10
          pr-4

          text-xs
          text-white

          outline-none

          placeholder:text-slate-500

          transition-all
          duration-300

          focus:border-orange-500/60
          focus:bg-slate-950
          focus:ring-1
          focus:ring-orange-500/30
          focus:shadow-[0_0_15px_rgba(249,115,22,0.1)]
          "
        />
      </div>
    </div>
  );
}
