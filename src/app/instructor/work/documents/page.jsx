"use client";

import { useState } from "react";
import { UploadCloud, Loader2, FileText, Video, Presentation, Archive, File as FileIcon } from "lucide-react";

import Card from "@/components/ui/Card";
import CourseModuleLessonSelect from "@/components/instructor/work/CourseModuleLessonSelect";
import DataTable from "@/components/ui/DataTable";
import { useContents } from "@/hooks/queries/instructor/useContents";
import { useCreateContent } from "@/hooks/queries/instructor/useCreateContent";
import { uploadContentFile } from "@/services/content.service";

const EXTENSION_TYPE_MAP = {
  pdf: "PDF",
  ppt: "PRESENTATION",
  pptx: "PRESENTATION",
  doc: "DOCUMENT",
  docx: "DOCUMENT",
  zip: "FILE",
  mp4: "VIDEO",
  mov: "VIDEO",
  webm: "VIDEO",
};

const TYPE_ICON = {
  PDF: FileText,
  PRESENTATION: Presentation,
  DOCUMENT: FileText,
  FILE: Archive,
  VIDEO: Video,
};

function inferType(fileName) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return EXTENSION_TYPE_MAP[ext] || "FILE";
}

export default function WorkUploadDocumentsPage() {
  const [selection, setSelection] = useState({ courseId: "", moduleId: "", lessonId: "", topicId: "" });
  const { topicId } = selection;

  const { data: contents = [], isLoading } = useContents(topicId);
  const createContent = useCreateContent();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !topicId) return;

    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const { fileUrl } = await uploadContentFile(file);
        const nextOrder = contents.length > 0 ? Math.max(...contents.map((c) => c.order || 0)) + 1 : 1;
        await createContent.mutateAsync({
          topicId,
          order: nextOrder,
          type: inferType(file.name),
          title: file.name,
          fileUrl,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const columns = [
    {
      key: "title",
      header: "File",
      render: (row) => {
        const Icon = TYPE_ICON[row.type] || FileIcon;
        return (
          <span className="flex items-center gap-2 font-semibold text-slate-200">
            <Icon size={14} className="text-orange-450 shrink-0" />
            {row.title || "Untitled"}
          </span>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{row.type}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Uploaded",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"),
    },
    {
      key: "fileUrl",
      header: "",
      align: "right",
      render: (row) =>
        row.fileUrl ? (
          <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="text-orange-450 hover:text-orange-400 text-[11px] font-bold">
            Open
          </a>
        ) : null,
    },
  ];

  return (
    <Card className="mx-auto max-w-4xl bg-[#0D1021] border border-[#1A1F35] p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Upload Documents</h1>
        <p className="mt-2 text-sm text-slate-400">Attach PDFs, presentations, documents, archives, or videos to a topic.</p>
      </div>

      <CourseModuleLessonSelect
        courseId={selection.courseId}
        moduleId={selection.moduleId}
        lessonId={selection.lessonId}
        topicId={selection.topicId}
        includeTopic
        onChange={setSelection}
      />

      {!topicId ? (
        <div className="rounded-2xl border border-dashed border-[#1A1F35] bg-[#05070E] py-16 text-center">
          <p className="text-xs font-bold text-slate-500">Select a Course, Module, Lesson, and Topic above to upload documents.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1A1F35] bg-[#05070E] p-5 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3 rounded-xl">{error}</div>
          )}

          <label className="flex items-center gap-2 w-fit px-4 py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-900 text-xs text-slate-300 hover:border-orange-500 cursor-pointer transition">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            {uploading ? "Uploading..." : "Choose files (PDF, PPT, DOCX, ZIP, Video)"}
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.mp4,.mov,.webm" />
          </label>

          <DataTable columns={columns} rows={contents} isLoading={isLoading} emptyLabel="No documents uploaded to this topic yet." />
        </div>
      )}
    </Card>
  );
}
