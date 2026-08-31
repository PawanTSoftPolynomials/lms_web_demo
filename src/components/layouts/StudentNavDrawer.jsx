"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Newspaper,
  Calendar,
  MessageSquare,
  Lightbulb,
  Sparkles,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  BarChart3,
  Store,
} from "lucide-react";

import { useStudentNavDrawer } from "@/context/StudentNavDrawerContext";
import useAuth from "@/hooks/useAuth";
import Modal from "@/components/ui/Modal";
import { ThemeModeRow } from "@/components/ui/shadcn/theme-switcher";

// Secondary navigation only. Dashboard, My Courses, Calendar, Activity and
// Profile already live in the Bottom Navigation (see StudentBottomNav's
// TABS) — repeating them here would just duplicate taps the user already
// has. Reports has no bottom-nav slot, so it lives here instead. Routes
// match the same destinations already used on the desktop QuickActionStrip
// (see PRIMARY_NAV_ITEMS).
const NAV_ITEMS = [
  { id: "store", label: "Store", icon: Store, href: "/student/store" },
  { id: "news", label: "News & Updates", icon: Newspaper, href: "/student/news" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/student/reports" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/student/calendar" },
  { id: "messages", label: "Messages", icon: MessageSquare, href: "/student/messages" },
  { id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "/student/feedback" },
  { id: "aiRecommendations", label: "AI Recommendations", icon: Sparkles, href: "/student/courses" },
  { id: "help", label: "Help & Support", icon: LifeBuoy, href: "/student/settings" },
  { id: "settings", label: "Settings", icon: Settings, href: "/student/settings" },
];

// The Student mobile navigation drawer — opened from the header's hamburger
// button (see DashboardNavbar) via shared context, instead of its own
// per-page trigger.
export default function StudentNavDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isOpen, close } = useStudentNavDrawer();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isItemActive = (item) => pathname && pathname.startsWith(item.href);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    // Closes the drawer on the mobile browser/hardware back gesture too.
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
      <div className="fixed top-0 left-0 h-screen w-[80%] max-w-xs bg-background border-r border-border/60 rounded-r-2xl z-[70] sm:hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-left duration-200">
        <div className="h-14 px-5 flex items-center justify-between border-b border-border/60 shrink-0">
          <span className="text-sm font-black text-foreground tracking-tight">Navigation</span>
          <button
            onClick={close}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
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
                    ? "bg-primary text-slate-950 font-bold shadow-[0_2px_12px_rgba(249,115,22,0.35)]"
                    : "text-foreground hover:text-foreground hover:bg-muted/50 font-semibold"
                }`}
              >
                <Icon size={18} className={active ? "text-slate-950" : "text-muted-foreground"} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          <ThemeModeRow />

          <div className="my-2 border-t border-border/60" />

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
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-750 text-foreground transition cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
