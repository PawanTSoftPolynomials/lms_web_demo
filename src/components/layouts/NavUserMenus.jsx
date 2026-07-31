"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronDown } from "lucide-react";

// Compact, premium notification bell + dropdown. Shared between the main
// dashboard header and the student sub-nav so there's a single visual
// language (and a single place to fix bugs) for both.
export function NotificationsMenu({ notifications = [], unreadCount = 0, onMarkAllRead, onClearAll, onItemClick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 ${
          open ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 px-1 text-[9px] font-bold text-white shadow-[0_2px_6px_rgba(255,140,0,0.5)] ring-2 ring-[#0D0D18]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 rounded-2xl border border-white/[0.08] bg-[#0D0D18]/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 transition-colors hover:text-orange-300"
              >
                <CheckCheck size={12} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-0.5 scrollbar-none">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-slate-500">No notifications yet</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onItemClick?.(n);
                  }}
                  className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors ${
                    n.read ? "text-slate-400 hover:bg-white/[0.05]" : "bg-orange-500/[0.06] text-slate-200 hover:bg-orange-500/10"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="truncate">{n.title}</span>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />}
                  </span>
                  <span className="line-clamp-2 text-[10.5px] leading-snug text-slate-500">{n.message}</span>
                </button>
              ))
            )}
          </div>
          {notifications.length > 0 && onClearAll && (
            <div className="mt-1.5 flex justify-end border-t border-white/[0.06] pt-2">
              <button
                type="button"
                onClick={onClearAll}
                className="text-[10.5px] font-medium text-slate-500 transition-colors hover:text-slate-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact avatar-initial profile pill + dropdown (name, email, quick links, sign out).
export function ProfileMenu({ user, onLogout, profileHref = "/student/profile", settingsHref = "/student/settings" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:-translate-y-0.5 ${
          open ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-[11px] font-black text-white shadow-[0_2px_8px_rgba(255,140,0,0.4)]">
          {user?.name?.[0]?.toUpperCase() || "S"}
        </span>
        <span className="hidden max-w-[100px] truncate text-[13px] font-semibold text-slate-200 lg:inline">
          {user?.name || "Profile"}
        </span>
        <ChevronDown size={14} className={`hidden text-slate-500 transition-transform duration-200 lg:inline ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 rounded-2xl border border-white/[0.08] bg-[#0D0D18]/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-1 border-b border-white/[0.06] px-3 py-2">
            <p className="truncate text-xs font-bold text-slate-200">{user?.name}</p>
            <p className="truncate text-[10.5px] text-slate-500">{user?.email}</p>
          </div>
          {profileHref && (
            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              My Profile
            </Link>
          )}
          {settingsHref && (
            <Link
              href={settingsHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-xl px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Settings
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
