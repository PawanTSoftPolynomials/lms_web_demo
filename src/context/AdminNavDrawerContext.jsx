"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AdminNavDrawerContext = createContext(null);

// Shared open/close state for the Admin mobile navigation drawer, so the
// trigger (the header's hamburger button) and the drawer panel itself can
// live in different parts of the tree without prop-drilling through
// DashboardLayout/DashboardNavbar (which are also shared with
// Student/Instructor). Mirrors InstructorNavDrawerContext.
export function AdminNavDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  return <AdminNavDrawerContext.Provider value={value}>{children}</AdminNavDrawerContext.Provider>;
}

const NOOP_CONTEXT = { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} };

// DashboardNavbar is shared across Student/Instructor/Admin, and only the
// Admin layout wraps it in the provider — so this falls back to inert
// no-ops instead of throwing when called from a non-Admin route.
export function useAdminNavDrawer() {
  const ctx = useContext(AdminNavDrawerContext);
  return ctx || NOOP_CONTEXT;
}
