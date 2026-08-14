"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  useUploadCoursePackage,
  useProcessCourseImportJob,
  useUpdateCourseImportJob,
  useImportCourseImportJob,
} from "@/hooks/queries/instructor/useCourseImport";
import ValidationReportCard from "@/components/instructor/course-import/ValidationReportCard";
import UnmappedReviewPanel from "@/components/instructor/course-import/UnmappedReviewPanel";
import PreviewTree from "@/components/instructor/course-import/PreviewTree";

const STAGE_LABELS = {
  UPLOADED: "Package uploaded…",
  EXTRACTING: "Scanning files & folder structure…",
  ANALYZING: "Extracting content & analyzing structure…",
  READY: "Ready for review",
};

export default function CourseImportPage() {
  const router = useRouter();

  // step: "upload" | "processing" | "preview" | "importing"
  const [step, setStep] = useState("upload");
  const [job, setJob] = useState(null);
  const [course, setCourse] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const uploadMutation = useUploadCoursePackage();
  const processMutation = useProcessCourseImportJob();
  const updateMutation = useUpdateCourseImportJob();
  const importMutation = useImportCourseImportJob();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      setErrorMsg("Please select a valid .zip course package.");
      return;
    }

    setErrorMsg("");
    setStep("processing");

    try {
      const uploadedJob = await uploadMutation.mutateAsync(file);
      setJob(uploadedJob);

      const processedJob = await processMutation.mutateAsync(uploadedJob.id);
      setJob(processedJob);

      if (processedJob.status !== "READY") {
        setErrorMsg(processedJob.errorMessage || "Could not process this course package.");
        setStep("upload");
        return;
      }

      setCourse(processedJob.canonicalJson.course);
      setValidationReport(processedJob.validationReport);
      setStep("preview");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to process course package.");
      setStep("upload");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    if (!job || !course) return;
    setErrorMsg("");

    try {
      const saved = await updateMutation.mutateAsync({ jobId: job.id, canonicalJson: { course } });
      setValidationReport(saved.validationReport);

      if (saved.validationReport?.errors?.length) {
        return; // surfaced via ValidationReportCard; instructor must fix before importing
      }

      setStep("importing");
      const imported = await importMutation.mutateAsync(job.id);

      if (imported.status === "COMPLETED" && imported.courseId) {
        router.push(`/instructor/courses/${imported.courseId}/composer`);
        return;
      }

      setErrorMsg(imported.errorMessage || "Import failed.");
      setStep("preview");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to import course.");
      setStep("preview");
    }
  };

  const importing = step === "importing" || importMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" /> AI Course Importer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload an existing course package — we&apos;ll extract, classify, and map it into a course you can review and edit here before it&apos;s created.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === "upload" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-10 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition text-center flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileArchive className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Drag &amp; Drop a Course ZIP Package</h3>
              <p className="text-xs text-slate-400 mt-1">
                HTML, Markdown, PDF, DOCX, PPTX, images, video, audio, quiz files, and SCORM packages are all supported.
              </p>
            </div>
            <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 cursor-pointer transition">
              <span>Browse Computer</span>
              <input type="file" accept=".zip" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
            </label>
          </div>
        )}

        {step === "processing" && (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">
              {STAGE_LABELS[job?.status] || "Processing your course package…"}
            </p>
          </div>
        )}

        {(step === "preview" || step === "importing") && course && (
          <>
            <ValidationReportCard report={validationReport} />
            <UnmappedReviewPanel unmapped={validationReport?.unmapped} brokenReferences={validationReport?.brokenReferences} />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center space-x-2"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import Course</span>
                  </>
                )}
              </button>
            </div>

            <PreviewTree course={course} onChange={setCourse} />
          </>
        )}
      </div>
    </div>
  );
}
