"use client";

import { useState } from "react";
import { Plus, Users, X, Loader2 } from "lucide-react";

import { WorkFilterProvider, useWorkFilters } from "@/context/WorkFilterContext";
import WorkFilterBar from "@/components/instructor/work/WorkFilterBar";
import DataTable from "@/components/ui/DataTable";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useMyBatches, useCreateBatch } from "@/hooks/queries/instructor/useBatches";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

function CreateBatchForm({ courses, onClose }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const createBatch = useCreateBatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    createBatch.mutate(
      { courseId, batchData: { name, startDate, dueDate: dueDate || undefined } },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-[#1A1F35] bg-white/[0.02] grid gap-3 sm:grid-cols-4">
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
        className="sm:col-span-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-orange-500"
      >
        <option value="">Select course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Batch name (e.g. Morning Cohort A)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="sm:col-span-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white placeholder-slate-500 outline-none focus:border-orange-500"
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
        className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-orange-500"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        placeholder="End date"
        className="bg-slate-950 border border-slate-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-orange-500"
      />
      <div className="sm:col-span-4 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 transition">
          Cancel
        </button>
        <button type="submit" disabled={createBatch.isPending} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition">
          {createBatch.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Create Batch
        </button>
      </div>
    </form>
  );
}

function BatchesContent() {
  const { appliedFilters } = useWorkFilters();
  const { data: courses = [] } = useInstructorCourses();
  const { data: batches = [], isLoading } = useMyBatches(appliedFilters);
  const [showForm, setShowForm] = useState(false);

  const columns = [
    { key: "name", header: "Batch" },
    { key: "course", header: "Course", render: (row) => row.course?.title || "—" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
          {row.status || "ACTIVE"}
        </span>
      ),
    },
    { key: "studentsCount", header: "Students", align: "center" },
    {
      key: "startDate",
      header: "Start Date",
      render: (row) => (row.startDate ? new Date(row.startDate).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Batches</h1>
          <p className="text-xs text-slate-400 mt-1">Manage student cohorts across all your courses.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Create Batch"}
        </button>
      </div>

      {showForm && <CreateBatchForm courses={courses} onClose={() => setShowForm(false)} />}

      <WorkFilterBar fields={["course", "status", "dateRange"]} statusOptions={STATUS_OPTIONS} />

      <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-orange-450" />
          <h3 className="text-[10.5px] font-black uppercase tracking-widest text-slate-350">{batches.length} Batches</h3>
        </div>
        <DataTable columns={columns} rows={batches} isLoading={isLoading} emptyLabel="No batches found for the selected filters." />
      </div>
    </div>
  );
}

export default function BatchesPage() {
  return (
    <WorkFilterProvider>
      <BatchesContent />
    </WorkFilterProvider>
  );
}
