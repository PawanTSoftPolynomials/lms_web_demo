// components/layouts/LandingNavbar.jsx

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="sticky top-4 z-50 flex items-center justify-between gap-4 rounded-full border border-border bg-surface/80 backdrop-blur-md px-6 py-3 shadow-luxury-sm">
      <h1 className="text-xl font-bold text-foreground">
        Orange Tree <span className="text-primary">LMS</span>
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}