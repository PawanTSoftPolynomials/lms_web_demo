"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Folder,
  FileText,
  Video,
  File,
  RefreshCw,
  Info,
} from "lucide-react";
import api from "@/lib/axios";

export default function CourseImportPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".zip")) {
        setErrorMsg("Please select a valid .zip file.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      setValidationData(null);
      handleValidateZip(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith(".zip")) {
        setErrorMsg("Please select a valid .zip file.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      setValidationData(null);
      handleValidateZip(file);
    }
  };

  const handleValidateZip = async (file) => {
    setValidating(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("package", file);

    try {
      const response = await api.post("/courses/import/validate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.data.isValid) {
        setValidationData(response.data.data);
      } else {
        const errors = response.data?.data?.errors || [];
        const errText = errors.map((e) => `${e.file}: ${e.error}`).join(" | ");
        setErrorMsg(errText || "Zip validation failed. Please check package structure.");
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to validate course ZIP.");
    } finally {
      setValidating(false);
    }
  };

  const handleProcessImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("package", selectedFile);

    try {
      const response = await api.post("/courses/import/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccessMsg("Course package imported successfully! Redirecting...");
        setTimeout(() => {
          router.push("/instructor/courses");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to import course package.");
      setImporting(false);
    }
  };

  const manifest = validationData?.manifest;
  const modules = manifest?.modules || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Navigation Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Import Course Package (ZIP)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload a zip package containing <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono">course.json</code>, modules, lessons, and media.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Messages */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-10 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition text-center flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileArchive className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-200">
              {selectedFile ? selectedFile.name : "Drag & Drop Course ZIP Package"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports .zip archives containing manifest and course content files.
            </p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 cursor-pointer transition">
            <span>Browse Computer</span>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Validation Progress */}
        {validating && (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">Validating ZIP Package Structure...</p>
          </div>
        )}

        {/* Package Preview Card */}
        {validationData && manifest && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                  PACKAGE VALIDATED
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{manifest.title}</h3>
                <p className="text-xs text-slate-400">{manifest.description || "No description provided."}</p>
              </div>

              <button
                onClick={handleProcessImport}
                disabled={importing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center space-x-2"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing Package...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Create Course</span>
                  </>
                )}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Category</span>
                <p className="text-sm font-bold text-slate-200 mt-0.5">{manifest.category}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Level</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{manifest.level}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Modules</span>
                <p className="text-sm font-bold text-sky-400 mt-0.5">{modules.length}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Price</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">${manifest.price || 0}</p>
              </div>
            </div>

            {/* Modules & Lessons Tree */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Package Tree Preview</h4>
              <div className="space-y-3">
                {modules.map((mod, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Module {mIdx + 1}: {mod.title}
                      </span>
                    </div>

                    {mod.lessons && mod.lessons.length > 0 && (
                      <div className="pl-6 space-y-1.5 pt-1">
                        {mod.lessons.map((les, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-3.5 h-3.5 text-sky-400" />
                              <span className="text-slate-300 font-medium">{les.title}</span>
                            </div>
                            {les.file && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                                {les.file}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
