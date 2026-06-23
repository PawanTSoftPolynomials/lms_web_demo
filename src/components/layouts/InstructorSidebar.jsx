"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBook,
  FaTimes,
} from "react-icons/fa";

export default function InstructorSidebar({
  open,
  setOpen,
}) {
  const pathname =
    usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/instructor/dashboard",
      icon: <FaHome />,
    },
    {
      name: "My Courses",
      href: "/instructor/courses",
      icon: <FaBook />,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() =>
            setOpen(false)
          }
          className="
            fixed inset-0
            bg-black/50
            z-40
            md:hidden
          "
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
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-orange-500">
            Orange LMS
          </h1>

          <button
            className="md:hidden text-white"
            onClick={() =>
              setOpen(false)
            }
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition
                  ${
                    pathname ===
                    item.href
                      ? "bg-orange-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }
                `}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          )}
        </nav>
      </aside>
    </>
  );
}