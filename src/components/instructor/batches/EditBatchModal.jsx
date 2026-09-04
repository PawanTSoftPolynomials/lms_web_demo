"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import Modal from "@/components/ui/Modal";
import CourseMultiSelect from "@/components/instructor/batches/CourseMultiSelect";
import { useBatchDetail, useUpdateBatch } from "@/hooks/queries/instructor/useBatches";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useToast } from "@/components/ui/ToastProvider";

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/** Edit a batch's name, schedule, and linked courses — opened from BatchActionsMenu's "Edit Batch" item. */
export default function EditBatchModal({ batchId, open, onClose }) {
  const { data: batch, isLoading } = useBatchDetail(batchId);
  const { data: courses = [] } = useInstructorCourses();
  const updateBatch = useUpdateBatch();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseIds, setCourseIds] = useState([]);

  useEffect(() => {
    if (!batch) return;
    setName(batch.name || "");
    setStartDate(toDateInputValue(batch.startDate));
    setDueDate(toDateInputValue(batch.dueDate));
    setCourseIds((batch.courses || []).map((c) => c.id));
  }, [batch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseIds.length === 0) return;
    updateBatch.mutate(
      { batchId, data: { name, startDate, dueDate: dueDate || null, courseIds } },
      {
        onSuccess: onClose,
        onError: (err) => {
          showToast(err?.response?.data?.message || "Failed to update batch.", "error");
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Batch" size="md">
      {isLoading || !batch ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 overflow-y-auto">
          <div>
            <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
              Batch Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border text-xs px-3 py-2.5 rounded-xl text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-background border border-border text-xs px-3 py-2.5 rounded-xl text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={startDate || undefined}
                className="w-full bg-background border border-border text-xs px-3 py-2.5 rounded-xl text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9.5px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
              Courses ({courseIds.length} selected)
            </label>
            <CourseMultiSelect courses={courses} selectedIds={courseIds} onChange={setCourseIds} />
            {courseIds.length === 0 && (
              <p className="mt-1.5 text-[10.5px] text-amber-400">Select at least one course.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateBatch.isPending || courseIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10.5px] font-black text-foreground bg-primary hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {updateBatch.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
