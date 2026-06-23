"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaChartBar,
  FaTimes,
} from "react-icons/fa";

export default function AdminSidebar({
  open,
  setOpen,
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <FaUsers />,
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: <FaUserGraduate />,
    },
    {
      name: "Instructors",
      href: "/admin/instructors",
      icon: <FaChalkboardTeacher />,
    },
    {
      name: "Courses",
      href: "/admin/courses",
      icon: <FaBook />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <FaChartBar />,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="
            fixed inset-0
            bg-black/50
            z-40
            md:hidden
          "
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static
          top-0 left-0
          h-screen
          w-64
          bg-slate-900
          border-r border-slate-800
          z-50
          transform
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-500">
              Orange LMS
            </h1>

            <p className="text-sm text-slate-400">
              Admin Panel
            </p>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setOpen(false)}
          >
            <FaTimes size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition
                ${
                  pathname === item.href
                    ? "bg-orange-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}