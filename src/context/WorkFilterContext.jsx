"use client";

import { createContext, useContext, useState, useCallback } from "react";

const WorkFilterContext = createContext(null);

const INITIAL_FILTERS = {
  courseId: "",
  batchId: "",
  moduleId: "",
  lessonId: "",
  status: "",
  startDate: "",
  endDate: "",
};

/**
 * Holds the Course/Batch/Module/Lesson/Status/Date filter selection shared by
 * every page under /instructor/work — mounted once in work/layout.jsx so the
 * selection survives navigating between Work pages (Quiz -> Assessment, etc).
 */
export function WorkFilterProvider({ children }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "courseId") {
        next.batchId = "";
        next.moduleId = "";
        next.lessonId = "";
      }
      if (key === "moduleId") {
        next.lessonId = "";
      }
      return next;
    });
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
  }, []);

  return (
    <WorkFilterContext.Provider
      value={{ filters, appliedFilters, updateFilter, applyFilters, resetFilters }}
    >
      {children}
    </WorkFilterContext.Provider>
  );
}

export function useWorkFilters() {
  const ctx = useContext(WorkFilterContext);
  if (!ctx) {
    throw new Error("useWorkFilters must be used within a WorkFilterProvider");
  }
  return ctx;
}
