import { FaClipboardCheck } from "react-icons/fa6";

import Card from "@/components/ui/Card";

export default function WelcomeSection({
  name = "Instructor",
  courseCount = 0,
  studentCount = 0,
  quizCount = 0,
  completionRate = 0,
}) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="relative overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Decorative Background */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-sm font-medium text-orange-400">
          {today}
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          {greeting}, {name} 👋
        </h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
          <FaClipboardCheck className="text-xs" />
          Everything looks good today
        </div>

        <p className="mt-5 max-w-3xl text-slate-400 leading-7">
          Welcome back! Here's a quick overview of your classroom. Continue
          creating engaging learning experiences and monitor your students'
          progress from one place.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryItem
            label="Active Courses"
            value={courseCount}
          />

          <SummaryItem
            label="Students"
            value={studentCount}
          />

          <SummaryItem
            label="Published Quizzes"
            value={quizCount}
          />

          <SummaryItem
            label="Completion Rate"
            value={`${completionRate}%`}
          />
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
      <p className="text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}