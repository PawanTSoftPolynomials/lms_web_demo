"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import useAuth from "@/hooks/useAuth";
import useDashboard from "@/hooks/queries/student/useDashboard";

const QaContext = createContext(null);

const STORAGE_KEY = "orange_tree_qa_threads_v3";

export function QaProvider({ children }) {
  const { user } = useAuth();
  const { data: dashboardData } = useDashboard();
  const [threads, setThreads] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const enrolledCourses = useMemo(
    () =>
      (dashboardData?.enrolledCoursesList || [])
        .filter((e) => e.course?.title && e.courseId)
        .map((e) => ({ courseId: e.courseId, title: e.course.title })),
    [dashboardData]
  );

  // Load previously-asked questions from localStorage once on mount (client
  // only, avoids SSR/hydration mismatch). No seed/sample data — starts empty
  // until the student or an instructor actually posts something.
  useEffect(() => {
    if (hydrated) return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setThreads(JSON.parse(raw));
      }
    } catch {
      // ignore malformed storage, start empty
    }

    setHydrated(true);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // storage full/unavailable — non-critical, silently skip persistence
    }
  }, [threads, hydrated]);

  const askQuestion = useCallback(
    ({ courseId, courseTitle, title, body }) => {
      const thread = {
        id: `q-${Date.now()}`,
        courseId,
        courseTitle,
        title: title.trim(),
        body: body.trim(),
        askedByName: user?.name || "You",
        askedByMe: true,
        createdAt: Date.now(),
        upvotes: 0,
        upvotedByMe: false,
        replies: [],
      };
      setThreads((prev) => [thread, ...prev]);
      return thread.id;
    },
    [user]
  );

  const addReply = useCallback((threadId, body) => {
    if (!body.trim()) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              replies: [
                ...t.replies,
                {
                  id: `${threadId}-r${Date.now()}`,
                  authorName: "You",
                  authorRole: "STUDENT",
                  body: body.trim(),
                  createdAt: Date.now(),
                },
              ],
            }
          : t
      )
    );
  }, []);

  const toggleUpvote = useCallback((threadId) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, upvotedByMe: !t.upvotedByMe, upvotes: t.upvotes + (t.upvotedByMe ? -1 : 1) }
          : t
      )
    );
  }, []);

  const pendingCount = useMemo(
    () => threads.filter((t) => t.askedByMe && t.replies.length === 0).length,
    [threads]
  );

  const value = useMemo(
    () => ({ threads, enrolledCourses, askQuestion, addReply, toggleUpvote, pendingCount }),
    [threads, enrolledCourses, askQuestion, addReply, toggleUpvote, pendingCount]
  );

  return <QaContext.Provider value={value}>{children}</QaContext.Provider>;
}

export function useQa() {
  const ctx = useContext(QaContext);
  if (!ctx) {
    throw new Error("useQa must be used within a QaProvider");
  }
  return ctx;
}
