"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, GraduationCap, MessageSquare, User } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", href: "/instructor/dashboard", icon: Home, exact: true },
  { id: "courses", label: "Courses", href: "/instructor/courses", icon: BookOpen },
  { id: "teaching", label: "Teaching", href: "/instructor/batches", icon: GraduationCap },
  { id: "messages", label: "Messages", href: "/instructor/messages", icon: MessageSquare },
  { id: "profile", label: "Profile", href: "/instructor/profile", icon: User },
];

// Fixed bottom tab bar for the Instructor mobile experience — always visible
// while scrolling. Desktop/tablet keep the top navbar + quick-action strip,
// so this only renders below the `sm` breakpoint. Mirrors StudentBottomNav.
export default function InstructorBottomNav() {
  const pathname = usePathname();

  const isActive = (tab) => (tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href));

  return (
    <nav
      aria-label="Instructor bottom navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[#1A1F35] bg-[#080B11]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] transition-colors"
            >
              <Icon size={20} strokeWidth={2.25} className={active ? "text-orange-500" : "text-slate-500"} />
              <span className={`text-[10px] font-bold ${active ? "text-orange-500" : "text-slate-500"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
