"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Folder,
  FileText,
  RefreshCw,
  ListTree,
  File,
  Globe,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  BookOpen,
  PlayCircle,
  Headphones,
  FileCode,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Info,
} from "lucide-react";
import api from "@/lib/axios";
import { QUERY_KEYS } from "@/constants/queryKeys";

/** Helper to return content type specific icon & styling */
function getContentBadge(type) {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "VIDEO":
      return {
        icon: PlayCircle,
        label: "VIDEO",
        colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    case "AUDIO":
      return {
        icon: Headphones,
        label: "AUDIO",
        colorClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      };
    case "PDF":
      return {
        icon: FileText,
        label: "PDF",
        colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "TEXT":
    case "DOCUMENT":
      return {
        icon: FileCode,
        label: t || "TEXT",
        colorClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      };
    case "QUIZ":
      return {
        icon: HelpCircle,
        label: "QUIZ",
        colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "LINK":
    case "URL":
      return {
        icon: ExternalLink,
        label: "LINK",
        colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      };
    default:
      return {
        icon: File,
        label: t || "FILE",
        colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
  }
}

export default function CourseImportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [canonicalJson, setCanonicalJson] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Collapsible state tracking
  // Default: Modules & Lessons expanded, Topics collapsed
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".zip")) {
        setErrorMsg("Please select a valid .zip file.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      setCanonicalJson(null);
      setJobId(null);
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
      setCanonicalJson(null);
      setJobId(null);
      handleValidateZip(file);
    }
  };

  const handleValidateZip = async (file) => {
    setValidating(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("package", file);

    try {
      // 1. Create Import Job (Content-Type: undefined allows Axios to auto-generate boundary)
      const jobResponse = await api.post("/course-import/jobs", formData, {
        headers: { "Content-Type": undefined },
      });

      if (!jobResponse.data?.success) {
        throw new Error(jobResponse.data?.message || "Failed to create import job.");
      }

      const createdJob = jobResponse.data.data;
      setJobId(createdJob.id);

      // 2. Process Job (V2 Manifest Analysis & Asset Extraction)
      const processResponse = await api.post(`/course-import/jobs/${createdJob.id}/process`);

      if (!processResponse.data?.success) {
        throw new Error(processResponse.data?.message || "Failed to process course ZIP package.");
      }

      const processedJob = processResponse.data.data;

      if (processedJob.canonicalJson) {
        setCanonicalJson(processedJob.canonicalJson);
        initializeDefaultExpandedState(processedJob.canonicalJson);
      } else {
        throw new Error("No valid canonical course JSON found in package.");
      }
    } catch (err) {
      console.error("V2 Import processing error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to validate V2 course ZIP package.";
      setErrorMsg(msg);
    } finally {
      setValidating(false);
    }
  };

  const initializeDefaultExpandedState = (json) => {
    const modules = json?.modules || [];
    const modState = {};
    const lesState = {};
    const topState = {};

    modules.forEach((mod, mIdx) => {
      modState[mIdx] = true; // Modules expanded by default
      const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      lessons.forEach((les, lIdx) => {
        lesState[`${mIdx}-${lIdx}`] = true; // Lessons expanded by default
        const topics = Array.isArray(les.topics) ? les.topics : [];
        topics.forEach((top, tIdx) => {
          topState[`${mIdx}-${lIdx}-${tIdx}`] = false; // Topics collapsed by default
        });
      });
    });

    setExpandedModules(modState);
    setExpandedLessons(lesState);
    setExpandedTopics(topState);
  };

  const pollImportJob = async (targetJobId) => {
    const maxPolls = 60; // 2 minutes max
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const res = await api.get(`/course-import/jobs/${targetJobId}`);
        const currentJob = res.data?.data;
        if (currentJob?.status === "COMPLETED") {
          queryClient.invalidateQueries([QUERY_KEYS.INSTRUCTOR_COURSES]);
          queryClient.invalidateQueries([QUERY_KEYS.INSTRUCTOR_COURSES_TABLE]);
          setSuccessMsg("Course package imported successfully! Redirecting...");
          setTimeout(() => {
            if (currentJob.courseId) {
              router.push(`/instructor/courses/${currentJob.courseId}`);
            } else {
              router.push("/instructor/courses");
            }
          }, 1500);
          return;
        }
        if (currentJob?.status === "FAILED") {
          throw new Error(currentJob.errorMessage || "Course import failed.");
        }
      } catch (pollErr) {
        if (pollErr.message && !pollErr.message.includes("status")) {
          throw pollErr;
        }
      }
    }
    throw new Error("Import is taking longer than expected. Please check your courses list.");
  };

  const handleProcessImport = async () => {
    if (!jobId || importing) {
      if (!jobId) setErrorMsg("No active import job found. Please re-upload your package.");
      return;
    }

    setImporting(true);
    setErrorMsg("");
    setSuccessMsg("Importing course package... Please wait.");

    try {
      // 3. Trigger Ingest Course into Database
      let importResult = null;
      try {
        const response = await api.post(`/course-import/jobs/${jobId}/import`);
        importResult = response.data?.data;
      } catch (postErr) {
        // If HTTP request timed out, backend may still be executing or already completed.
        console.warn("Import POST request timed out or errored, falling back to job polling:", postErr.message);
      }

      if (importResult?.status === "COMPLETED") {
        queryClient.invalidateQueries([QUERY_KEYS.INSTRUCTOR_COURSES]);
        queryClient.invalidateQueries([QUERY_KEYS.INSTRUCTOR_COURSES_TABLE]);
        setSuccessMsg("Course package imported successfully! Redirecting...");
        setTimeout(() => {
          if (importResult.courseId) {
            router.push(`/instructor/courses/${importResult.courseId}`);
          } else {
            router.push("/instructor/courses");
          }
        }, 1500);
        return;
      }

      // Poll job status until COMPLETED or FAILED
      await pollImportJob(jobId);
    } catch (err) {
      console.error("Course Ingestion error:", err);
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to import course into database.");
      setImporting(false);
    }
  };

  // Extract V2 contract fields
  const metadata = canonicalJson?.metadata || {};
  const settings = canonicalJson?.settings || {};
  const modules = canonicalJson?.modules || [];
  const version = canonicalJson?.version || "2.0";
  const assetMap = canonicalJson?.assetMap || {};
  const assetCount = Object.keys(assetMap).length;

  // Dynamic Structure Counts
  const counts = useMemo(() => {
    let lCount = 0;
    let tCount = 0;
    let cCount = 0;
    modules.forEach((mod) => {
      const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      lCount += lessons.length;
      lessons.forEach((les) => {
        const topics = Array.isArray(les.topics) ? les.topics : [];
        tCount += topics.length;
        topics.forEach((top) => {
          const contents = Array.isArray(top.contents) ? top.contents : [];
          cCount += contents.length;
        });
      });
    });
    return {
      modules: modules.length,
      lessons: lCount,
      topics: tCount,
      contents: cCount,
    };
  }, [modules]);

  // Global Expand / Collapse All
  const toggleAll = (expand) => {
    const modState = {};
    const lesState = {};
    const topState = {};
    modules.forEach((mod, mIdx) => {
      modState[mIdx] = expand;
      const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
      lessons.forEach((les, lIdx) => {
        lesState[`${mIdx}-${lIdx}`] = expand;
        const topics = Array.isArray(les.topics) ? les.topics : [];
        topics.forEach((top, tIdx) => {
          topState[`${mIdx}-${lIdx}-${tIdx}`] = expand;
        });
      });
    });
    setExpandedModules(modState);
    setExpandedLessons(lesState);
    setExpandedTopics(topState);
  };

  const toggleModule = (mIdx) => {
    setExpandedModules((prev) => ({ ...prev, [mIdx]: !prev[mIdx] }));
  };

  const toggleLesson = (key) => {
    setExpandedLessons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTopic = (key) => {
    setExpandedTopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-10 font-sans pb-32">
      {/* Navigation Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Back to courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Import Course Package (V2 ZIP)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review course metadata and structural hierarchy before confirming package ingestion.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Messages */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="break-words">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Upload Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-8 md:p-10 rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-amber-500/50 transition text-center flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <FileArchive className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-200">
              {selectedFile ? selectedFile.name : "Drag & Drop Course ZIP Package"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a .zip package containing Canonical JSON v2 manifest (<code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">course.json</code>) and local media assets.
            </p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 cursor-pointer transition">
            <span>{selectedFile ? "Choose Different Package" : "Browse Computer"}</span>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Validation Loading Progress */}
        {validating && (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm text-slate-200 font-semibold">Validating Package & Extracting Local Assets...</p>
            <p className="text-xs text-slate-400">Verifying course.json manifest contract and scanning package paths.</p>
          </div>
        )}

        {/* Package Preview Main View */}
        {canonicalJson && (
          <div className="space-y-6">
            {/* 1. Header & Course Overview Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div className="space-y-2 max-w-3xl">
                  {/* Validation Badge Bar */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Package Validated</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold">
                      v{version} Schema
                    </span>

                    {assetCount > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-semibold">
                        {assetCount} Physical Local Assets
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-100 break-words">
                    {metadata.title || "Untitled Course Package"}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed break-words">
                    {metadata.description || "No description provided for this course package."}
                  </p>
                </div>
              </div>

              {/* Course Overview Metadata Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Category</span>
                  <p className="text-xs font-bold text-slate-200 mt-1 truncate">{metadata.category || "General"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Level</span>
                  <p className="text-xs font-bold text-amber-400 mt-1 truncate">{metadata.level || "BEGINNER"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Language</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1 truncate">{metadata.language || "English"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block flex items-center justify-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Est. Hours</span>
                  </span>
                  <p className="text-xs font-bold text-sky-400 mt-1 truncate">
                    {metadata.estimatedLearningHours ? `${metadata.estimatedLearningHours} hrs` : "N/A"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Certificates</span>
                  <p className="text-xs font-bold text-indigo-400 mt-1 truncate">
                    {settings.certificatesEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Discussions</span>
                  <p className="text-xs font-bold text-purple-400 mt-1 truncate">
                    {settings.discussionEnabled !== false ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Dynamic Structure Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400">Modules</span>
                  <p className="text-2xl font-bold text-slate-100">{counts.modules}</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400">Lessons</span>
                  <p className="text-2xl font-bold text-slate-100">{counts.lessons}</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <ListTree className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400">Topics</span>
                  <p className="text-2xl font-bold text-slate-100">{counts.topics}</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400">Contents</span>
                  <p className="text-2xl font-bold text-slate-100">{counts.contents}</p>
                </div>
              </div>
            </div>

            {/* 3. Package Tree Hierarchy */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Package Structure Tree</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hierarchy: Course → Module → Lesson → Topic → Content
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAll(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                    aria-label="Expand all nodes"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand All</span>
                  </button>
                  <button
                    onClick={() => toggleAll(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1"
                    aria-label="Collapse all nodes"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>

              {/* Hierarchy Tree Rendering */}
              {modules.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-sm">
                  <Info className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                  <span>No modules found in this course package.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, mIdx) => {
                    const isModExpanded = !!expandedModules[mIdx];
                    const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];

                    return (
                      <div
                        key={mIdx}
                        className="rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden transition"
                      >
                        {/* Module Header Toggle */}
                        <button
                          onClick={() => toggleModule(mIdx)}
                          className="w-full p-4 bg-slate-900/90 hover:bg-slate-900 flex items-center justify-between text-left transition border-b border-slate-800/50"
                          aria-expanded={isModExpanded}
                          aria-label={`Toggle Module ${mIdx + 1}: ${mod.title}`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                              {isModExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-sm font-bold text-slate-100 truncate">
                              Module {mIdx + 1}: {mod.title || "Untitled Module"}
                            </span>
                          </div>

                          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 font-semibold shrink-0 ml-3">
                            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                        </button>

                        {/* Module Lessons Body */}
                        {isModExpanded && (
                          <div className="p-4 space-y-3">
                            {lessons.length === 0 ? (
                              <p className="text-xs text-slate-500 italic pl-6">
                                No lessons found in this module.
                              </p>
                            ) : (
                              lessons.map((les, lIdx) => {
                                const lesKey = `${mIdx}-${lIdx}`;
                                const isLesExpanded = !!expandedLessons[lesKey];
                                const topics = Array.isArray(les.topics) ? les.topics : [];

                                return (
                                  <div
                                    key={lIdx}
                                    className="rounded-xl bg-slate-900/60 border border-slate-800/70 overflow-hidden transition"
                                  >
                                    {/* Lesson Header Toggle */}
                                    <button
                                      onClick={() => toggleLesson(lesKey)}
                                      className="w-full p-3.5 bg-slate-900/40 hover:bg-slate-900/80 flex items-center justify-between text-left transition"
                                      aria-expanded={isLesExpanded}
                                      aria-label={`Toggle Lesson ${lIdx + 1}: ${les.title}`}
                                    >
                                      <div className="flex items-center space-x-3 truncate">
                                        <span className="p-1 rounded bg-slate-800 text-sky-400 shrink-0">
                                          {isLesExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          ) : (
                                            <ChevronRight className="w-3.5 h-3.5" />
                                          )}
                                        </span>
                                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                                        <span className="text-xs font-semibold text-slate-200 truncate">
                                          Lesson {lIdx + 1}: {les.title || "Untitled Lesson"}
                                        </span>
                                      </div>

                                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-sky-400 font-medium shrink-0 ml-3">
                                        {topics.length} {topics.length === 1 ? "topic" : "topics"}
                                      </span>
                                    </button>

                                    {/* Lesson Topics Body */}
                                    {isLesExpanded && (
                                      <div className="p-3 border-t border-slate-800/60 space-y-2.5 bg-slate-950/40">
                                        {topics.length === 0 ? (
                                          <p className="text-xs text-slate-500 italic pl-6">
                                            No topics found in this lesson.
                                          </p>
                                        ) : (
                                          topics.map((top, tIdx) => {
                                            const topKey = `${mIdx}-${lIdx}-${tIdx}`;
                                            const isTopExpanded = !!expandedTopics[topKey];
                                            const contents = Array.isArray(top.contents) ? top.contents : [];

                                            return (
                                              <div
                                                key={tIdx}
                                                className="rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-hidden"
                                              >
                                                {/* Topic Header Toggle */}
                                                <button
                                                  onClick={() => toggleTopic(topKey)}
                                                  className="w-full p-3 bg-slate-900/50 hover:bg-slate-900/90 flex items-center justify-between text-left transition"
                                                  aria-expanded={isTopExpanded}
                                                  aria-label={`Toggle Topic: ${top.title}`}
                                                >
                                                  <div className="flex items-center space-x-2.5 truncate">
                                                    <span className="p-1 rounded bg-slate-900 text-emerald-400 shrink-0">
                                                      {isTopExpanded ? (
                                                        <ChevronDown className="w-3 h-3" />
                                                      ) : (
                                                        <ChevronRight className="w-3 h-3" />
                                                      )}
                                                    </span>
                                                    <ListTree className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    <span className="text-xs font-medium text-slate-300 truncate">
                                                      Topic {tIdx + 1}: {top.title || "Untitled Topic"}
                                                    </span>
                                                  </div>

                                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 shrink-0 ml-3">
                                                    {contents.length} {contents.length === 1 ? "content" : "contents"}
                                                  </span>
                                                </button>

                                                {/* Topic Contents List */}
                                                {isTopExpanded && (
                                                  <div className="p-3 border-t border-slate-800/60 space-y-1.5 bg-slate-950/90">
                                                    {contents.length === 0 ? (
                                                      <p className="text-[11px] text-slate-500 italic pl-4">
                                                        No content items found in this topic.
                                                      </p>
                                                    ) : (
                                                      contents.map((cnt, cIdx) => {
                                                        const badge = getContentBadge(cnt.type);
                                                        const BadgeIcon = badge.icon;

                                                        return (
                                                          <div
                                                            key={cIdx}
                                                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 hover:border-slate-700 transition"
                                                          >
                                                            <div className="flex items-center space-x-2.5 truncate pr-3">
                                                              <BadgeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                              <span className="text-slate-300 font-medium truncate">
                                                                {cnt.title || `Content Item ${cIdx + 1}`}
                                                              </span>
                                                              {cnt.mediaFile && (
                                                                <span className="text-[10px] font-mono text-slate-500 truncate hidden sm:inline">
                                                                  ({cnt.mediaFile})
                                                                </span>
                                                              )}
                                                            </div>

                                                            <span
                                                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${badge.colorClass}`}
                                                            >
                                                              {badge.label}
                                                            </span>
                                                          </div>
                                                        );
                                                      })
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Sticky Floating Action Bar */}
      {canonicalJson && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-200 truncate max-w-md">
                  {metadata.title || "Course Package Ready"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {counts.modules} modules • {counts.lessons} lessons • {counts.topics} topics • {counts.contents} contents
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setCanonicalJson(null);
                  setJobId(null);
                  setSelectedFile(null);
                  setErrorMsg("");
                }}
                disabled={importing}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition disabled:opacity-50"
              >
                Re-upload Package
              </button>

              <button
                onClick={handleProcessImport}
                disabled={importing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center space-x-2 shrink-0"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Course...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Create Course</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
