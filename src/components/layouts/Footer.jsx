import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-orange-500">
              Orange Tree LMS
            </h2>

            <p className="text-slate-400 mt-3">
              Modern learning platform for students,
              instructors, and administrators.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-slate-400">
              <Link href="/">Home</Link>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Features
            </h3>

            <div className="flex flex-col gap-2 text-slate-400">
              <p>Courses</p>
              <p>Quizzes</p>
              <p>Certificates</p>
              <p>Progress Tracking</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">
          © 2026 Orange Tree LMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}