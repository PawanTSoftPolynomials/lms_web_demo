"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaHome,
  FaBook,
  FaGraduationCap,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import useAuth from "@/hooks/useAuth";

export default function StudentSidebar({
  open,
  setOpen,
}) {
  const { logout } = useAuth();

  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-40
            md:hidden
          "
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      <div
        className={`
          fixed md:static
          top-0 left-0
          z-50
          h-screen
          w-64
          bg-slate-900
          flex
          flex-col
          justify-between
          border-r
          border-slate-800
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
        <div>
          {/* Mobile Close */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={() =>
                setOpen(false)
              }
            >
              <FaTimes size={22} />
            </button>
          </div>

          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-3xl font-bold text-orange-500">
              Orange LMS
            </h1>

            <p className="text-sm text-slate-400">
              Learning Platform
            </p>
          </div>

          {/* Menu */}
          <nav className="space-y-2 p-4">
            <Link
              href="/student/dashboard"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                hover:bg-slate-800
              "
            >
              <FaHome />
              Dashboard
            </Link>

            <Link
              href="/student/profile"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                hover:bg-slate-800
              "
            >
              <FaUser />
              Profile
            </Link>

            <Link
              href="/student/courses"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                hover:bg-slate-800
              "
            >
              <FaBook />
              Browse Courses
            </Link>

            <Link
              href="/student/my-courses"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                hover:bg-slate-800
              "
            >
              <FaGraduationCap />
              My Courses
            </Link>

            <Link
              href="/student/progress"
              onClick={() =>
                setOpen(false)
              }
              className="
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                hover:bg-slate-800
              "
            >
              <FaChartLine />
              Progress
            </Link>
          </nav>
        </div>

        {/* Logout */}

      </div>
    </>
  );
}