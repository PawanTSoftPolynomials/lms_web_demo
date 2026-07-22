"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Command
} from "lucide-react";

export default function AdminHeader({ onOpenSearch, onOpenAction, theme, toggleTheme }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: "Critical Storage Alert", time: "10m ago", unread: true, type: "urgent" },
    { id: 2, title: "Course Approval Requested by Dr. Aris", time: "12m ago", unread: true, type: "approval" },
    { id: 3, title: "Email Delivery Queue Warning", time: "24m ago", unread: true, type: "warning" },
    { id: 4, title: "Payment Renewal Failed for TechCorp", time: "1h ago", unread: false, type: "info" }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/95 px-6 py-3.5 backdrop-blur-md transition-colors">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 font-bold text-white shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/40">
            <span className="text-lg tracking-wider">OT</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Orange Tree <span className="text-orange-500 font-extrabold">LMS</span>
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400 ring-1 ring-inset ring-orange-500/30">
                <ShieldCheck className="h-3 w-3" />
                Enterprise Admin
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Operational Command Center</p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <button
          onClick={onOpenSearch}
          className="group flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs text-slate-400 shadow-inner transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-slate-300"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
            <span>Search courses, instructors, students, certificates, tickets, audit logs...</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Help */}
        <button
          onClick={() => onOpenAction({ type: "help_docs", title: "Admin Knowledge Base & SLA Guides" })}
          title="Admin Help & Documentation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-orange-400" /> Notifications
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-semibold text-orange-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 hover:bg-slate-800/60 rounded-lg transition text-left cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Requires administrative review</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t border-slate-800 pt-2 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onOpenAction({ type: "all_notifications", title: "System Notifications Queue" });
                  }}
                  className="text-[11px] font-bold text-slate-300 hover:text-white"
                >
                  View All System Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative border-l border-slate-800 pl-2.5">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 pr-3 transition hover:border-slate-700 hover:bg-slate-800"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-md bg-gradient-to-tr from-slate-700 to-slate-600 ring-1 ring-slate-700">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight text-white">Victoria Vance</p>
              <p className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Super Admin
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">Victoria Vance</p>
                <p className="text-[11px] text-slate-400">v.vance@orangetree-lms.edu</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenAction({ type: "admin_profile", title: "Admin Profile & Credentials" });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" /> Profile & Security
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenAction({ type: "system_settings", title: "System Preferences & Integration API" });
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" /> System Settings
                </button>
              </div>
              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => alert("Session Sign Out triggered.")}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-md"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
