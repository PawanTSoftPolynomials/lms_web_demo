"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSignOutAlt, FaBars } from "react-icons/fa";

import useAuth from "@/hooks/useAuth";

export default function Navbar({ title = "Dashboard", setOpen }) {
  const router = useRouter();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      className="
      bg-slate-900
      border-b
      border-slate-800
      px-4
      py-4
      flex
      items-center
      justify-between
    "
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen?.(true)}
          className="
            md:hidden
            text-xl
            text-white
          "
        >
          <FaBars />
        </button>
        <button
          onClick={() => router.back()}
          className="
            bg-slate-800
            hover:bg-slate-700
            transition
            p-3
            rounded-lg
          "
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleLogout}
          className="
            bg-red-600
            hover:bg-red-700
            transition
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
