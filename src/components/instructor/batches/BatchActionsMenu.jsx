"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  UserPlus,
  UserMinus,
  MessageSquare,
  Download,
  FileSpreadsheet,
  BarChart2,
  Archive,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/shadcn/dropdown-menu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUpdateBatchStatus, useDeleteBatch, useStartBatchConversation } from "@/hooks/queries/instructor/useBatches";
import { getBatchDetailDashboard } from "@/services/batch.service";
import { exportBatchReportCsv, exportBatchStudentListCsv } from "@/lib/exportBatches";

/**
 * The four-button batch action bar (View Details / Analytics / Message
 * Batch / More) — shared verbatim by the card grid's footer and the
 * detail page's header, so there's one place these actions are wired up.
 */
export default function BatchActionsMenu({ batch, stopPropagation = true, hideViewDetails = false }) {
  const router = useRouter();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportingStudents, setExportingStudents] = useState(false);

  const updateStatus = useUpdateBatchStatus();
  const deleteBatch = useDeleteBatch();
  const startConversation = useStartBatchConversation();
  const primaryCourseId = batch.courseIds?.[0] ?? batch.courses?.[0]?.id;

  const wrap = (fn) => (e) => {
    if (stopPropagation) e.stopPropagation();
    fn();
  };

  const isArchived = batch.status === "ARCHIVED";

  const handleMessageBatch = () => {
    startConversation.mutate(batch.id, {
      onSuccess: (conversation) => {
        router.push(`/instructor/messages?conversationId=${conversation.id}`);
      },
    });
  };

  const handleExportStudents = async () => {
    setExportingStudents(true);
    try {
      const dashboard = await getBatchDetailDashboard(batch.id);
      exportBatchStudentListCsv(batch.name, dashboard.studentList);
    } finally {
      setExportingStudents(false);
    }
  };

  const handleArchiveToggle = () => {
    updateStatus.mutate(
      { batchId: batch.id, status: isArchived ? "ACTIVE" : "ARCHIVED" },
      { onSuccess: () => setConfirmArchive(false) }
    );
  };

  const handleDelete = () => {
    deleteBatch.mutate(batch.id, {
      onSuccess: () => {
        setConfirmDelete(false);
        router.push("/instructor/batches");
      },
    });
  };

  const btnClass =
    "flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[10.5px] font-bold text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5 w-full" onClick={(e) => stopPropagation && e.stopPropagation()}>
      {!hideViewDetails && (
        <button onClick={wrap(() => router.push(`/instructor/batches/${batch.id}`))} className={btnClass}>
          <Eye size={12} /> View Batch
        </button>
      )}
      <button
        onClick={wrap(() =>
          router.push(primaryCourseId ? `/instructor/analytics?courseId=${primaryCourseId}` : "/instructor/analytics")
        )}
        className={btnClass}
      >
        <BarChart2 size={12} /> Analytics
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => stopPropagation && e.stopPropagation()}
            title="More actions"
            aria-label="More actions"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition shrink-0"
          >
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={wrap(handleMessageBatch)} disabled={startConversation.isPending}>
            {startConversation.isPending ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
            Message Batch
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={wrap(() => router.push(`/instructor/batches/${batch.id}`))}>
            <UserPlus size={13} /> Add Students
          </DropdownMenuItem>
          <DropdownMenuItem onClick={wrap(() => router.push(`/instructor/batches/${batch.id}`))}>
            <UserMinus size={13} /> Remove Students
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={wrap(handleExportStudents)} disabled={exportingStudents}>
            {exportingStudents ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
            Export Student List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={wrap(() => exportBatchReportCsv(batch))}>
            <Download size={13} /> Download Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={wrap(() => setConfirmArchive(true))}>
            <Archive size={13} /> {isArchived ? "Unarchive Batch" : "Archive Batch"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={wrap(() => setConfirmDelete(true))}>
            <Trash2 size={13} /> Delete Batch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmArchive}
        title={isArchived ? "Unarchive Batch" : "Archive Batch"}
        message={
          isArchived
            ? `Restore "${batch.name}" to active?`
            : `Archive "${batch.name}"? Students keep their data; the batch just moves out of the active list.`
        }
        confirmText={isArchived ? "Unarchive" : "Archive"}
        onConfirm={handleArchiveToggle}
        onCancel={() => setConfirmArchive(false)}
        loading={updateStatus.isPending}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Batch"
        message={`Permanently delete "${batch.name}"? Students stay enrolled in their courses; this only removes the batch and its cohort grouping.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteBatch.isPending}
      />
    </div>
  );
}
