// components/layouts/LandingNavbar.jsx

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="sticky top-0 bg-slate-950/80 border-b border-slate-900/40 backdrop-blur-md z-50 flex justify-between items-center py-4 px-4 -mx-4">
      <h1 className="text-2xl font-bold text-orange-500">
        Orange Tree LMS
      </h1>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-4 py-2 border border-slate-700 rounded-lg hover:border-orange-500"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}