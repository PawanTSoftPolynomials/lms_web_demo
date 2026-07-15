"use client";

import Link from "next/link";

import {
  FaPlus,
  FaUsers,
  FaUserGraduate,
  FaCertificate,
} from "react-icons/fa";

const actions = [
  {
    title: "Create Course",
    href: "/admin/courses/create",
    icon: FaPlus,
    color: "bg-orange-600 hover:bg-orange-700",
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: FaUsers,
    color: "bg-slate-800 hover:bg-slate-700",
  },
  {
    title: "Enrollments",
    href: "/admin/enrollments",
    icon: FaUserGraduate,
    color: "bg-slate-800 hover:bg-slate-700",
  },
  {
    title: "Certificates",
    href: "/admin/certificates",
    icon: FaCertificate,
    color: "bg-slate-800 hover:bg-slate-700",
  },
];

export default function QuickActions() {
  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold">
        Quick Actions
      </h2>

      <div className="space-y-4">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white transition ${action.color}`}
            >
              <Icon />
              <span>{action.title}</span>
            </Link>
          );
        })}

      </div>

    </div>
  );
}