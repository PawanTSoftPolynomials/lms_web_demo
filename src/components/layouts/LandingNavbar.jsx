// components/layouts/LandingNavbar.jsx

import Link from "next/link";

import { ThemeSwitcher } from "@/components/ui/shadcn/theme-switcher";

export default function LandingNavbar() {
  return (
    <nav className="sticky top-4 z-50 flex items-center justify-between gap-4 rounded-full border border-border bg-surface/80 backdrop-blur-md px-6 py-3 shadow-luxury-sm">
      <Link href="/" className="text-xl font-bold text-foreground">
        Orange Tree <span className="text-primary">LMS</span>
      </Link>

      <div className="hidden items-center gap-6 sm:flex">
        <Link
          href="/#courses"
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Courses
        </Link>
        <Link
          href="/#how-it-works"
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          How It Works
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeSwitcher />

        <Link
          href="/login"
          className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:px-4"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 sm:px-5"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
