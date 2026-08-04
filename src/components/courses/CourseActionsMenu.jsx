"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Pencil, Copy, UploadCloud, Archive, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/shadcn/dropdown-menu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useUpdateCourseStatus } from "@/hooks/queries/instructor/useUpdateCourseStatus";
import { useDuplicateCourse } from "@/hooks/queries/instructor/useDuplicateCourse";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";

/**
 * View / Edit / kebab(Duplicate, Publish|Archive, Delete) — the fixed action
 * set for every course row, shared by both the table and grid views.
 */
export default function CourseActionsMenu({ course, stopPropagation = true }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateStatus = useUpdateCourseStatus();
  const duplicateCourse = useDuplicateCourse();
  const deleteCourse = useDeleteCourse();

  const wrap = (fn) => (e) => {
    if (stopPropagation) e.stopPropagation();
    fn();
  };

  const handleArchiveToggle = () => {
    updateStatus.mutate({ courseId: course.id, status: course.status === "ARCHIVED" ? "DRAFT" : "ARCHIVED" });
  };

  const handlePublishToggle = () => {
    updateStatus.mutate({ courseId: course.id, status: course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
  };

  const handleDelete = () => {
    deleteCourse.mutate(course.id, { onSuccess: () => setConfirmDelete(false) });
  };

  return (
    <div className="flex items-center gap-1.5 justify-end" onClick={(e) => stopPropagation && e.stopPropagation()}>
      <button
        onClick={wrap(() => router.push(`/instructor/courses/${course.id}`))}
        title="View"
        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
      >
        <Eye size={13} />
      </button>
      <button
        onClick={wrap(() => router.push(`/instructor/courses/edit/${course.id}`))}
        title="Edit"
        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
      >
        <Pencil size={13} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => stopPropagation && e.stopPropagation()}
            title="More actions"
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <MoreVertical size={13} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={wrap(() => duplicateCourse.mutate(course.id))} disabled={duplicateCourse.isPending}>
            <Copy size={13} /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={wrap(handlePublishToggle)} disabled={updateStatus.isPending}>
            <UploadCloud size={13} /> {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={wrap(handleArchiveToggle)} disabled={updateStatus.isPending}>
            <Archive size={13} /> {course.status === "ARCHIVED" ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={wrap(() => setConfirmDelete(true))}>
            <Trash2 size={13} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Course"
        message={`Delete "${course.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteCourse.isPending}
      />
    </div>
  );
}
