"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  GraduationCap,
  BarChart3,
  Calendar,
  Settings,
  LifeBuoy,
  LogOut,
  X,
} from "lucide-react";

import { useAdminNavDrawer } from "@/context/AdminNavDrawerContext";
import useAuth from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";

// Secondary navigation only. Home, Students, Instructors, Courses and Profile
// already live in the Bottom Navigation — repeating them here would just
// duplicate taps the user already has. This drawer complements that bar
// instead of mirroring it. Mirrors InstructorNavDrawer's structure.
const NAV_ITEMS = [
  { id: "enrollments", label: "Enrollments", icon: GraduationCap, href: "/admin/enrollments" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/admin/calendar" },
  { id: "settings", label: "Settings", icon: Settings, href: "/admin/profile" },
  { id: "help", label: "Help & Support", icon: LifeBuoy, href: "/admin/profile" },
];

// The Admin mobile navigation drawer — opened from the header's hamburger
// button (see DashboardNavbar) via shared context, instead of its own
// per-page trigger.
export default function AdminNavDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isOpen, close } = useAdminNavDrawer();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isItemActive = (item) => pathname && pathname.startsWith(item.href);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    const handlePopState = () => close();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, close]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    close();
    logout();
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm sm:hidden" onClick={close} />
      <div className="fixed top-0 left-0 h-screen w-[80%] max-w-xs bg-[#090D16] border-r border-slate-800/60 rounded-r-2xl z-[70] sm:hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-left duration-200">
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-800/60 shrink-0">
          <span className="text-sm font-black text-white tracking-tight">Navigation</span>
          <button
            onClick={close}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-orange-500 text-slate-950 font-bold shadow-[0_2px_12px_rgba(249,115,22,0.35)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-semibold"
                }`}
              >
                <Icon size={18} className={active ? "text-slate-950" : "text-slate-400"} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          <div className="my-2 border-t border-slate-800/60" />

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut size={18} className="text-rose-400" />
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </div>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
        size="sm"
      >
        <div className="space-y-6 text-center py-2">
          <p className="text-sm text-slate-400">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-750 text-white transition cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
