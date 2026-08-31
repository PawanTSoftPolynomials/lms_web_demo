"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/shadcn/button";

/** Simple light/dark toggle — one click flips the mode. Persists via next-themes. */
export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border-card-border bg-card text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

/** Labeled light/dark toggle row — for the nav drawers (same row style as their
 * nav items/Logout), so the switch lives in one place instead of also
 * crowding the navbar. */
export function ThemeModeRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-foreground hover:text-foreground hover:bg-muted/50 font-semibold transition-all duration-200 cursor-pointer"
    >
      {isDark ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
      <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
