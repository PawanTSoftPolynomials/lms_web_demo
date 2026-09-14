"use client";

import { useState } from "react";
import {
  FileText, Edit, Trash2, ArrowLeft,
  Clock, BookOpen, Calendar, Filter, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import AssessmentForm from "@/components/instructor/AssessmentForm";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import AssignmentSubmissionsPanel from "@/components/instructor/assignments/AssignmentSubmissionsPanel";
import FinalTestResultsPanel from "@/components/instructor/assignments/FinalTestResultsPanel";
import {
  useInstructorAssignments,
  useInstructorAssignmentContents,
  useUpdateAssignment,
  useDeleteAssignment,
} from "@/hooks/queries/instructor/useAssignments";
import { unescapeFromContentApi } from "@/lib/markdown";

// Two views of student work: assignment submissions, and MCQ attempts on
// Final tests (Self-Tests are practice, so they're left out).
const VIEWS = [
  { key: "assignments", label: "Assignment submissions" },
  { key: "final-tests", label: "Final test results" },
];

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [courseFilter, setCourseFilter] = useState("all");
  const [activeView, setActiveView] = useState("assignments");
  const [editingAssignment, setEditingAssignment] = useState(null);
  // Which assignment's student submissions are expanded, if any.
  const [openSubmissionsId, setOpenSubmissionsId] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: assignments = [], isLoading: loadingAssignments } = useInstructorAssignments();
  // Assignment cells added in the Course Composer are Content rows, not
  // Assignment rows, so they come from their own endpoint.
  const { data: contentAssignments = [], isLoading: loadingContentAssignments } =
    useInstructorAssignmentContents();
  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();

  // Filter courses: Owned by instructor and PUBLISHED
  const eligibleCourses = courses.filter(
    (c) => c.creatorId === user?.id && c.status === "PUBLISHED"
  );

  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const openEditForm = (assignment) => {
    setEditingAssignment(assignment);
    setErrorMsg("");
  };

  const closeForm = () => {
    setEditingAssignment(null);
  };

  const handleFormSubmit = (payload) => {
    if (!payload.courseId) {
      setErrorMsg("Please select a target course.");
      return;
    }

    updateMutation.mutate(
      { id: editingAssignment.id, payload },
      {
        onSuccess: () => {
          setSuccessMsg("Assignment updated successfully!");
          closeForm();
          setTimeout(() => setSuccessMsg(""), 4000);
        },
        onError: (err) => setErrorMsg(err.response?.data?.message || "Failed to update assignment."),
      }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          setSuccessMsg("Assignment deleted successfully!");
          setTimeout(() => setSuccessMsg(""), 4000);
        },
        onError: (err) => setErrorMsg(err.response?.data?.message || "Failed to delete assignment."),
      });
    }
  };

  if (loadingAssignments || loadingContentAssignments || loadingCourses) return <Loader />;

  // Filter assignments list — draft courses aren't graded yet, so only
  // surface work that belongs to a course the instructor has published.
  const filteredAssignments = assignments.filter((a) => {
    if (a.course?.status !== "PUBLISHED") return false;
    if (courseFilter === "all") return true;
    return a.courseId === courseFilter || a.course?.id === courseFilter;
  });
  const filteredContentAssignments = contentAssignments.filter((a) => {
    if (a.course?.status !== "PUBLISHED") return false;
    return courseFilter === "all" || a.course?.id === courseFilter;
  });

  const renderSubmissionsToggle = (id, pendingCount) => (
    <button
      type="button"
      onClick={() => setOpenSubmissionsId((prev) => (prev === id ? null : id))}
      className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition cursor-pointer hover:border-primary/40 hover:text-primary"
      aria-expanded={openSubmissionsId === id}
    >
      {openSubmissionsId === id ? "Hide Submissions" : "View Submissions"}
      {pendingCount > 0 && (
        <span className="rounded-full bg-primary/15 border border-primary/25 px-1.5 py-0.5 text-[9px] font-black text-primary">
          {pendingCount} ungraded
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl border border-transparent bg-background/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/instructor/dashboard")}
              aria-label="Back to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-transparent text-foreground hover:text-foreground hover:border-primary transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Grading &amp; Results</h1>
              <p className="text-xs text-muted-foreground">
                Grade your students&apos; assignment submissions and see how they did on Final tests.
              </p>
            </div>
          </div>

          {/* View switch — the course selector below filters both views. */}
          <div
            role="tablist"
            aria-label="Student work"
            className="inline-flex self-start rounded-xl border border-border bg-card p-1 sm:self-auto"
          >
            {VIEWS.map((view) => {
              const active = activeView === view.key;
              return (
                <button
                  key={view.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveView(view.key)}
                  className={`min-h-[36px] rounded-lg px-4 text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-4 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 border border-transparent bg-background/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-2.5">
              <Filter size={14} className="text-muted-foreground" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-foreground">Filters</h3>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-muted-foreground font-semibold">Course Selector</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-750 bg-background px-3 py-2.5 text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">All Courses</option>
                  {eligibleCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Assignments List (Right Column) */}
        <div className="lg:col-span-3 space-y-4">
          {activeView === "final-tests" ? (
            <FinalTestResultsPanel courseId={courseFilter === "all" ? undefined : courseFilter} />
          ) : filteredAssignments.length === 0 && filteredContentAssignments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs border border-transparent bg-background/60">
              <FileText className="mx-auto text-slate-600 mb-3" size={24} />
              No assignments found. Add an Assignment content cell from within a course's Composer to create one.
            </Card>
          ) : (
            <>
            {/* Lesson assignments — Assignment cells from the Course Composer.
                Edited in the Composer itself, so only submissions live here. */}
            {filteredContentAssignments.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Lesson Assignments
                </h2>
                <div className="grid gap-4">
                  {filteredContentAssignments.map((a) => (
                    <Card key={a.id} className="p-5 border border-slate-850 bg-background/40 hover:border-transparent transition duration-300 flex flex-col gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary border border-primary/20">
                            {a.course?.title || "General"}
                          </span>
                          {(a.lessonTitle || a.topicTitle) && (
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {[a.lessonTitle, a.topicTitle].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                        <h3 className="text-md font-bold text-foreground leading-tight">{a.title || "Assignment"}</h3>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2 max-w-xl">
                          {a.description ? unescapeFromContentApi(a.description) : "No description provided."}
                        </p>
                      </div>

                      <div className="border-t border-border/60 pt-3">
                        {renderSubmissionsToggle(a.id, a.pendingSubmissionsCount)}
                        <AssignmentSubmissionsPanel
                          contentId={a.id}
                          open={openSubmissionsId === a.id}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {filteredAssignments.length > 0 && (
            <section className="space-y-3">
            {filteredContentAssignments.length > 0 && (
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                Course Assessments
              </h2>
            )}
            <div className="grid gap-4">
              {filteredAssignments.map((a) => (
                <Card key={a.id} className="p-5 border border-slate-850 bg-background/40 hover:border-transparent transition duration-300 flex flex-col gap-4">
                  <div className="flex flex-col justify-between md:flex-row md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary border border-primary/20">
                        {a.course?.title || "General"}
                      </span>
                      {!a.isPublished && (
                        <span className="rounded bg-slate-850 px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-md font-bold text-foreground leading-tight">{a.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 max-w-xl">{a.description || "No description provided."}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-1 text-[10px] text-muted-foreground font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span>Due {new Date(a.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span>{a.estimatedTime || 0}m Est. Time</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} className="text-muted-foreground" />
                        <span>{a.totalQuestions || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => openEditForm(a)}
                      className="p-2.5 rounded-xl bg-muted/80 border border-transparent text-foreground hover:text-foreground hover:border-primary transition cursor-pointer"
                      title="Edit Assignment"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2.5 rounded-xl bg-muted/80 border border-transparent text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
                      title="Delete Assignment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  </div>

                  {/* Student submissions — the actual PDFs students uploaded. */}
                  <div className="border-t border-border/60 pt-3">
                    {renderSubmissionsToggle(a.id, a.pendingSubmissionsCount)}
                    <AssignmentSubmissionsPanel
                      assignmentId={a.id}
                      open={openSubmissionsId === a.id}
                    />
                  </div>
                </Card>
              ))}
            </div>
            </section>
            )}
            </>
          )}
        </div>
      </div>

      {/* Modal/Drawer Form Overlay */}
      {editingAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="max-w-2xl w-full border border-transparent bg-background p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-6 border-b border-slate-850 pb-3">
              Edit Assignment
            </h3>

            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-transparent px-4 py-2 text-xs font-bold text-foreground hover:text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <AssessmentForm
              mode="edit"
              initialValues={editingAssignment}
              courses={eligibleCourses}
              loading={updateMutation.isPending}
              submitError={errorMsg}
              onSubmit={handleFormSubmit}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
