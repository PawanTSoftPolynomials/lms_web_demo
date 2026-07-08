// components/layouts/LandingNavbar.jsx

import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav className="flex justify-between items-center py-6">
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