"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Users, BookOpen, UserCircle } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Home", href: "/admin/dashboard", icon: Home, exact: true },
  { id: "students", label: "Students", href: "/admin/students", icon: GraduationCap },
  { id: "instructors", label: "Instructors", href: "/admin/instructors", icon: Users },
  { id: "courses", label: "Courses", href: "/admin/courses", icon: BookOpen },
  { id: "profile", label: "Profile", href: "/admin/profile", icon: UserCircle },
];

// Fixed bottom tab bar for the Admin mobile experience — always visible
// while scrolling. Desktop/tablet keep the top navbar + quick-action strip,
// so this only renders below the `sm` breakpoint. Mirrors InstructorBottomNav.
export default function AdminBottomNav() {
  const pathname = usePathname();

  const isActive = (tab) => (tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href));

  return (
    <nav
      aria-label="Admin bottom navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
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
              <Icon size={20} strokeWidth={2.25} className={active ? "text-primary" : "text-muted-foreground"} />
              <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
