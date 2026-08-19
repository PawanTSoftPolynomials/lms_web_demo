"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileArchive,
  FileJson,
  Download,
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
  Sparkles,
  Copy,
  Check,
  X,
  Code,
  BookMarked,
  Bot,
  FileUp,
  ClipboardPaste,
  Pencil,
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
    case "HTML":
      return {
        icon: FileCode,
        label: t || "HTML",
        colorClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      };
    case "PRESENTATION":
      return {
        icon: Layers,
        label: "SLIDES",
        colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "QUIZ":
    case "EMBED":
      return {
        icon: HelpCircle,
        label: t || "QUIZ",
        colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "LINK":
    case "EXTERNAL_LINK":
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

/** Pre-crafted AI prompt for ChatGPT / Claude / Gemini / Copilot */
const AI_GENERATION_PROMPT = `Create a course using the Orange Tree LMS Course JSON format.

Follow this hierarchy exactly:

Course → Module → Lesson → Topic → Content

Use only fields and content types supported by the Orange Tree LMS Course JSON format.

Return only valid JSON.
Do not wrap the JSON in Markdown code fences.
Do not add explanations before or after the JSON.

Course requirements:
[Describe your course requirements here, e.g. Course Title: C Programming, 3 modules, etc.]`;

/** Sample JSON fixture for format guide */
const SAMPLE_JSON_FIXTURE = `{
  "metadata": {
    "title": "C Programming Fundamentals",
    "description": "Master C programming concepts from basic syntax to memory pointers.",
    "category": "Computer Science",
    "level": "BEGINNER",
    "language": "English",
    "tags": ["c", "programming", "coding"],
    "estimatedLearningHours": 10,
    "price": 0
  },
  "settings": {
    "visibility": "PUBLIC",
    "certificatesEnabled": true,
    "discussionEnabled": true,
    "dripContentEnabled": false
  },
  "modules": [
    {
      "title": "C Fundamentals",
      "description": "First steps in writing C programs.",
      "order": 1,
      "isPublished": true,
      "lessons": [
        {
          "title": "Introduction to C",
          "description": "Understanding compilation and basic structure.",
          "order": 1,
          "isPublished": true,
          "topics": [
            {
              "title": "What is C?",
              "description": "Overview of procedural programming.",
              "order": 1,
              "isPublished": true,
              "contents": [
                {
                  "type": "HTML",
                  "title": "Introduction to C Language",
                  "order": 1,
                  "htmlContent": "<h2>What is C?</h2><p>C is a low-level, high-efficiency compiled programming language.</p>"
                },
                {
                  "type": "VIDEO",
                  "title": "Writing Your First Hello World",
                  "order": 2,
                  "duration": 300,
                  "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}`;

export default function CourseImportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [importMode, setImportMode] = useState("NONE"); // "NONE" | "ZIP" | "JSON"
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [canonicalJson, setCanonicalJson] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Collapsible tree state tracking (Modules & Lessons expanded by default)
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});

  const resetState = () => {
    setImportMode("NONE");
    setSelectedFile(null);
    setJobId(null);
    setCanonicalJson(null);
    setValidationErrors([]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  /** Safely strips surrounding Markdown code fences (e.g. ```json ... ```) */
  const stripCodeFences = (str) => {
    if (typeof str !== "string") return str;
    let trimmed = str.trim();
    if (trimmed.startsWith("```")) {
      trimmed = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    return trimmed;
  };

  /** Normalizes parsed job into a temporary client draft and navigates directly to Course Composer without creating DB rows */
  const prepareDraftAndNavigate = (targetJob) => {
    try {
      const canonical = targetJob.canonicalJson || {};
      const metadata = canonical.metadata || {};
      const settings = canonical.settings || {};
      const modules = Array.isArray(canonical.modules) ? canonical.modules : [];
      const assetMap = canonical.assetMap || {};

      const draftPayload = {
        jobId: targetJob.id,
        isImportDraft: true,
        metadata: {
          title: metadata.title || "Imported Course",
          description: metadata.description || "",
          category: metadata.category || "General",
          level: metadata.level || "BEGINNER",
          thumbnailUrl: metadata.thumbnail ? (assetMap[metadata.thumbnail] || metadata.thumbnail) : null,
          language: metadata.language || "English",
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          estimatedLearningHours: metadata.estimatedLearningHours || null,
          status: "DRAFT",
        },
        settings: {
          visibility: settings.visibility || "PUBLIC",
          certificatesEnabled: Boolean(settings.certificatesEnabled),
          discussionEnabled: settings.discussionEnabled !== false,
          dripContentEnabled: Boolean(settings.dripContentEnabled),
        },
        modules,
        assetMap,
        canonicalJson: canonical
      };

      sessionStorage.setItem("imported_course_draft", JSON.stringify(draftPayload));
      router.push("/instructor/courses/draft");
    } catch (err) {
      console.error("Draft Preparation Error:", err);
      setErrorMsg("Failed to prepare course draft for editing.");
      setValidating(false);
    }
  };

  const handleZipProcess = async (file) => {
    setValidating(true);
    setErrorMsg("");
    setValidationErrors([]);
    setSelectedFile(file);
    setImportMode("ZIP");

    const formData = new FormData();
    formData.append("package", file);

    try {
      // 1. Create Import Job
      const jobResponse = await api.post("/course-import/jobs", formData, {
        headers: { "Content-Type": undefined },
      });

      if (!jobResponse.data?.success) {
        throw new Error(jobResponse.data?.message || "Failed to upload ZIP package.");
      }

      const createdJob = jobResponse.data.data;
      setJobId(createdJob.id);

      // 2. Process Job
      const processResponse = await api.post(`/course-import/jobs/${createdJob.id}/process`);

      if (!processResponse.data?.success) {
        throw new Error(processResponse.data?.message || "Failed to process course ZIP package.");
      }

      const processedJob = processResponse.data.data;

      if (processedJob.status === "FAILED") {
        const msg = processedJob.errorMessage || "ZIP validation failed.";
        const errors = processedJob.validationReport?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setValidating(false);
        return;
      }

      if (processedJob.canonicalJson) {
        // Prepare temporary draft in sessionStorage and navigate directly to Course Composer
        prepareDraftAndNavigate(processedJob);
      } else {
        throw new Error("No valid course JSON found in ZIP package.");
      }
    } catch (err) {
      console.error("ZIP Import processing error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to validate course ZIP package.";
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
      setValidating(false);
    }
  };

  const handleJsonFileProcess = async (file) => {
    setValidating(true);
    setErrorMsg("");
    setValidationErrors([]);
    setSelectedFile(file);
    setImportMode("JSON");

    const formData = new FormData();
    formData.append("package", file);

    try {
      const response = await api.post("/course-import/json", formData, {
        headers: { "Content-Type": undefined },
      });

      if (!response.data?.success) {
        const msg = response.data?.message || "Course JSON validation failed.";
        const errors = response.data?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setValidating(false);
        return;
      }

      const createdJob = response.data.data;
      setJobId(createdJob.id);

      if (createdJob.status === "FAILED") {
        const msg = createdJob.errorMessage || "Course JSON validation failed.";
        const errors = createdJob.validationReport?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setValidating(false);
        return;
      }

      if (createdJob.canonicalJson) {
        // Prepare temporary draft in sessionStorage and navigate directly to Course Composer
        prepareDraftAndNavigate(createdJob);
      } else {
        throw new Error("Invalid response: No canonical JSON returned.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Course JSON validation failed.";
      const errors = err?.response?.data?.errors || [msg];
      console.warn("JSON File validation report:", { message: msg, errors });
      setErrorMsg(msg);
      setValidationErrors(errors);
      setValidating(false);
    }
  };

  const handleJsonTextProcess = async () => {
    if (!jsonText || !jsonText.trim()) {
      setErrorMsg("Please paste or enter course JSON content first.");
      return;
    }

    setValidating(true);
    setErrorMsg("");
    setValidationErrors([]);
    setImportMode("JSON");

    // Code fence normalization
    const cleanedText = stripCodeFences(jsonText);

    // Client-side natural language detection
    if (!cleanedText.startsWith("{") && !cleanedText.startsWith("[")) {
      setValidating(false);
      setErrorMsg("This doesn't appear to be JSON.");
      setValidationErrors([
        "This input appears to be plain natural language text.",
        "To generate valid course JSON, ask ChatGPT, Claude, Gemini, or another AI assistant using the Orange Tree LMS Course JSON format."
      ]);
      return;
    }

    try {
      const response = await api.post("/course-import/json", {
        canonicalJson: cleanedText,
        sourceFileName: "pasted_course.json"
      });

      if (!response.data?.success) {
        const msg = response.data?.message || "Course JSON validation failed.";
        const errors = response.data?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setValidating(false);
        return;
      }

      const createdJob = response.data.data;
      setJobId(createdJob.id);

      if (createdJob.status === "FAILED") {
        const msg = createdJob.errorMessage || "Course JSON validation failed.";
        const errors = createdJob.validationReport?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setValidating(false);
        return;
      }

      setShowPasteModal(false); // Close paste modal

      if (createdJob.canonicalJson) {
        // Prepare temporary draft in sessionStorage and navigate directly to Course Composer
        prepareDraftAndNavigate(createdJob);
      } else {
        throw new Error("Invalid response: No canonical JSON returned.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Course JSON validation failed.";
      const errors = err?.response?.data?.errors || [msg];
      console.warn("Pasted JSON validation report:", { message: msg, errors });
      setErrorMsg(msg);
      setValidationErrors(errors);
      setValidating(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith(".zip")) {
        handleZipProcess(file);
      } else if (file.name.endsWith(".json")) {
        handleJsonFileProcess(file);
      } else {
        setErrorMsg("Unsupported file format. Please upload a .zip package or a .json course structure file.");
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/course-import/template");
      const templateData = response.data?.data;
      const jsonStr = JSON.stringify(templateData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "course-v2-template.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download template:", err);
      setErrorMsg("Failed to download JSON template.");
    }
  };

  const handleCopyAiPrompt = () => {
    navigator.clipboard.writeText(AI_GENERATION_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopySampleJson = () => {
    navigator.clipboard.writeText(SAMPLE_JSON_FIXTURE);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
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
      if (!jobId) setErrorMsg("No active import job found. Please re-select your package.");
      return;
    }

    setImporting(true);
    setErrorMsg("");
    setSuccessMsg("Ingesting course into database... Please wait.");

    try {
      let importResult = null;
      try {
        const response = await api.post(`/course-import/jobs/${jobId}/import`);
        importResult = response.data?.data;
      } catch (postErr) {
        console.warn("Import POST request timed out or errored, polling status:", postErr.message);
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
              Import Course
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Choose how you want to import your course into Orange Tree LMS.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Messages */}
        {errorMsg && (
          <div className="p-5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 font-semibold text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={handleCopyAiPrompt}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-md"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? "Prompt Copied!" : "Copy AI Prompt"}</span>
              </button>
            </div>

            {validationErrors.some((err) => err.includes("settings")) && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-800/60 space-y-1 font-sans text-rose-200">
                <p className="font-bold text-amber-400 text-xs">Missing required section: <code className="font-mono text-amber-300">settings</code></p>
                <p className="text-xs text-slate-300">
                  Your JSON is missing the required Course JSON <code className="font-mono text-amber-400">"settings"</code> object. Click <strong>Copy AI Prompt</strong> above to prompt your AI assistant to generate a compliant JSON structure.
                </p>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="pl-8 text-xs text-rose-300/90 space-y-1.5 font-mono">
                <p className="font-sans font-medium text-slate-300">Issues found:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="break-words">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: INITIAL IMPORT METHOD SELECTION CARDS */}
        {!canonicalJson && !validating && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Card 1: Import from ZIP */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="p-8 rounded-3xl bg-slate-900/80 border-2 border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileArchive className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Import from ZIP</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Import a complete course package with local media files.
                    </p>
                  </div>

                  {/* Supporting Information Badges */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 flex-wrap gap-y-2 pt-1">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400/90 font-medium">
                      Includes course content
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400/90 font-medium">
                      All media files included
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 text-center cursor-pointer transition block">
                    <span>Select ZIP Package</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleZipProcess(file);
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 text-center font-mono">.zip file up to 2GB</p>
                </div>
              </div>

              {/* Card 2: Import from JSON */}
              <div className="p-8 rounded-3xl bg-slate-900/80 border-2 border-slate-800 hover:border-sky-500/50 transition flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <FileJson className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Import from JSON</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Import course structure using Orange Tree LMS JSON format.
                    </p>
                  </div>

                  {/* Compact Hierarchy Banner */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-medium text-slate-400 block">Course structure</span>
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-sky-400 flex-wrap gap-y-1">
                      <span>Course</span>
                      <span className="text-slate-600">→</span>
                      <span>Module</span>
                      <span className="text-slate-600">→</span>
                      <span>Lesson</span>
                      <span className="text-slate-600">→</span>
                      <span>Topic</span>
                      <span className="text-slate-600">→</span>
                      <span>Content</span>
                    </div>
                  </div>

                  {/* Primary Import Actions (Direct compact controls, no nested container wrappers) */}
                  <div className="space-y-3 pt-1">
                    <label className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 text-center cursor-pointer transition flex items-center justify-center space-x-2">
                      <FileUp className="w-4 h-4 text-slate-950" />
                      <span>Select JSON File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleJsonFileProcess(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Compact Divider */}
                    <div className="relative flex items-center justify-center py-0.5">
                      <div className="border-t border-slate-800/90 w-full" />
                      <span className="bg-slate-900 px-3 text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">OR</span>
                      <div className="border-t border-slate-800/90 w-full" />
                    </div>

                    <button
                      onClick={() => setShowPasteModal(true)}
                      type="button"
                      className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-2"
                    >
                      <ClipboardPaste className="w-4 h-4 text-sky-400" />
                      <span>Paste JSON</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Help Actions Footer */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Need help creating JSON?</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowGuideModal(true)}
                      type="button"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition flex items-center justify-center space-x-1.5"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Format Guide</span>
                    </button>

                    <button
                      onClick={handleDownloadTemplate}
                      type="button"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Dropzone Footer */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="p-5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800/80 text-center text-slate-400 text-xs flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Or drag & drop any <strong className="text-slate-200">.zip</strong> or <strong className="text-slate-200">.json</strong> file directly onto this page.</span>
            </div>
          </div>
        )}

        {/* Validation Loading Progress */}
        {validating && (
          <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
            <RefreshCw className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
            <div>
              <p className="text-base text-slate-100 font-bold">Preparing course...</p>
              <p className="text-xs text-slate-400 mt-1">Validating course structure and opening Course Composer.</p>
            </div>
          </div>
        )}
      </div>

      {/* PASTE JSON EDITOR MODAL */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <ClipboardPaste className="w-5 h-5 text-sky-400" />
                  <span>Paste Course JSON</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Paste your Orange Tree LMS Course JSON structure below.
                </p>
              </div>

              <button
                onClick={() => setShowPasteModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-semibold text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    <button
                      onClick={handleCopyAiPrompt}
                      type="button"
                      className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1 shrink-0 ml-2 shadow-md"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? "Prompt Copied!" : "Copy AI Prompt"}</span>
                    </button>
                  </div>

                  {validationErrors.some((err) => err.includes("settings")) && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-800/60 space-y-1 font-sans text-rose-200">
                      <p className="font-bold text-amber-400 text-xs">Missing required section: <code className="font-mono text-amber-300">settings</code></p>
                      <p className="text-[11px] text-slate-300">
                        Your JSON is missing the required Course JSON v2 <code className="font-mono text-amber-400">"settings"</code> object. Click <strong>Copy AI Prompt</strong> above to prompt your AI assistant to generate a compliant JSON structure.
                      </p>
                    </div>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="pl-6 text-[11px] text-rose-300/90 space-y-1 font-mono">
                      <p className="font-sans font-medium text-slate-300">Issues found:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {validationErrors.map((err, idx) => (
                          <li key={idx} className="break-words">
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    if (errorMsg) {
                      setErrorMsg("");
                      setValidationErrors([]);
                    }
                  }}
                  placeholder={`{\n  "version": "2.0",\n  "metadata": {\n    "title": "My Course"\n  },\n  "modules": []\n}`}
                  rows={12}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sky-300 font-mono text-xs placeholder-slate-600 outline-none focus:border-sky-500/60 transition resize-y scrollbar-thin leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowPasteModal(false)}
                type="button"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleJsonTextProcess}
                type="button"
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Validate & Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMAT GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <BookMarked className="w-5 h-5 text-amber-400" />
                  <span>Orange Tree LMS Course JSON — Format Guide</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Structure and hierarchy documentation for creating course JSON files.
                </p>
              </div>

              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300 leading-relaxed scrollbar-thin">
              {/* Section 1: Hierarchy Tree */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-400">Course Hierarchy</h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-amber-300 space-y-1">
                  <p>Course</p>
                  <p>└── Module</p>
                  <p>    └── Lesson</p>
                  <p>        └── Topic</p>
                  <p>            └── Content</p>
                </div>
              </div>

              {/* Section 2: Hierarchy Level Explanations */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-100">Hierarchy Level Explanations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-sans">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 block">Course</span>
                    <p className="text-[11px] text-slate-400">Course-level information (title, description, level, category).</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-sky-400 block">Module</span>
                    <p className="text-[11px] text-slate-400">Groups related lessons within a major section.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 block">Lesson</span>
                    <p className="text-[11px] text-slate-400">Groups related topics within a module.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block">Topic</span>
                    <p className="text-[11px] text-slate-400">Represents a specific learning concept.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-400 block">Content</span>
                    <p className="text-[11px] text-slate-400">Actual learning material (HTML, Video, PDF, Presentation, etc.).</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Verified Example JSON */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400 font-sans">Example Course JSON</h4>
                  <button
                    onClick={handleCopySampleJson}
                    className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition flex items-center space-x-1"
                  >
                    {copiedSample ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSample ? "Copied Sample!" : "Copy Sample JSON"}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={SAMPLE_JSON_FIXTURE}
                  rows={10}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] outline-none resize-none scrollbar-thin"
                />
              </div>

              {/* Section 4: AI-generated JSON Section */}
              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold text-purple-300">Using AI to create your course JSON?</h4>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You can use ChatGPT, Claude, Gemini, or another AI assistant to generate your course JSON. Ask it to follow the Orange Tree LMS Course JSON format, then paste or upload the result here.
                </p>

                <button
                  onClick={handleCopyAiPrompt}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-bold transition flex items-center space-x-2 shadow-lg"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Prompt Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Copy AI Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={handleDownloadTemplate}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Template</span>
              </button>

              <button
                onClick={() => setShowGuideModal(false)}
                type="button"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
