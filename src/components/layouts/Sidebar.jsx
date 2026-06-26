'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FaBars } from 'react-icons/fa';

import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { GiOrange } from 'react-icons/gi';
import { PiOrangeDuotone } from 'react-icons/pi';
export default function Sidebar({
  role,
  open,
  setOpen,
  collapsed,
  setCollapsed,
}) {
  const pathname = usePathname();

  const menus = SIDEBAR_ITEMS[role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
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
          min-h-screen
          bg-slate-900
          border-r border-slate-800
          z-50
          transition-all
          duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Collapse Button */}
        <div className="hidden md:flex justify-end p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              p-2
              rounded-lg
              text-white
              hover:bg-slate-800
              transition
            "
          >
            <FaBars />
          </button>
        </div>

        {/* Logo */}
        <div className="px-6 pb-6 flex items-center justify-center">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <PiOrangeDuotone className="text-3xl text-orange-500" />

              <h1 className="text-xl font-bold text-orange-500">
                Orange Tree LMS
              </h1>
            </div>
          ) : (
            <PiOrangeDuotone className="text-3xl text-orange-500" />
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-2">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center
                  ${collapsed ? 'justify-center' : 'gap-3'}
                  p-3
                  rounded-lg
                  transition
                  ${
                    pathname === item.href
                      ? 'bg-orange-600 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }
                `}
              >
                <Icon className="text-lg" />

                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
