"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Megaphone,
  Award,
  ClipboardCheck,
  FileEdit,
  Settings,
  HelpCircle,
  LifeBuoy,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/shadcn/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/shadcn/dropdown-menu";
import { PRIMARY_NAV_ITEMS, type MoreMenuItem, type NavItem } from "./navigationItems";

const MORE_MENU_ITEMS: MoreMenuItem[] = [
  { label: "Announcements", href: "/instructor/announcements", icon: Megaphone },
  { label: "Certificates", href: "/instructor/certificates", icon: Award },
  { label: "Attendance", href: "/instructor/students", icon: ClipboardCheck },
  { label: "Draft Courses", href: "/instructor/courses", icon: FileEdit },
  { label: "Settings", href: "/instructor/settings", icon: Settings },
  { label: "Help", href: "/instructor/settings", icon: HelpCircle },
  { label: "Support", href: "/instructor/messages", icon: LifeBuoy },
];

function isHrefActive(pathname: string, href: string) {
  if (href === "/instructor/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.children) return item.children.some((child) => isHrefActive(pathname, child.href));
  return item.href ? isHrefActive(pathname, item.href) : false;
}

export function NavigationStrip() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const mobilePrimary = PRIMARY_NAV_ITEMS.filter((item) => item.primaryOnMobile);

  return (
    <nav
      aria-label="Instructor navigation"
      className="-mx-1 rounded-2xl border border-card-border bg-card/80 backdrop-blur-md px-2 py-2 shadow-sm"
    >
      {/* Desktop / tablet: full pill row */}
      <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-none">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavPill key={item.label} item={item} active={isItemActive(pathname, item)} pathname={pathname} />
        ))}

        <MoreTrigger open={moreOpen} onOpenChange={setMoreOpen} />
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
        <MoreTrigger open={moreOpen} onOpenChange={setMoreOpen} mobile />
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
    mobile ? "px-3 py-2 text-[11px]" : "px-3.5 py-2 text-xs",
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

function MoreTrigger({
  open,
  onOpenChange,
  mobile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mobile?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            mobile && "text-[11px] px-3"
          )}
        >
          <MoreHorizontal className="size-3.5" />
          More
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs">
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
        </SheetHeader>
        <div className="px-3 pb-5 grid grid-cols-2 gap-2">
          {MORE_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-surface-muted p-3 text-xs font-bold text-foreground hover:border-primary/40 hover:bg-accent transition"
              >
                <Icon className="size-4 text-primary" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
