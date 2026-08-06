"use client";

<<<<<<< HEAD
import { QuickActionStrip } from "@/components/dashboard/QuickActionStrip";
import { PRIMARY_NAV_ITEMS } from "./navigationItems";
=======
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/shadcn/dropdown-menu";
import { PRIMARY_NAV_ITEMS, type NavItem } from "./navigationItems";

function isHrefActive(pathname: string, href: string) {
  if (href === "/instructor/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.children) return item.children.some((child) => isHrefActive(pathname, child.href));
  return item.href ? isHrefActive(pathname, item.href) : false;
}
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e

// Thin role-specific wrapper around the shared floating quick-action strip
// (layout, styling, responsiveness, and animations all live in
// QuickActionStrip so Instructor and Student render byte-identical UI).
export function NavigationStrip() {
<<<<<<< HEAD
  return <QuickActionStrip items={PRIMARY_NAV_ITEMS} ariaLabel="Instructor navigation" />;
}
=======
  const pathname = usePathname();

  const mobilePrimary = PRIMARY_NAV_ITEMS.filter((item) => item.primaryOnMobile);

  return (
    <nav
      aria-label="Instructor navigation"
      className="-mx-1 rounded-2xl border border-card-border bg-card/80 backdrop-blur-md px-2 py-2 shadow-sm"
    >
      {/* Desktop / tablet: full pill row, wraps so every item fits in window */}
      <div className="hidden sm:flex flex-wrap justify-center items-center gap-1.5 p-1">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavPill key={item.label} item={item} active={isItemActive(pathname, item)} pathname={pathname} />
        ))}
      </div>

      {/* Mobile: condensed primary set, horizontally scrollable */}
      <div className="flex sm:hidden items-center gap-1 overflow-x-auto scrollbar-none">
        {mobilePrimary.map((item) => (
          <NavPill
            key={item.label}
            item={item}
            active={isItemActive(pathname, item)}
            pathname={pathname}
            mobile
          />
        ))}
      </div>
    </nav>
  );
}

function NavPill({
  item,
  active,
  pathname,
  mobile,
}: {
  item: NavItem;
  active: boolean;
  pathname: string;
  mobile?: boolean;
}) {
  const Icon = item.icon;

  const pillClass = cn(
    "relative flex items-center gap-1.5 rounded-xl font-bold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0",
    mobile ? "px-3 py-2 text-[11px]" : "px-3 py-1.5 text-[11px]",
    active
      ? mobile
        ? "bg-primary text-primary-foreground"
        : "text-primary-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  );

  if (item.children) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={pillClass} aria-current={active ? "page" : undefined}>
            {active && !mobile && (
              <motion.span
                layoutId="nav-strip-active-pill"
                className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="size-3.5 relative z-10" />
            <span className="relative z-10">{item.label}</span>
            <ChevronDown className="size-3 relative z-10" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isHrefActive(pathname, child.href);
            return (
              <DropdownMenuItem key={child.href} asChild>
                <Link
                  href={child.href}
                  className={cn("flex items-center gap-2", childActive && "font-bold text-primary")}
                >
                  <ChildIcon className="size-3.5" />
                  {child.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href={item.href!} aria-current={active ? "page" : undefined} className={pillClass}>
      {active && !mobile && (
        <motion.span
          layoutId="nav-strip-active-pill"
          className="absolute inset-0 rounded-xl bg-primary shadow-sm"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="size-3.5 relative z-10" />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}
>>>>>>> 3a2a149af33ddab1101f22c815a2cdd8a794cd7e
