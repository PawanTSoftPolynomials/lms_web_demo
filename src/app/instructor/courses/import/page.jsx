"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Bot,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Wand2,
  BookOpen,
  Layers,
  FileArchive,
  FileCode,
  Upload,
  Clipboard,
  Download,
  HelpCircle,
  X,
  FileJson,
} from "lucide-react";
import AiComposerModal from "@/components/instructor/composer/AiComposerModal";
import {
  useUploadZipPackage,
  useProcessZipJob,
  useProcessJsonCourse,
  useCourseJsonTemplate,
} from "@/hooks/queries/instructor/useCourseImport";
import { useGenerateAiContent } from "@/hooks/queries/instructor/useGenerateAiContent";

/** Example prompts covering diverse disciplines */
const EXAMPLE_PROMPTS = [
  {
    label: "Beginner Python",
    text: "Create a beginner Python programming course for college students. Cover variables, control flow, functions, OOP, and data structures with practical code examples and quizzes.",
  },
  {
    label: "Java Spring Boot",
    text: "Create a comprehensive Java Full Stack backend course for intermediate developers covering Spring Boot, REST APIs, Microservices, Security, and PostgreSQL database integration.",
  },
  {
    label: "High School Physics",
    text: "Create a 6-week introductory Physics course for high school students covering Newtonian mechanics, gravity, motion, energy, and momentum with interactive concept checks.",
  },
  {
    label: "Corporate Cybersecurity",
    text: "Create employee training for cybersecurity awareness. Cover phishing prevention, password security, social engineering, remote work safety, and practical assessments.",
  },
  {
    label: "Digital Marketing",
    text: "Create a digital marketing course covering SEO fundamentals, content strategy, social media advertising, email marketing, and Google Analytics.",
  },
];

/** Generation Pipeline Staged Steps for User Feedback */
const STAGED_STEPS = [
  { id: 1, label: "Understanding your requirements", desc: "Parsing topic, level, and goals" },
  { id: 2, label: "Designing course structure", desc: "Organizing modules, lessons, and topics" },
  { id: 3, label: "Generating learning content", desc: "Drafting lesson explanations and examples" },
  { id: 4, label: "Creating assessments", desc: "Building module quizzes and question sets" },
];

/** Fallback Orange Tree LMS Course JSON Template */
const FALLBACK_TEMPLATE = {
  metadata: {
    title: "C Programming Fundamentals",
    description: "Master C programming concepts from basic syntax to memory pointers.",
    category: "Computer Science",
    level: "BEGINNER",
    language: "English",
    tags: ["c", "programming", "coding"],
    estimatedLearningHours: 10,
    price: 0,
  },
  settings: {
    visibility: "PUBLIC",
    certificatesEnabled: true,
    discussionEnabled: true,
    dripContentEnabled: false,
  },
  quizzes: [
    {
      title: "C Programming Final Assessment",
      description: "Comprehensive course-level assessment covering C fundamentals.",
      passingScore: 60,
      timeLimit: 30,
      isPublished: true,
      questions: [
        {
          question: "Which header file is required for printf()?",
          questionType: "MCQ_SINGLE",
          options: ["<stdio.h>", "<stdlib.h>", "<string.h>", "<math.h>"],
          correctAnswer: "<stdio.h>",
          explanation: "printf() is declared in stdio.h.",
          marks: 1,
          negativeMarks: 0,
          difficulty: "EASY",
        },
        {
          question: "Is C a compiled programming language?",
          questionType: "TRUE_FALSE",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "C code is directly compiled into machine executable binaries.",
          marks: 1,
          difficulty: "EASY",
        },
      ],
    },
  ],
  modules: [
    {
      title: "C Fundamentals",
      description: "First steps in writing C programs.",
      order: 1,
      isPublished: true,
      quizzes: [
        {
          title: "Module 1 Quick Check",
          description: "Check understanding of basic C concepts.",
          passingScore: 60,
          timeLimit: 15,
          isPublished: true,
          questions: [
            {
              question: "What is the entry point of a C program?",
              questionType: "MCQ_SINGLE",
              options: ["start()", "main()", "run()", "execute()"],
              correctAnswer: "main()",
              explanation: "Execution of a C program always begins from main().",
              marks: 1,
              difficulty: "EASY",
            },
          ],
        },
      ],
      lessons: [
        {
          title: "Introduction to C",
          description: "Understanding compilation and basic structure.",
          order: 1,
          isPublished: true,
          topics: [
            {
              title: "What is C?",
              description: "Overview of procedural programming.",
              order: 1,
              isPublished: true,
              contents: [
                {
                  type: "HTML",
                  title: "Introduction to C Language",
                  order: 1,
                  htmlContent: "<h2>What is C?</h2><p>C is a low-level, high-efficiency compiled programming language.</p>",
                },
                {
                  type: "VIDEO",
                  title: "Writing Your First Hello World",
                  order: 2,
                  duration: 300,
                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default function CourseImportPage() {
  const router = useRouter();

  // Primary Prompt State
  const [prompt, setPrompt] = useState("");

  // Advanced Options State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [level, setLevel] = useState("AUTO");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("English");
  const [size, setSize] = useState("AUTO");

  // Workflow State: "INPUT" | "GENERATING" | "PREVIEW"
  const [workflowState, setWorkflowState] = useState("INPUT");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // ZIP Import State
  const [zipImportingState, setZipImportingState] = useState(null); // null | "uploading" | "validating" | "importing"
  const zipInputRef = useRef(null);

  // JSON File Import Ref
  const jsonInputRef = useRef(null);

  // Modals State
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState("");
  const [pasteValidationErrors, setPasteValidationErrors] = useState([]);

  const [showFormatGuideModal, setShowFormatGuideModal] = useState(false);
  const [showAiForm, setShowAiForm] = useState(false);
  const [isAskAiModalOpen, setIsAskAiModalOpen] = useState(false);

  // Global Error & Validation State
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Import Hooks
  const uploadZipMutation = useUploadZipPackage();
  const processZipMutation = useProcessZipJob();
  const processJsonMutation = useProcessJsonCourse();
  const generateAiMutation = useGenerateAiContent();
  const { refetch: refetchTemplate } = useCourseJsonTemplate();

  /** Assigns client-side UUIDs to canonical draft nodes for Composer compatibility */
  const withDraftIds = (modules = [], courseQuizzes = []) => {
    const mappedQuizzes = (courseQuizzes || []).map((quiz) => ({
      ...quiz,
      id: quiz.id || crypto.randomUUID(),
      questions: (quiz.questions || []).map((q) => ({
        ...q,
        id: q.id || crypto.randomUUID(),
      })),
    }));

    const mappedModules = (modules || []).map((mod) => ({
      ...mod,
      id: mod.id || crypto.randomUUID(),
      quizzes: (mod.quizzes || []).map((quiz) => ({
        ...quiz,
        id: quiz.id || crypto.randomUUID(),
        questions: (quiz.questions || []).map((q) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
        })),
      })),
      lessons: (mod.lessons || []).map((lesson) => ({
        ...lesson,
        id: lesson.id || crypto.randomUUID(),
        topics: (lesson.topics || []).map((topic) => ({
          ...topic,
          id: topic.id || crypto.randomUUID(),
          contents: (topic.contents || []).map((content) => ({
            ...content,
            id: content.id || crypto.randomUUID(),
          })),
        })),
      })),
    }));

    return { modules: mappedModules, quizzes: mappedQuizzes };
  };

  /** Saves temporary draft payload to sessionStorage and opens Course Composer */
  const prepareDraftAndNavigate = (canonical, jobId = null) => {
    try {
      const metadata = canonical.metadata || canonical || {};
      const settings = canonical.settings || {};
      const { modules, quizzes } = withDraftIds(
        Array.isArray(canonical.modules) ? canonical.modules : [],
        Array.isArray(canonical.quizzes) ? canonical.quizzes : []
      );
      const assetMap = canonical.assetMap || {};

      const draftPayload = {
        jobId: jobId || `draft-${crypto.randomUUID()}`,
        isImportDraft: true,
        metadata: {
          title: metadata.title || "Imported Course",
          description: metadata.description || "",
          category: metadata.category || "General",
          level: metadata.level || "BEGINNER",
          thumbnailUrl: metadata.thumbnail ? assetMap[metadata.thumbnail] || metadata.thumbnail : null,
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
        quizzes,
        modules,
        assetMap,
        canonicalJson: canonical,
      };

      sessionStorage.setItem("imported_course_draft", JSON.stringify(draftPayload));
      router.push("/instructor/courses/draft");
    } catch (err) {
      console.error("Draft Preparation Error:", err);
      setErrorMsg("Failed to prepare course draft for editing.");
    }
  };

  // ==========================================
  // 1. AI COURSE GENERATION HANDLER
  // ==========================================
  const handleGenerate = async () => {
    if (!prompt || !prompt.trim()) {
      setErrorMsg("Please describe what you want to teach in the prompt box.");
      return;
    }

    setWorkflowState("GENERATING");
    setErrorMsg("");
    setValidationErrors([]);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STAGED_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    try {
      const result = await generateAiMutation.mutateAsync({
        scope: "COURSE",
        prompt: prompt.trim(),
        context: {
          size,
          level,
          language,
          targetAudience: targetAudience || undefined,
        },
      });

      clearInterval(stepInterval);

      if (!result?.success) {
        const msg = result?.message || "AI course generation failed.";
        const errors = result?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setWorkflowState("INPUT");
        return;
      }

      const resultData = result.data;
      if (resultData) {
        setGeneratedDraft(resultData);
        setWorkflowState("PREVIEW");
      } else {
        throw new Error("No course data returned from AI service.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("AI Generation Error:", err);
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || "AI course generation failed. Please try again.";
      if (status === 401) {
        msg = "AI Authorization Failed. Check server GEMINI_API_KEY.";
      } else if (status === 429) {
        msg = "AI Usage limit reached. Please try again later.";
      }
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
      setWorkflowState("INPUT");
    }
  };

  const handleApplyToComposer = () => {
    if (!generatedDraft) return;
    const canonical = generatedDraft.canonicalJson || generatedDraft.data?.canonicalJson || generatedDraft;
    prepareDraftAndNavigate(canonical);
  };

  // ==========================================
  // 2. ZIP PACKAGE IMPORT HANDLER
  // ==========================================
  const handleZipFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setErrorMsg("Invalid file type. Please select a .zip course package.");
      if (zipInputRef.current) zipInputRef.current.value = "";
      return;
    }

    setErrorMsg("");
    setValidationErrors([]);
    setZipImportingState("uploading");

    try {
      // Step 1: Upload ZIP file package to backend
      const job = await uploadZipMutation.mutateAsync(file);

      if (!job || !job.id) {
        throw new Error("Failed to create import job.");
      }

      // Step 2: Validate and process package
      setZipImportingState("validating");
      const processedJob = await processZipMutation.mutateAsync(job.id);

      setZipImportingState("importing");

      const canonical = processedJob?.canonicalJson || job?.canonicalJson;

      if (!canonical) {
        throw new Error("Unable to extract valid course structure from ZIP package.");
      }

      setZipImportingState(null);
      if (zipInputRef.current) zipInputRef.current.value = "";

      // Load extracted course structure into Composer
      prepareDraftAndNavigate(canonical, job.id);
    } catch (err) {
      setZipImportingState(null);
      if (zipInputRef.current) zipInputRef.current.value = "";
      console.error("ZIP Import Error:", err);
      const msg = err?.response?.data?.message || err?.message || "Unable to import the ZIP package. The package structure is invalid.";
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
    }
  };

  // ==========================================
  // 3. JSON FILE IMPORT HANDLER
  // ==========================================
  const handleJsonFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setErrorMsg("Invalid file type. Please select a .json file.");
      if (jsonInputRef.current) jsonInputRef.current.value = "";
      return;
    }

    setErrorMsg("");
    setValidationErrors([]);

    try {
      // Read & parse file locally first for instant syntax validation
      const text = await file.text();
      let parsedJson;
      try {
        parsedJson = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Invalid JSON syntax in file '${file.name}': ${parseErr.message}`);
      }

      // Basic Schema Checks
      if (!parsedJson || typeof parsedJson !== "object") {
        throw new Error("JSON file must contain a valid course object.");
      }

      const hasMetadataTitle = parsedJson.metadata?.title || parsedJson.title;
      if (!hasMetadataTitle) {
        throw new Error("Invalid course JSON: course title is missing (expected 'metadata.title' or 'title').");
      }

      // Process JSON with backend validator/parser
      const jobData = await processJsonMutation.mutateAsync({ file });
      const canonical = jobData?.canonicalJson || parsedJson;

      if (jsonInputRef.current) jsonInputRef.current.value = "";
      prepareDraftAndNavigate(canonical, jobData?.id);
    } catch (err) {
      if (jsonInputRef.current) jsonInputRef.current.value = "";
      console.error("JSON File Import Error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to process JSON course file.";
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
    }
  };

  // ==========================================
  // 4. PASTE JSON HANDLER
  // ==========================================
  const handleValidateAndImportPastedJson = async () => {
    setPasteValidationErrors([]);
    setErrorMsg("");
    setValidationErrors([]);

    if (!pastedJsonText || !pastedJsonText.trim()) {
      setPasteValidationErrors(["Please paste course JSON text before validating."]);
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(pastedJsonText.trim());
    } catch (parseErr) {
      setPasteValidationErrors([`Invalid JSON syntax: ${parseErr.message}`]);
      return;
    }

    if (!parsedJson || typeof parsedJson !== "object") {
      setPasteValidationErrors(["Root JSON element must be an object."]);
      return;
    }

    const hasTitle = parsedJson.metadata?.title || parsedJson.title;
    if (!hasTitle) {
      setPasteValidationErrors(["Invalid course JSON: course title is missing (expected 'metadata.title' or 'title')."]);
      return;
    }

    try {
      const jobData = await processJsonMutation.mutateAsync({ jsonContent: parsedJson });
      const canonical = jobData?.canonicalJson || parsedJson;

      setShowPasteModal(false);
      setPastedJsonText("");
      prepareDraftAndNavigate(canonical, jobData?.id);
    } catch (err) {
      console.error("Pasted JSON Import Error:", err);
      const msg = err?.response?.data?.message || err?.message || "JSON validation failed.";
      const errors = err?.response?.data?.errors || [msg];
      setPasteValidationErrors(errors);
    }
  };

  // ==========================================
  // 5. DOWNLOAD TEMPLATE HANDLER
  // ==========================================
  const handleDownloadTemplate = async () => {
    try {
      let templateData = FALLBACK_TEMPLATE;
      const { data: fetchedTemplate } = await refetchTemplate();
      if (fetchedTemplate) {
        templateData = fetchedTemplate;
      }

      const jsonStr = JSON.stringify(templateData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "orange_lms_course_template.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Template Error:", err);
      setErrorMsg("Failed to download course template.");
    }
  };

  // Preview Stats Calculation
  const canonicalData = generatedDraft?.canonicalJson || generatedDraft?.data?.canonicalJson || generatedDraft || {};
  const targetMetadata = canonicalData?.metadata || canonicalData || {};
  const modulesList = Array.isArray(canonicalData?.modules) ? canonicalData.modules : [];
  const quizzesList = Array.isArray(canonicalData?.quizzes) ? canonicalData.quizzes : [];

  const totalModulesCount = modulesList.length;
  const totalLessonsCount = modulesList.reduce(
    (acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
    0
  );
  const totalQuizzesCount =
    modulesList.reduce((acc, m) => acc + (Array.isArray(m.quizzes) ? m.quizzes.length : 0), 0) +
    quizzesList.length;

  return (
    <div className="min-h-screen bg-[#B7C9C5] text-black p-4 md:p-8 lg:p-10 font-sans pb-32">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={zipInputRef}
        onChange={handleZipFileSelected}
        accept=".zip"
        className="hidden"
      />
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleJsonFileSelected}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-[#B7C9C5] border border-[#D9D9D9] text-[#333333] hover:text-black transition"
            aria-label="Back to courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Create & Import Course
              </h1>
            </div>
            <p className="text-sm text-[#333333] mt-1">
              Build a new course with AI, import a local ZIP package, or load an Orange Tree LMS JSON course structure.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-sm space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {validationErrors.length > 0 && (
              <ul className="list-disc pl-6 text-xs space-y-1 text-rose-300/90 font-mono">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW A: THREE PRIMARY COURSE CREATION OPTIONS */}
        {/* ======================================================== */}
        {!showAiForm && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-black">How would you like to create your course?</h2>
              <p className="text-xs text-[#333333] mt-1">
                Select one of the three creation entry points below to build or import your course.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ---------------------------------------------------- */}
              {/* OPTION 1: ASK OTREE AI */}
              {/* ---------------------------------------------------- */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl flex flex-col justify-between space-y-6 hover:border-orange-500/40 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-full flex items-center space-x-1">
                      <Bot className="w-3 h-3" />
                      <span>AI Powered</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-black">Ask OTree AI</h3>
                    <p className="text-xs text-[#333333] mt-1 leading-relaxed">
                      Create a complete course using AI. Describe what you want to teach, who the learners are, and what the course should cover. OTree AI will generate a structured course draft for your review.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#B7C9C5] border border-[#D9D9D9]/80 text-xs font-mono text-orange-300 flex items-center space-x-1.5 flex-wrap">
                    <span className="font-bold text-amber-400">Complete Course</span>
                    <span className="text-[#777777]">→</span>
                    <span>Modules</span>
                    <span className="text-[#777777]">→</span>
                    <span>Lessons</span>
                    <span className="text-[#777777]">→</span>
                    <span className="text-emerald-400">Quizzes</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D9D9D9]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiForm(true);
                      setWorkflowState("INPUT");
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-sm font-extrabold shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Ask OTree AI</span>
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* OPTION 2: IMPORT FROM ZIP */}
              {/* ---------------------------------------------------- */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl flex flex-col justify-between space-y-6 hover:border-sky-500/40 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <FileArchive className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-full">
                      Package File
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-black">Import from ZIP</h3>
                    <p className="text-xs text-[#333333] mt-1 leading-relaxed">
                      Import an existing course package with content and local media files. Supports exported Orange Tree LMS ZIP packages.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-sky-950/60 border border-sky-800/60 text-sky-300 rounded-lg flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Includes content</span>
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-sky-950/60 border border-sky-800/60 text-sky-300 rounded-lg flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>All media included</span>
                    </span>
                  </div>
                </div>

                {zipImportingState && (
                  <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-800/50 text-sky-200 text-xs flex items-center space-x-3">
                    <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                    <span className="capitalize font-semibold">
                      {zipImportingState === "uploading"
                        ? "Uploading course package..."
                        : zipImportingState === "validating"
                        ? "Validating package..."
                        : "Importing course..."}
                    </span>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-[#D9D9D9]">
                  <button
                    type="button"
                    disabled={Boolean(zipImportingState)}
                    onClick={() => zipInputRef.current?.click()}
                    className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-black text-sm font-extrabold shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select ZIP Package</span>
                  </button>
                  <p className="text-[11px] text-[#555555] text-center font-mono">.zip file up to 2GB</p>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* OPTION 3: IMPORT FROM JSON */}
              {/* ---------------------------------------------------- */}
              <div className="p-6 md:p-8 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full">
                      JSON Schema
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-black">Import from JSON</h3>
                    <p className="text-xs text-[#333333] mt-1 leading-relaxed">
                      Create/import a course using the Orange Tree LMS JSON structure. Upload a file or paste raw JSON text directly.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#B7C9C5] border border-[#D9D9D9] text-xs font-mono text-indigo-300 flex items-center justify-center space-x-1.5 flex-wrap">
                    <span className="font-bold text-amber-400">Course</span>
                    <span className="text-[#777777]">→</span>
                    <span>Module</span>
                    <span className="text-[#777777]">→</span>
                    <span>Lesson</span>
                    <span className="text-[#777777]">→</span>
                    <span>Topic</span>
                    <span className="text-[#777777]">→</span>
                    <span className="text-emerald-400">Content</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#D9D9D9]">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => jsonInputRef.current?.click()}
                      className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black text-xs font-extrabold shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select JSON File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPasteValidationErrors([]);
                        setShowPasteModal(true);
                      }}
                      className="py-3 rounded-xl bg-[#B7C9C5] hover:bg-[#CFCFCF] text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste JSON</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowFormatGuideModal(true)}
                      className="text-[#333333] hover:text-indigo-300 font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>View Format Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW B: AI COURSE CREATION FORM (ASK OTREE AI WORKFLOW) */}
        {/* ======================================================== */}
        {showAiForm && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation Bar inside AI Form */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D9D9]">
              <button
                type="button"
                onClick={() => {
                  setShowAiForm(false);
                  setWorkflowState("INPUT");
                }}
                className="px-4 py-2 rounded-xl bg-[#B7C9C5] border border-[#D9D9D9] hover:border-[#D9D9D9] text-[#333333] hover:text-black text-xs font-bold transition flex items-center space-x-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Creation Options</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-[#333333] font-mono">
                <span>AI Course Creator</span>
                <span>•</span>
                <span className="text-orange-400 font-bold">Complete Course Mode</span>
              </div>
            </div>

            {/* INPUT FORM STATE */}
            {workflowState === "INPUT" && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black flex items-center space-x-2">
                        <span>Compose Course with AI Agent</span>
                        <span className="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-full flex items-center space-x-1">
                          <Bot className="w-3 h-3" />
                          <span>Gemini 3.6 Flash</span>
                        </span>
                      </h2>
                      <p className="text-xs text-[#333333] mt-0.5">
                        Describe your course goals in plain text. The AI Agent will generate a structured draft with modules, lessons, topics, and quizzes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="e.g. Create a beginner Python course for college students. Cover variables, control flow, functions, OOP, and data structures with practical code examples and quizzes..."
                    rows={5}
                    className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl p-4 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition leading-relaxed resize-y font-sans shadow-inner"
                  />
                </div>

                {/* Example Prompt Pills */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#333333] tracking-wider uppercase">
                    Try an example:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(ex.text);
                          if (errorMsg) setErrorMsg("");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#B7C9C5] border border-[#D9D9D9] hover:border-orange-500/40 text-xs font-medium text-[#333333] hover:text-amber-400 transition cursor-pointer"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible Advanced Options Accordion */}
                <div className="pt-2 border-t border-[#D9D9D9]/80">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-xs font-semibold text-[#333333] hover:text-black transition py-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                    <span>Customize Generation (Advanced options)</span>
                    {showAdvanced ? (
                      <ChevronDown className="w-4 h-4 text-[#333333]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#333333]" />
                    )}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#B7C9C5]/80 border border-[#D9D9D9]/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="text-xs font-medium text-[#333333] block mb-1">Course Size</label>
                        <select
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-orange-500/50"
                        >
                          <option value="AUTO">Auto (Inferred)</option>
                          <option value="SMALL">Small (3-4 modules)</option>
                          <option value="MEDIUM">Medium (5-7 modules)</option>
                          <option value="LARGE">Large (8-10 modules)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#333333] block mb-1">Difficulty Level</label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-orange-500/50"
                        >
                          <option value="AUTO">Auto (Inferred)</option>
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#333333] block mb-1">Target Audience</label>
                        <input
                          type="text"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="e.g. Beginners, Employees (Auto)"
                          className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-orange-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#333333] block mb-1">Language</label>
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl px-3 py-2 text-xs text-black focus:outline-none focus:border-orange-500/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer: ONLY Launch AI Composer button! */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D9D9D9]">
                  <div className="flex items-center space-x-2 text-xs text-[#333333]">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Generates canonical course structure with modules & quizzes</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-sm font-extrabold shadow-lg shadow-orange-500/20 transition flex items-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Launch AI Composer</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI GENERATING STATE */}
            {workflowState === "GENERATING" && (
              <div className="p-8 md:p-12 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl text-center space-y-8 animate-in fade-in duration-300">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 text-orange-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-black">Creating your course with AI...</h3>
                  <p className="text-xs text-[#333333] mt-1 max-w-md mx-auto">
                    Gemini 3.6 Flash is authoring your modules, lessons, topic materials, and quizzes.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-3 text-left">
                  {STAGED_STEPS.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center space-x-3.5 ${
                          isDone
                            ? "bg-[#B7C9C5]/80 border-emerald-500/30 text-emerald-300"
                            : isCurrent
                            ? "bg-[#B7C9C5] border-orange-500/50 text-orange-400 shadow-lg"
                            : "bg-[#B7C9C5]/40 border-[#D9D9D9] text-[#555555]"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-5 h-5 text-orange-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#D9D9D9] shrink-0" />
                        )}
                        <div>
                          <span className="text-xs font-bold block">{step.label}</span>
                          <span className="text-[11px] text-[#333333] font-mono">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI PREVIEW STATE */}
            {workflowState === "PREVIEW" && (
              <div className="p-6 md:p-8 rounded-3xl bg-[#B7C9C5] border border-[#D9D9D9] shadow-2xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-black">Course Draft Preview</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWorkflowState("INPUT")}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition underline"
                  >
                    Edit Prompt / Re-generate
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl text-center">
                    <span className="text-xs text-[#333333] uppercase font-bold block">Modules</span>
                    <span className="text-xl font-black text-amber-400 mt-1 block">{totalModulesCount}</span>
                  </div>
                  <div className="p-4 bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl text-center">
                    <span className="text-xs text-[#333333] uppercase font-bold block">Lessons</span>
                    <span className="text-xl font-black text-orange-400 mt-1 block">{totalLessonsCount}</span>
                  </div>
                  <div className="p-4 bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl text-center">
                    <span className="text-xs text-[#333333] uppercase font-bold block">Quizzes</span>
                    <span className="text-xl font-black text-emerald-400 mt-1 block">{totalQuizzesCount}</span>
                  </div>
                </div>

                <div className="p-5 bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl max-h-[50vh] overflow-y-auto space-y-4">
                  <div>
                    <h4 className="text-base font-extrabold text-amber-400">
                      {targetMetadata?.title || "AI Generated Course"}
                    </h4>
                    <p className="text-xs text-[#333333] mt-1 leading-relaxed">
                      {targetMetadata?.description || "Course description generated by AI."}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] font-mono text-[#333333] mt-2">
                      <span>Level: {targetMetadata?.level || "BEGINNER"}</span>
                      <span>•</span>
                      <span>Category: {targetMetadata?.category || "General"}</span>
                    </div>
                  </div>

                  {modulesList.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-[#D9D9D9]">
                      {modulesList.map((m, idx) => (
                        <div key={idx} className="p-4 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-black">
                            <span className="flex items-center space-x-2">
                              <Layers className="w-4 h-4 text-amber-400" />
                              <span>Module {idx + 1}: {m.title}</span>
                            </span>
                            <span className="text-[11px] text-[#333333] font-mono">
                              {Array.isArray(m.lessons) ? `${m.lessons.length} lessons` : "0 lessons"}
                            </span>
                          </div>
                          {m.description && <p className="text-xs text-[#333333] leading-relaxed pl-6">{m.description}</p>}

                          {Array.isArray(m.lessons) && m.lessons.length > 0 && (
                            <div className="pl-6 border-l border-[#D9D9D9] space-y-1.5 mt-2">
                              {m.lessons.map((l, lIdx) => (
                                <div key={lIdx} className="text-xs text-[#333333] flex items-center justify-between">
                                  <span className="flex items-center space-x-2">
                                    <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                                    <span>• {l.title}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#D9D9D9]">
                  <button
                    type="button"
                    onClick={() => setWorkflowState("INPUT")}
                    className="px-5 py-2.5 rounded-xl bg-[#B7C9C5] hover:bg-[#CFCFCF] text-[#333333] text-xs font-semibold border border-[#D9D9D9] transition"
                  >
                    Back to Prompt
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToComposer}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 cursor-pointer"
                  >
                    <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
                    <span>Apply to Course Composer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: PASTE JSON MODAL */}
      {/* ======================================================== */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-[#B7C9C5]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#B7C9C5] border border-[#D9D9D9] rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-4">
              <div className="flex items-center space-x-2">
                <Clipboard className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-black">Paste Orange Tree LMS JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-[#333333] hover:text-black p-1 rounded-lg hover:bg-[#CFCFCF] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pasteValidationErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Validation Error</span>
                </div>
                <ul className="list-disc pl-5 font-mono text-[11px] space-y-0.5 text-rose-300/90">
                  {pasteValidationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#333333] block">
                Paste JSON Course Content below:
              </label>
              <textarea
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='{\n  "metadata": {\n    "title": "My Custom Course",\n    "category": "Computer Science"\n  },\n  "modules": [...]\n}'
                rows={10}
                className="w-full bg-[#B7C9C5] border border-[#D9D9D9] rounded-2xl p-4 text-xs text-black font-mono focus:outline-none focus:border-indigo-500 transition resize-y"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#D9D9D9]">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#B7C9C5] hover:bg-[#CFCFCF] text-[#333333] text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleValidateAndImportPastedJson}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Validate & Import JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FORMAT GUIDE MODAL */}
      {/* ======================================================== */}
      {showFormatGuideModal && (
        <div className="fixed inset-0 z-50 bg-[#B7C9C5]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#B7C9C5] border border-[#D9D9D9] rounded-3xl w-full max-w-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-4">
              <div className="flex items-center space-x-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-black">Orange Tree LMS Course JSON Format Guide (v2)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormatGuideModal(false)}
                className="text-[#333333] hover:text-black p-1 rounded-lg hover:bg-[#CFCFCF] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hierarchy Explanation */}
            <div className="space-y-4 text-xs text-[#333333] leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
                <h4 className="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                  Course Structure Hierarchy
                </h4>
                <p className="text-[#333333]">
                  Orange Tree LMS organizes courses using a 5-level nested structure:
                </p>
                <div className="p-2.5 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl font-mono text-[11px] text-amber-300 flex items-center space-x-2 flex-wrap">
                  <span className="font-bold">Course</span> → <span>Module</span> → <span>Lesson</span> → <span>Topic</span> → <span className="text-emerald-400">Content / Quiz</span>
                </div>
              </div>

              {/* Schema Fields Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-black text-sm">Supported Top-Level Fields</h4>

                <div className="space-y-2">
                  <div className="p-3 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl">
                    <span className="font-bold text-amber-400 font-mono block">metadata</span>
                    <span className="text-[#333333] block mt-0.5">
                      Contains course title, description, category, difficulty level (BEGINNER | INTERMEDIATE | ADVANCED), language, estimatedLearningHours, price, and tags array.
                    </span>
                  </div>

                  <div className="p-3 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl">
                    <span className="font-bold text-indigo-400 font-mono block">settings</span>
                    <span className="text-[#333333] block mt-0.5">
                      visibility (PUBLIC | PRIVATE), certificatesEnabled (boolean), discussionEnabled (boolean), dripContentEnabled (boolean).
                    </span>
                  </div>

                  <div className="p-3 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl">
                    <span className="font-bold text-emerald-400 font-mono block">modules [ ]</span>
                    <span className="text-[#333333] block mt-0.5">
                      Array of module objects. Each module has title, description, order, and nested lessons array.
                    </span>
                  </div>

                  <div className="p-3 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl">
                    <span className="font-bold text-sky-400 font-mono block">contents [ ] (Topic Content Items)</span>
                    <span className="text-[#333333] block mt-0.5">
                      Supported types: HTML (rich text / markdown), VIDEO (videoUrl), DOCUMENT (fileUrl), PRESENTATION (fileUrl).
                    </span>
                  </div>

                  <div className="p-3 bg-[#B7C9C5] border border-[#D9D9D9] rounded-xl">
                    <span className="font-bold text-purple-400 font-mono block">quizzes [ ]</span>
                    <span className="text-[#333333] block mt-0.5">
                      Course or module level assessment quizzes with passingScore, timeLimit, and questions array (MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, SHORT_ANSWER, CODING).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#D9D9D9]">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFormatGuideModal(false)}
                className="px-6 py-2 rounded-xl bg-[#B7C9C5] hover:bg-[#CFCFCF] text-black text-xs font-bold transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Ask OTree AI Assistant Modal (Workflow 2: Specific Entity Creation) */}
      <AiComposerModal
        isOpen={isAskAiModalOpen}
        onClose={() => setIsAskAiModalOpen(false)}
        initialScope="MODULE"
        contextData={{
          courseTitle: prompt ? prompt.slice(0, 40) + "..." : "New Course",
          modules: generatedDraft?.modules || [],
          courseQuizzes: generatedDraft?.quizzes || [],
          activeLevel: "COURSE",
        }}
        onApply={(generatedData, scope, contextData) => {
          if (scope === "COURSE") {
            const canonical = generatedData.canonicalJson || generatedData;
            prepareDraftAndNavigate(canonical);
          } else {
            const newModule = scope === "MODULE" ? generatedData : {
              title: generatedData.title || "Module 1",
              description: "",
              order: 1,
              lessons: scope === "LESSON" ? [generatedData] : [
                {
                  title: generatedData.title || "Lesson 1",
                  description: "",
                  order: 1,
                  topics: scope === "TOPIC" ? [generatedData] : [
                    {
                      title: generatedData.title || "Topic 1",
                      description: "",
                      order: 1,
                      contents: scope === "CONTENT" ? (Array.isArray(generatedData.contents) ? generatedData.contents : [generatedData]) : []
                    }
                  ]
                }
              ]
            };

            const canonical = {
              metadata: {
                title: generatedData.title || "AI Created Course",
                description: "Created via Ask OTree AI",
                category: "General",
                level: "BEGINNER",
              },
              settings: { visibility: "PUBLIC" },
              modules: [newModule],
              quizzes: scope === "QUIZ" ? [generatedData] : [],
            };
            prepareDraftAndNavigate(canonical);
          }
        }}
      />
    </div>
  );
}
