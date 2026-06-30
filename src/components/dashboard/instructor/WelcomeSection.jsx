import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import { FaArrowTrendUp, FaPlus } from "react-icons/fa6";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function WelcomeSection({
  name = "Instructor",
  courseCount = 0,
  studentCount = 0,
  quizCount = 0,
  completionRate = 0,
  onCreateCourse,
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

      <div className="relative flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
        {/* Left */}
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-400">{today}</p>

          <h1 className="mt-2 text-4xl font-bold text-white">
            {greeting}, {name} 👋
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400 leading-7">
            Welcome back. Keep your courses updated, engage with your students,
            and monitor your teaching performance from one place.
          </p>

        </div>

        {/* Right */}
        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
          <StatChip
            icon={<HiOutlineBookOpen size={22} />}
            color="bg-violet-500/20 text-violet-400"
            label="Courses"
            value={courseCount}
          />

          <StatChip
            icon={<HiOutlineUsers size={22} />}
            color="bg-blue-500/20 text-blue-400"
            label="Students"
            value={studentCount}
          />

          <StatChip
            icon={<HiOutlineAcademicCap size={22} />}
            color="bg-emerald-500/20 text-emerald-400"
            label="Quizzes"
            value={quizCount}
          />

          <StatChip
            icon={<FaArrowTrendUp size={18} />}
            color="bg-orange-500/20 text-orange-400"
            label="Completion"
            value={`${completionRate}%`}
          />
        </div>
      </div>
    </Card>
  );
}

function StatChip({ icon, color, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-5 transition-all duration-300 hover:border-orange-500/40">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
