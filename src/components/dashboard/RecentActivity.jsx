"use client";

import {
  FaBook,
  FaUsers,
  FaUserGraduate,
  FaCertificate,
} from "react-icons/fa";

export default function RecentActivity({
  users = [],
  courses = [],
}) {
  const activities = [
    {
      id: 1,
      icon: FaUsers,
      title: `${users.length} users registered`,
      time: "Today",
      color: "text-blue-400",
    },
    {
      id: 2,
      icon: FaBook,
      title: `${courses.length} courses available`,
      time: "Current",
      color: "text-orange-400",
    },
    {
      id: 3,
      icon: FaUserGraduate,
      title: "Student enrollments are active",
      time: "Live",
      color: "text-green-400",
    },
    {
      id: 4,
      icon: FaCertificate,
      title: "Certificates modules online",
      time: "Ready",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold">
        Recent Activity
      </h2>

      <div className="space-y-5">

        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 ${activity.color}`}
                >
                  <Icon />
                </div>

                <div>

                  <p className="font-medium">
                    {activity.title}
                  </p>

                  <p className="text-sm text-slate-400">
                    {activity.time}
                  </p>

                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}