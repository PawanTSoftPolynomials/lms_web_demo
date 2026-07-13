"use client";

import { useMemo, useState } from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";
import AssignmentFilters from "@/components/student/assignments/AssignmentFilters";
import AssignmentCard from "@/components/student/assignments/AssignmentCard";
import AssignmentSummaryPanel from "@/components/student/assignments/AssignmentSummaryPanel";
import useAssignments from "@/hooks/queries/student/useAssignments";

const TABS = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Submitted", value: "Submitted" },
  { label: "Graded", value: "Graded" },
];

const normalizeStatus = (assignment) =>
  assignment.status || assignment.submissionStatus || "Not Submitted";

export default function StudentAssignmentsPage() {
  const { data: assignments = [], isLoading, isError } = useAssignments();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("due-earliest");
  const [activeTab, setActiveTab] = useState("all");

  const courseOptions = useMemo(
    () =>
      [...new Set(
        assignments
          .map((assignment) => assignment.course?.title || assignment.courseTitle)
          .filter(Boolean)
      )],
    [assignments]
  );

  const filteredAssignments = useMemo(() => {
    let list = [...assignments];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      list = list.filter(
        (assignment) =>
          assignment.title?.toLowerCase().includes(keyword) ||
          assignment.description?.toLowerCase().includes(keyword) ||
          (assignment.course?.title || assignment.courseTitle || "")
            .toLowerCase()
            .includes(keyword)
      );
    }

    if (courseFilter) {
      list = list.filter(
        (assignment) =>
          (assignment.course?.title || assignment.courseTitle) ===
          courseFilter
      );
    }

    if (statusFilter) {
      list = list.filter(
        (assignment) => normalizeStatus(assignment) === statusFilter
      );
    }

    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        list = list.filter((assignment) => {
          const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
          return due && due >= new Date();
        });
      } else {
        list = list.filter((assignment) => normalizeStatus(assignment) === activeTab);
      }
    }

    if (sortBy === "due-latest") {
      list.sort(
        (a, b) =>
          new Date(b.dueDate || 0) - new Date(a.dueDate || 0)
      );
    } else if (sortBy === "course") {
      list.sort((a, b) =>
        (a.course?.title || a.courseTitle || "").localeCompare(
          b.course?.title || b.courseTitle || ""
        )
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(a.dueDate || 0) - new Date(b.dueDate || 0)
      );
    }

    return list;
  }, [assignments, search, courseFilter, statusFilter, sortBy, activeTab]);

  const statusCounts = useMemo(() => {
    return assignments.reduce((counts, assignment) => {
      const status = normalizeStatus(assignment);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {
      "Not Submitted": 0,
      "In Progress": 0,
      Submitted: 0,
      Graded: 0,
    });
  }, [assignments]);

  const upcomingDeadlines = useMemo(() => {
    return assignments
      .filter((assignment) => {
        const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
        return due && due >= new Date();
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [assignments]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-white">
          Unable to load assignments
        </h2>
        <p className="mt-2 text-slate-400">
          Please try again later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Assignments"
        subtitle="Review, submit, and track all your course assignments."
      >
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-orange-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AssignmentFilters
            search={search}
            setSearch={setSearch}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            courseOptions={courseOptions}
          />

          {filteredAssignments.length > 0 ? (
            <div className="grid gap-4">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-white">
                No assignments found
              </h2>
              <p className="mt-2 text-slate-400">
                Try adjusting your filters or search term.
              </p>
            </Card>
          )}
        </div>

        <AssignmentSummaryPanel
          statusCounts={statusCounts}
          upcomingDeadlines={upcomingDeadlines}
        />
      </div>
    </div>
  );
}
