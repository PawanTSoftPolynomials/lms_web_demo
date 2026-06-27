"use client";

export default function DashboardHeader({
  name = "Admin",
}) {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 shadow-xl">

      <p className="text-sm uppercase tracking-[0.25em] text-orange-100">
        Orange LMS
      </p>

      <h1 className="mt-3 text-4xl font-bold text-white">
        {greeting}, {name} 👋
      </h1>

      <p className="mt-3 max-w-2xl text-orange-100">
        Welcome to your learning management dashboard.
        Monitor courses, users, enrollments and platform
        activity from one place.
      </p>

    </div>
  );
}