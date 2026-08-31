"use client";

import { Search } from "lucide-react";

export default function ChatSearch({ value, onChange }) {
  return (
    <div className="border-b border-border/50 p-4 bg-background/20">
      <div className="relative">
        <Search
          size={16}
          className="
          absolute

          left-3.5
          top-1/2

          -translate-y-1/2

          text-muted-foreground
          transition-colors
          group-focus-within:text-primary
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
          border-border/80

          bg-background/50
          backdrop-blur-sm

          pl-10
          pr-4

          text-xs
          text-foreground

          outline-none

          placeholder:text-muted-foreground

          transition-all
          duration-300

          focus:border-primary/60
          focus:bg-background
          focus:ring-1
          focus:ring-orange-500/30
          focus:shadow-[0_0_15px_rgba(249,115,22,0.1)]
          "
        />
      </div>
    </div>
  );
}