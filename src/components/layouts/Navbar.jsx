"use client";

import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import useAuth from "@/hooks/useAuth";

export default function Navbar({
  setOpen,
}) {
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="
      bg-slate-900
      border-b
      border-slate-800
      p-4
      flex
      items-center
      justify-between
    ">
      {/* Mobile Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="
          md:hidden
          text-white
          text-xl
        "
      >
        <FaBars />
      </button>

      <div className="flex gap-3 ml-auto">
        <button
          onClick={() => router.back()}
          className="
            bg-slate-800
            p-3
            rounded-lg
          "
        >
          <FaArrowLeft />
        </button>

        <button
          onClick={handleLogout}
          className="
            bg-red-600
            p-3
            rounded-lg
          "
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}