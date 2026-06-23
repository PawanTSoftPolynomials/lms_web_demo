"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SIDEBAR_ITEMS } from "@/constants/sidebar";

export default function Sidebar({
  role,
  open,
  setOpen,
}) {
  const pathname = usePathname();

  const menus =
    SIDEBAR_ITEMS[role] || [];

  return (
    <>
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
          h-screen w-64
          bg-slate-900
          border-r border-slate-800
          z-50
          transition-transform
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-orange-500">
            Orange LMS
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  flex items-center gap-3
                  p-3 rounded-lg
                  transition
                  ${
                    pathname === item.href
                      ? "bg-orange-600 text-white"
                      : "hover:bg-slate-800"
                  }
                `}
              >
                <Icon />

                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}