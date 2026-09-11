"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, Hourglass } from "lucide-react";

import PageHeader from "@/components/layouts/PageHeader";
import AssignmentCard from "@/components/student/assignments/AssignmentCard";
import useAssignments from "@/hooks/queries/student/useAssignments";
import { normalizeAssignmentStatus } from "@/features/student/constants/assignmentsConfig";

// Where an assignment can stand, in the order a student acts on it. The
// grouping replaces filters, tabs and stat tiles: the page is just the list.
// Each section's icon chip uses the same colour as its cards' status edge.
const SECTIONS = [
  {
    key: "todo",
    title: "To do",
    statuses: ["Not Submitted", "In Progress"],
    icon: ClipboardList,
    tone: "bg-primary/15 text-primary",
  },
  {
    key: "submitted",
    title: "Awaiting grade",
    statuses: ["Submitted"],
    icon: Hourglass,
    tone: "bg-amber-500/10 text-amber-500",
  },
  {
    key: "graded",
    title: "Graded",
    statuses: ["Graded"],
    icon: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-500",
  },
];

const toTime = (value) => (value ? new Date(value).getTime() : null);

// To do: soonest deadline first, undated last. Submitted/graded: newest first.
function sortForSection(key, list) {
  if (key === "todo") {
    return [...list].sort((a, b) => {
      const ad = toTime(a.dueDate);
      const bd = toTime(b.dueDate);
      if (ad === bd) return 0;
      if (ad === null) return 1;
      if (bd === null) return -1;
      return ad - bd;
    });
  }
  return [...list].sort((a, b) => (toTime(b.submittedAt) ?? 0) - (toTime(a.submittedAt) ?? 0));
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="h-1.5 bg-muted animate-pulse" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-5 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-20 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Other pages link here scoped to one course (?course=<title>).
  const courseContext = searchParams.get("course") || "";
  const { data: assignments = [], isLoading, isError } = useAssignments();

  const sections = useMemo(() => {
    const scoped = courseContext
      ? assignments.filter((a) => (a.course?.title || a.courseTitle) === courseContext)
      : assignments;

    return SECTIONS.map((section) => ({
      ...section,
      items: sortForSection(
        section.key,
        scoped.filter((a) => section.statuses.includes(normalizeAssignmentStatus(a)))
      ),
    })).filter((section) => section.items.length > 0);
  }, [assignments, courseContext]);

  if (isLoading) return <AssignmentsSkeleton />;

  return (
    <div>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="xl:hidden shrink-0 flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:bg-muted/60 transition-colors cursor-pointer bg-transparent border-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <PageHeader
            title="Assignments"
            subtitle={
              courseContext
                ? `Your assignments in ${courseContext}, with grades and feedback from your instructor.`
                : "Everything you've been assigned across your courses, with grades and feedback from your instructors."
            }
          />
        </div>
      </div>

      {isError ? (
        <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Your assignments couldn&apos;t be loaded. Refresh the page to try again.
        </p>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-base font-semibold text-foreground">No assignments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When your instructors add assignments to your courses, they&apos;ll appear here.
          </p>
          <Link
            href="/student/my-courses"
            className="mt-5 inline-flex min-h-[40px] items-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Go to my courses
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.key} aria-labelledby={`assignments-${section.key}`}>
              <h2
                id={`assignments-${section.key}`}
                className="mb-4 flex items-center gap-2.5 text-base font-semibold text-foreground"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${section.tone}`}>
                  <section.icon size={15} aria-hidden />
                </span>
                {section.title}
                <span className="text-sm font-normal text-muted-foreground tabular-nums">
                  {section.items.length}
                </span>
              </h2>
              {/* Tiles: 1 column on phones, 2 on tablets, 3 on wide screens.
                  Each li is a flex item so every tile in a row matches height. */}
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {section.items.map((assignment) => (
                  <li key={assignment.id} className="flex">
                    <AssignmentCard assignment={assignment} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <Suspense fallback={<AssignmentsSkeleton />}>
      <AssignmentsPageContent />
    </Suspense>
  );
}
