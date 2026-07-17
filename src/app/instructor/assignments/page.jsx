"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Filter,
  CheckCircle,
  X,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/common/Loader";

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [courseFilter, setCourseFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [resources, setResources] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all assignments for this instructor
  const { data: assignments = [], isLoading: loadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ["instructorAssignmentsList"],
    queryFn: async () => {
      const { data } = await api.get("/assignments");
      return data.data ?? data;
    },
  });

  // Fetch all courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["instructorCoursesList"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data.data ?? data;
    },
  });

  // Filter courses: Owned by instructor and PUBLISHED
  const eligibleCourses = courses.filter(
    (c) => c.creatorId === user?.id && c.status === "PUBLISHED"
  );

  // Create Assignment Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/assignments", payload);
      return data;
    },
    onSuccess: () => {
      setSuccessMsg("Assignment created successfully!");
      closeForm();
      refetchAssignments();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || "Failed to create assignment.");
    },
  });

  // Update Assignment Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/assignments/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      setSuccessMsg("Assignment updated successfully!");
      closeForm();
      refetchAssignments();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || "Failed to update assignment.");
    },
  });

  // Delete Assignment Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/assignments/${id}`);
    },
    onSuccess: () => {
      setSuccessMsg("Assignment deleted successfully!");
      refetchAssignments();
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || "Failed to delete assignment.");
    },
  });

  const openCreateForm = () => {
    setEditingAssignment(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setCourseId(eligibleCourses[0]?.id || "");
    setTotalQuestions(0);
    setEstimatedTime(0);
    setResources(0);
    setIsPublished(true);
    setIsFormOpen(true);
    setErrorMsg("");
  };

  const openEditForm = (assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || "");
    // Format date to YYYY-MM-DD
    const dateFormatted = assignment.dueDate ? new Date(assignment.dueDate).toISOString().split("T")[0] : "";
    setDueDate(dateFormatted);
    setCourseId(assignment.courseId || assignment.course?.id || "");
    setTotalQuestions(assignment.totalQuestions || 0);
    setEstimatedTime(assignment.estimatedTime || 0);
    setResources(assignment.resources || 0);
    setIsPublished(assignment.isPublished !== undefined ? assignment.isPublished : true);
    setIsFormOpen(true);
    setErrorMsg("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseId) {
      setErrorMsg("Please select a target course.");
      return;
    }

    const payload = {
      title,
      description,
      dueDate,
      courseId,
      totalQuestions: Number(totalQuestions),
      estimatedTime: Number(estimatedTime),
      resources: Number(resources),
      isPublished,
    };

    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteMutation.mutate(id);
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/instructor/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-orange-500 transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Manage Assignments</h1>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Create, edit, and review learning assignments for student courses</p>
            </div>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 cursor-pointer rounded-xl bg-orange-650 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 transition duration-200"
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
          <Card className="p-4 border border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-850 pb-2.5">
              <Filter size={14} className="text-slate-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Filters</h3>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-400 font-semibold">Course Selector</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-750 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-orange-500 cursor-pointer"
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
            <Card className="p-8 text-center text-slate-400 text-xs border border-slate-800 bg-slate-900/60">
              <FileText className="mx-auto text-slate-600 mb-3" size={24} />
              No assignments found. Click "Add Assignment" to create one!
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssignments.map((a) => (
                <Card key={a.id} className="p-5 border border-slate-850 bg-slate-900/40 hover:border-slate-800 transition duration-300 flex flex-col justify-between md:flex-row md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-400 border border-orange-500/20">
                        {a.course?.title || "General"}
                      </span>
                      {!a.isPublished && (
                        <span className="rounded bg-slate-850 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-md font-bold text-white leading-tight">{a.title}</h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 max-w-xl">{a.description || "No description provided."}</p>
                    
                    <div className="flex flex-wrap gap-4 pt-1 text-[10px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span>Due {new Date(a.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-500" />
                        <span>{a.estimatedTime || 0}m Est. Time</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} className="text-slate-500" />
                        <span>{a.totalQuestions || 0} Questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => openEditForm(a)}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-orange-500 transition cursor-pointer"
                      title="Edit Assignment"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition cursor-pointer"
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
          <Card className="max-w-2xl w-full border border-slate-800 bg-slate-950 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-850 pb-3">
              {editingAssignment ? "Edit Assignment" : "Add Assignment"}
            </h3>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3 rounded-xl mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Select Target Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  disabled={!!editingAssignment}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- Select Course --</option>
                  {eligibleCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <Input
                label="Assignment Title"
                placeholder="e.g. Intermediate Java Final Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  placeholder="Enter assignment directions and instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              {/* Grid 1: Due Date & Total Questions */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
                  />
                </div>
                <Input
                  label="Total Questions"
                  type="number"
                  placeholder="0"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  required
                />
              </div>

              {/* Grid 2: Est. Time & Resources */}
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Estimated Time (Minutes)"
                  type="number"
                  placeholder="0"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  required
                />
                <Input
                  label="Reference Resources Count"
                  type="number"
                  placeholder="0"
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  required
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Publish Assignment immediately to enrolled students
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Assignment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
