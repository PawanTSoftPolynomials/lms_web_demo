"use client";

import { useState } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useCourseBatches } from "@/hooks/queries/instructor/useBatches";

const INITIAL_FORM = {
  courseId: "",
  batchId: "",
  title: "",
  duration: 60,
  startDate: "",
  dueDate: "",
  instructions: "",
  isPublished: true,
};

/**
 * "Test" create form (backend: Exam model, extended in Phase 0 with
 * batchId + instructions). When `lockedCourseId` isn't given, Course and
 * Batch are picked directly in this form instead of via an external filter.
 */
export default function ExamForm({ courses = null, lockedCourseId = null, loading = false, submitError = "", onSubmit }) {
  const [formData, setFormData] = useState({ ...INITIAL_FORM, courseId: lockedCourseId || "" });

  const { data: batches = [] } = useCourseBatches(formData.courseId || undefined);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "courseId" ? { batchId: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      ...formData,
      batchId: formData.batchId || null,
      duration: Number(formData.duration),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3 rounded-xl">
          {submitError}
        </div>
      )}

      {!lockedCourseId && courses && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-transparent bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Batch (optional)</label>
            <select
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              disabled={!formData.courseId}
              className="w-full rounded-lg border border-transparent bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <Input
        label="Test Name"
        name="title"
        placeholder="e.g. Unit 3 Proctored Test"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-transparent bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-transparent bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
        <Input
          label="Duration (Minutes)"
          name="duration"
          type="number"
          min="1"
          value={formData.duration}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Instructions</label>
        <textarea
          name="instructions"
          rows={4}
          placeholder="Rules, permitted materials, submission instructions..."
          value={formData.instructions}
          onChange={handleChange}
          className="w-full resize-none rounded-lg border border-transparent bg-background px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-3 bg-background/40 p-3 rounded-lg border border-slate-850">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-4 w-4 rounded border-transparent bg-background text-primary focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
        />
        <label htmlFor="isPublished" className="text-xs font-semibold text-foreground cursor-pointer select-none">
          Publish immediately to enrolled students
        </label>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-850">
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Test"}
        </Button>
      </div>
    </form>
  );
}
