"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, HelpCircle, Award, Clock } from "lucide-react";

import useAssignments from "@/hooks/queries/student/useAssignments";
import useQuizzes from "@/hooks/queries/student/useQuizzes";
import Modal from "@/components/ui/Modal";

// The five tabs — Quiz is its own model; Assessment/Test/Exam/Project all
// live on the Assignment model via its assessmentType field (an untyped
// Assignment defaults to "Assessment" here, matching the tab set).
const TABS = ["Quiz", "Assignment", "Assessment", "Test", "Exam", "Project"];

const MAX_ITEMS = 8;

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      <span className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
        <Icon size={14} className="text-primary" />
        {label}
      </span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// New quizzes, assessments, tests, exams, and projects assigned by an
// instructor (through a course, batch, or direct assignment) — merged from
// the two backend sources that carry this work, newest first, filterable by
// type. Quiz rows open a details popup (name/course/questions/marks/passing
// marks/duration) with a "Take Me to Quiz" button that starts the attempt;
// other types click straight through to that item.
export default function NewAssignedWorkPanel() {
  const router = useRouter();
  const { data: assignments = [], isLoading: isAssignmentsLoading } = useAssignments();
  const { data: quizzes = [], isLoading: isQuizzesLoading } = useQuizzes();
  const [activeTab, setActiveTab] = useState("Quiz");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const isLoading = isAssignmentsLoading || isQuizzesLoading;

  const allItems = useMemo(
    () => [
      ...assignments.map((a) => ({
        id: `assignment-${a.id}`,
        title: a.title,
        type: a.assessmentType || "Assessment",
        courseTitle: a.course?.title || "your course",
        createdAt: a.createdAt,
        href: `/student/assignments/${a.id}`,
      })),
      ...quizzes.map((q) => ({
        id: `quiz-${q.id}`,
        title: q.title,
        type: "Quiz",
        courseTitle: q.course?.title || "your course",
        createdAt: q.createdAt,
        href: `/student/attempt/${q.id}`,
        totalQuestions: q._count?.quizQuestions ?? 0,
        totalMarks: q.totalMarks ?? 0,
        passingScore: q.passingScore,
        timeLimit: q.timeLimit,
      })),
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [assignments, quizzes]
  );

  const tabItems = allItems.filter((item) => item.type === activeTab).slice(0, MAX_ITEMS);

  return (
    <div className="flex flex-col h-full">
      {/* Type tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-3 shrink-0 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 pb-2 text-xs font-bold uppercase tracking-wide transition border-b-2 cursor-pointer ${
              activeTab === tab
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-4 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : tabItems.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">
          No new {activeTab.toLowerCase()} work assigned yet.
        </p>
      ) : (
        <div className="space-y-2">
          {tabItems.map((item) =>
            item.type === "Quiz" ? (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedQuiz(item)}
                className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition group text-left w-full cursor-pointer"
              >
                <ChevronRight size={12} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span className="truncate">
                  New {item.courseTitle} {item.type.toLowerCase()}{" "}
                  <span className="font-bold">{item.title}</span> arrived
                </span>
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition group"
              >
                <ChevronRight size={12} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span className="truncate">
                  New {item.courseTitle} {item.type.toLowerCase()}{" "}
                  <span className="font-bold">{item.title}</span> arrived
                </span>
              </Link>
            )
          )}
        </div>
      )}

      {/* Quiz details popup — plain card, no blurred/dimmed backdrop, just
          this one popup shown over the (still sharp) page behind it. */}
      <Modal
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        title={selectedQuiz?.title}
        size="sm"
        blurBackdrop={false}
      >
        {selectedQuiz && (
          <div className="flex flex-col">
            <div>
              <DetailRow icon={BookOpen} label="Course" value={selectedQuiz.courseTitle} />
              <DetailRow icon={HelpCircle} label="Number of Questions" value={selectedQuiz.totalQuestions} />
              <DetailRow icon={Award} label="Marks" value={selectedQuiz.totalMarks} />
              <DetailRow
                icon={Award}
                label="Passing Marks"
                value={
                  selectedQuiz.passingScore != null && selectedQuiz.totalMarks
                    ? `${Math.round((selectedQuiz.passingScore / 100) * selectedQuiz.totalMarks)} (${selectedQuiz.passingScore}%)`
                    : selectedQuiz.passingScore != null
                      ? `${selectedQuiz.passingScore}%`
                      : "—"
                }
              />
              <DetailRow
                icon={Clock}
                label="Duration"
                value={selectedQuiz.timeLimit ? `${selectedQuiz.timeLimit} min` : "No time limit"}
              />
            </div>

            <button
              type="button"
              onClick={() => router.push(selectedQuiz.href)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition cursor-pointer"
            >
              Take Me to Quiz
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
