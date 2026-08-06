"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const StudentNavDrawerContext = createContext(null);

// Shared open/close state for the Student mobile navigation drawer, so the
// trigger (the header's hamburger button) and the drawer panel itself can
// live in different parts of the tree without prop-drilling through
// DashboardLayout/DashboardNavbar (which are also shared with Instructor).
export function StudentNavDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  return <StudentNavDrawerContext.Provider value={value}>{children}</StudentNavDrawerContext.Provider>;
}

const NOOP_CONTEXT = { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} };

// DashboardNavbar is shared across Student/Instructor/Admin, and only the
// Student layout wraps it in the provider — so this falls back to inert
// no-ops instead of throwing when called from a non-Student route.
export function useStudentNavDrawer() {
  const ctx = useContext(StudentNavDrawerContext);
  return ctx || NOOP_CONTEXT;
}
