"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars } from 'react-icons/fa';
import { PiOrangeDuotone } from 'react-icons/pi';
import { X, ChevronRight, ChevronDown } from 'lucide-react';

import { SIDEBAR_ITEMS } from '@/constants/sidebar';

export default function Sidebar({
  role,
  open,
  setOpen,
  collapsed,
  setCollapsed,
}) {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState(null);
  const [desktopExpandedMenu, setDesktopExpandedMenu] = useState(null);

  const menus = SIDEBAR_ITEMS[role] || [];

  // Close mobile drawer on escape press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setOpen]);

  // Define sub-fields dynamic configuration
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

  // Auto-expand menus based on current pathname
  useEffect(() => {
    menus.forEach((item) => {
      const subItems = getSubmenus(item.title);
      if (subItems && subItems.some((sub) => pathname === sub.href)) {
        setDesktopExpandedMenu(item.title);
        setMobileExpandedMenu(item.title);
      }
    });
  }, [pathname, role]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer (Visible on mobile, hidden on md+) */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 z-[60] md:hidden transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header branding & Close button */}
          <div className="p-6 flex items-center justify-between border-b border-slate-805/60">
            <div className="flex items-center gap-2.5">
              <PiOrangeDuotone className="text-3xl text-orange-500 animate-pulse" />
              <span className="text-lg font-black text-orange-500 tracking-tight">
                Orange Tree LMS
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/student/dashboard' && item.href !== '/instructor/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              const subItems = getSubmenus(item.title);
              const hasSubmenus = subItems && subItems.length > 0;
              const isExpanded = mobileExpandedMenu === item.title;

              return (
                <div key={item.href} className="space-y-1">
                  {hasSubmenus ? (
                    <button
                      onClick={() => setMobileExpandedMenu(isExpanded ? null : item.title)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border-l-4 cursor-pointer ${
                        isActive || isExpanded
                          ? 'bg-slate-800/60 text-white border-orange-505 font-bold'
                          : 'border-transparent text-slate-450 hover:text-slate-100 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className="text-lg shrink-0" />
                        <span className="text-xs uppercase font-bold tracking-wider">{item.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 border-l-4 ${
                        isActive
                          ? 'bg-slate-800/60 text-white border-orange-505 font-bold'
                          : 'border-transparent text-slate-455 hover:text-slate-100 hover:bg-slate-800/30'
                      }`}
                    >
                      <Icon className="text-lg shrink-0" />
                      <span className="text-xs uppercase font-bold tracking-wider">{item.title}</span>
                    </Link>
                  )}

                  {/* Render Accordion for Submenu items */}
                  {hasSubmenus && isExpanded && (
                    <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-950/20 rounded-xl border border-slate-850/30">
                      {subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => {
                              setOpen(false);
                              setMobileExpandedMenu(null);
                            }}
                            className={`block px-3.5 py-2 text-xs rounded-lg transition-all duration-200 border-l-2 ${
                              isSubActive
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold border-orange-500'
                                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
                            }`}
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
        </div>
      </div>

      {/* Desktop Sidebar (visible on md:block/flex, hidden on mobile) */}
      <aside
        className={`
          hidden md:block
          sticky
          top-0 left-0
          h-screen
          overflow-y-auto
          bg-slate-900
          border-r border-slate-800
          z-50
          transition-all
          duration-300
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Collapse Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              p-2
              rounded-lg
              text-white
              hover:bg-slate-800
              transition
              cursor-pointer
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
        <nav className="pr-3 pl-1 space-y-2 relative">
          {menus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/student/dashboard' && item.href !== '/instructor/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const subItems = getSubmenus(item.title);
            const hasSubmenus = subItems && subItems.length > 0;
            const isExpanded = desktopExpandedMenu === item.title;

            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => collapsed && setHoveredMenu(item.title)}
                onMouseLeave={() => collapsed && setHoveredMenu(null)}
              >
                {hasSubmenus && !collapsed ? (
                  <button
                    onClick={() => setDesktopExpandedMenu(isExpanded ? null : item.title)}
                    className={`
                      w-full flex items-center justify-between
                      p-3
                      rounded-r-xl
                      transition-all
                      duration-350
                      cursor-pointer
                      ${
                        isActive || isExpanded
                          ? 'bg-slate-800/80 text-white border-l-4 border-orange-500 font-semibold shadow-inner'
                          : 'border-l-4 border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:translate-x-1 hover:border-slate-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-lg shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-slate-450 mr-2" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-450 mr-2" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (hasSubmenus && collapsed) {
                        setCollapsed(false);
                        setDesktopExpandedMenu(item.title);
                      }
                    }}
                    className={`
                      flex items-center
                      ${collapsed ? 'justify-center' : 'gap-3'}
                      p-3
                      rounded-r-xl
                      transition-all
                      duration-350
                      ${
                        isActive
                          ? 'bg-slate-800/80 text-white border-l-4 border-orange-500 font-semibold shadow-inner'
                          : 'border-l-4 border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 hover:translate-x-1 hover:border-slate-700/50'
                      }
                    `}
                  >
                    <Icon className="text-lg shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )}

                {/* Submenu inline accordion for desktop expanded mode */}
                {hasSubmenus && !collapsed && isExpanded && (
                  <div className="pl-9 pr-3 py-1 mt-1 space-y-1 bg-slate-950/20 rounded-r-xl border-l-2 border-slate-800">
                    {subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
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

                {/* Submenu selection flyout container when collapsed */}
                {hasSubmenus && collapsed && hoveredMenu === item.title && (
                  <div className="absolute left-full top-0 ml-1.5 z-[100] w-52 rounded-xl border border-slate-800 bg-slate-955/95 backdrop-blur-md p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-l-2 border-l-orange-500 animate-in fade-in slide-in-from-left-2 duration-150">
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
