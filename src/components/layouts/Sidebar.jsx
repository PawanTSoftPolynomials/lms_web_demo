"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FaBars } from 'react-icons/fa';

import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { PiOrangeDuotone } from 'react-icons/pi';

export default function Sidebar({
  role,
  open,
  setOpen,
  collapsed,
  setCollapsed,
}) {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const menus = SIDEBAR_ITEMS[role] || [];
  const isCollapsed = role === "INSTRUCTOR" ? false : collapsed;

  // Define sub-fields dynamic configuration for hover selection
  const getSubmenus = (title) => {
    if (role === "INSTRUCTOR") {
      if (title === "Courses") {
        return [
          { title: "My Courses List", href: "/instructor/courses" },
          { title: "Create New Course", href: "/instructor/courses/create" },
        ];
      }
      if (title === "Quizzes") {
        return [
          { title: "My Quizzes List", href: "/instructor/quizzes" },
          { title: "Create New Quiz", href: "/instructor/quizzes/create" },
        ];
      }
    }
    if (role === "STUDENT") {
      if (title === "Courses") {
        return [
          { title: "All Available Courses", href: "/student/courses" },
          { title: "My Enrolled Courses", href: "/student/my-courses" },
        ];
      }
      if (title === "Quizzes") {
        return [
          { title: "My Quiz Center", href: "/student/quizzes" },
        ];
      }
    }
    if (role === "ADMIN") {
      if (title === "Users") {
        return [
          { title: "Manage All Users", href: "/admin/users" },
          { title: "Student Directory", href: "/admin/students" },
          { title: "Instructor Directory", href: "/admin/instructors" },
        ];
      }
      if (title === "Courses") {
        return [
          { title: "Manage Course Catalog", href: "/admin/courses" },
          { title: "View Course Enrollments", href: "/admin/enrollments" },
        ];
      }
    }
    return null;
  };

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
          fixed md:sticky
          top-0 left-0
          h-screen
          overflow-y-auto
          ${role === 'INSTRUCTOR' ? 'bg-[#0D1021] border-r border-[#1A1F35]' : 'bg-slate-900 border-r border-slate-800'}
          z-50
          transition-all
          duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Collapse Button */}
        {role !== 'INSTRUCTOR' && (
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
        )}

        {/* Logo */}
        <div className={`px-6 flex items-center justify-center ${role === 'INSTRUCTOR' ? 'py-6' : 'pb-6'}`}>
          {!isCollapsed ? (
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
        <nav className="pr-3 pl-1 space-y-2 relative">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/student/dashboard' && item.href !== '/instructor/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const subItems = getSubmenus(item.title);

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setHoveredMenu(item.title)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center
                    ${isCollapsed ? 'justify-center' : 'gap-3'}
                    p-3
                    rounded-r-xl
                    transition-all
                    duration-350
                    ${
                      isActive
                        ? 'bg-orange-500/5 text-orange-400 border-l-2 border-orange-500 font-semibold'
                        : 'border-l-2 border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.02] hover:translate-x-0.5'
                    }
                  `}
                >
                  {typeof Icon === 'string' ? (
                    <span className="text-lg flex-shrink-0 w-5 text-center">{Icon}</span>
                  ) : (
                    <Icon className="text-lg flex-shrink-0" />
                  )}

                  {!isCollapsed && <span>{item.title}</span>}
                </Link>

                {/* Submenu selection flyout container */}
                {subItems && hoveredMenu === item.title && (
                  <div className="absolute left-full top-0 ml-1.5 z-[100] w-52 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-md p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-l-2 border-l-orange-500 animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="text-[10px] text-slate-500 font-extrabold px-2.5 py-1.5 uppercase tracking-wider border-b border-slate-900/60 mb-1">
                      {item.title} Options
                    </div>
                    {subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => {
                            setOpen(false);
                            setHoveredMenu(null);
                          }}
                          className={`
                            block px-3 py-2 text-xs rounded-lg transition-all duration-200
                            ${
                              isSubActive
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900 hover:translate-x-1'
                            }
                          `}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
