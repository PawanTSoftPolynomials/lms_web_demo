"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText, Plus, Edit, Trash2, ArrowLeft,
  Clock, BookOpen, Calendar, Filter, X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";
import AssessmentForm from "@/components/instructor/AssessmentForm";

import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import {
  useInstructorAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
} from "@/hooks/queries/instructor/useAssignments";

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [courseFilter, setCourseFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [presetCourseId, setPresetCourseId] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: assignments = [], isLoading: loadingAssignments } = useInstructorAssignments();
  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();

  // Filter courses: Owned by instructor and PUBLISHED
  const eligibleCourses = courses.filter(
    (c) => c.creatorId === user?.id && c.status === "PUBLISHED"
  );

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    const action = searchParams.get("action");
    const paramCourseId = searchParams.get("courseId");
    
    if (action === "create" && eligibleCourses.length > 0 && !hasAutoOpened.current) {
      setPresetCourseId(paramCourseId || eligibleCourses[0]?.id || "");
      setIsFormOpen(true);
      hasAutoOpened.current = true;
    }
  }, [searchParams, eligibleCourses]);

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const openCreateForm = () => {
    setEditingAssignment(null);
    setPresetCourseId(eligibleCourses[0]?.id || "");
    setIsFormOpen(true);
    setErrorMsg("");
  };

  const openEditForm = (assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
    setErrorMsg("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  const handleFormSubmit = (payload) => {
    if (!payload.courseId) {
      setErrorMsg("Please select a target course.");
      return;
    }

    if (editingAssignment) {
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
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setSuccessMsg("Assignment created successfully!");
          closeForm();
          setTimeout(() => setSuccessMsg(""), 4000);
        },
        onError: (err) => setErrorMsg(err.response?.data?.message || "Failed to create assignment."),
      });
    }
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

  if (loadingAssignments || loadingCourses) return <Loader />;

  // Filter assignments list
  const filteredAssignments = assignments.filter((a) => {
    if (courseFilter === "all") return true;
    return a.courseId === courseFilter || a.course?.id === courseFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl border border-transparent bg-background/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/instructor/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-transparent text-foreground hover:text-foreground hover:border-primary transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="sr-only">Manage Assignments</h1>
              <p className="sr-only">Create, edit, and review learning assignments for student courses</p>
            </div>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 cursor-pointer rounded-xl bg-orange-650 hover:bg-orange-700 text-foreground font-bold text-xs px-4 py-2.5 transition duration-200"
          >
            <Plus size={15} />
            Add Assignment
          </button>
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
          {filteredAssignments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs border border-transparent bg-background/60">
              <FileText className="mx-auto text-slate-600 mb-3" size={24} />
              No assignments found. Click "Add Assignment" to create one!
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssignments.map((a) => (
                <Card key={a.id} className="p-5 border border-slate-850 bg-background/40 hover:border-transparent transition duration-300 flex flex-col justify-between md:flex-row md:items-center gap-4">
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
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal/Drawer Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="max-w-2xl w-full border border-transparent bg-background p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-6 border-b border-slate-850 pb-3">
              {editingAssignment ? "Edit Assignment" : "Add Assignment"}
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
              mode={editingAssignment ? "edit" : "create"}
              initialValues={editingAssignment || (presetCourseId ? { courseId: presetCourseId } : null)}
              courses={eligibleCourses}
              loading={createMutation.isPending || updateMutation.isPending}
              submitError={errorMsg}
              onSubmit={handleFormSubmit}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
