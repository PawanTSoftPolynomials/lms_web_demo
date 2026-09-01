import { TrendingUp, ClipboardCheck, Award, Activity, CheckCircle2 } from "lucide-react";

import Eyebrow from "@/components/ui/Eyebrow";

export default function ProductShowcase() {
  return (
    <section className="py-16 sm:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: copy */}
        <div>
          <Eyebrow>Inside The Platform</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            See your learning, not just your login
          </h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Every course comes with the same connected experience: lessons you
            can track, quizzes that check understanding, and a clear record of
            what you've completed — so progress is never a guess.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">Real-time progress across every module and lesson</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">Quizzes that reinforce what you just learned</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">A certificate the moment a course is finished</span>
            </li>
          </ul>
        </div>

        {/* Right: illustrative product concept panel — icons and generic
            progress fills only, no invented numbers or fake screenshots. */}
        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:mx-0">
          <div className="col-span-2 rounded-2xl border border-card-border bg-card p-5 shadow-luxury-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <TrendingUp size={14} className="text-primary" />
              Course Progress
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-primary" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Lessons completed across every module</p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-5 shadow-luxury-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck size={18} />
            </span>
            <p className="mt-3 text-sm font-bold text-foreground">Quiz Practice</p>
            <p className="mt-1 text-xs text-muted-foreground">After every module</p>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-5 shadow-luxury-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/60 text-accent-foreground">
              <Activity size={18} />
            </span>
            <p className="mt-3 text-sm font-bold text-foreground">Learning Activity</p>
            <p className="mt-1 text-xs text-muted-foreground">Tracked as you go</p>
          </div>

          <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Award size={19} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Certificate of Completion</p>
              <p className="text-xs text-muted-foreground">Issued automatically once a course is finished</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
