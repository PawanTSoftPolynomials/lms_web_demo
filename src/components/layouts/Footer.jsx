import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Orange Tree <span className="text-primary">LMS</span>
            </h2>

            <p className="text-muted-foreground mt-3">
              Modern learning platform for students,
              instructors, and administrators.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
              <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              Features
            </h3>

            <div className="flex flex-col gap-2 text-muted-foreground">
              <p>Courses</p>
              <p>Quizzes</p>
              <p>Certificates</p>
              <p>Progress Tracking</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
          © 2026 Orange Tree LMS. All rights reserved.
        </div>
      </div>

      <div
        aria-hidden="true"
        className="select-none overflow-hidden whitespace-nowrap text-center text-[11vw] leading-none font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-primary/25 to-transparent py-2"
      >
        ORANGE TREE LMS
      </div>
    </footer>
  );
}