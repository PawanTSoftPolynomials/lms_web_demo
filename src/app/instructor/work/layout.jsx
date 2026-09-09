"use client";

import { WorkFilterProvider } from "@/context/WorkFilterContext";

/**
 * Nests under the instructor layout (which already renders DashboardLayout +
 * NavigationStrip) — this only adds the shared filter-selection boundary so
 * Course/Batch/Module/Lesson/Status/Date Range persist while navigating
 * between the five Work pages (Quiz, Assessment, Question Repository,
 * Upload Documents, Notes).
 */
export default function WorkLayout({ children }) {
  return (
    <WorkFilterProvider>
      <div className="space-y-6 pb-12">{children}</div>
    </WorkFilterProvider>
  );
}
