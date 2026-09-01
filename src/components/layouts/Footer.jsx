import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Orange Tree <span className="text-primary">LMS</span>
            </h2>

            <p className="mt-3 max-w-sm text-muted-foreground">
              A connected learning platform for students, instructors, and
              administrators — courses, quizzes, progress, and certificates
              in one place.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Explore
            </h3>

            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">Home</Link>
              <Link href="/#courses" className="transition-colors hover:text-primary">Courses</Link>
              <Link href="/#how-it-works" className="transition-colors hover:text-primary">How It Works</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Account
            </h3>

            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <Link href="/login" className="transition-colors hover:text-primary">Login</Link>
              <Link href="/register" className="transition-colors hover:text-primary">Get Started</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 Orange Tree LMS. All rights reserved.
        </div>
      </div>

      <div
        aria-hidden="true"
        className="select-none overflow-hidden whitespace-nowrap py-2 text-center text-[11vw] leading-none font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-primary/25 to-transparent"
      >
        ORANGE TREE LMS
      </div>
    </footer>
  );
}
