"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import api from "@/lib/axios";

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

export default function CourseImportPage() {
  const router = useRouter();

  // Primary Prompt State
  const [prompt, setPrompt] = useState("");
  
  // Advanced Options State (Collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [level, setLevel] = useState("AUTO");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("English");
  const [size, setSize] = useState("AUTO");

  // Workflow State: "INPUT" | "GENERATING" | "PREVIEW"
  const [workflowState, setWorkflowState] = useState("INPUT");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

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
  const prepareDraftAndNavigate = (canonical) => {
    try {
      const metadata = canonical.metadata || {};
      const settings = canonical.settings || {};
      const { modules, quizzes } = withDraftIds(
        Array.isArray(canonical.modules) ? canonical.modules : [],
        Array.isArray(canonical.quizzes) ? canonical.quizzes : []
      );
      const assetMap = canonical.assetMap || {};

      const draftPayload = {
        jobId: `draft-${crypto.randomUUID()}`,
        isImportDraft: true,
        metadata: {
          title: metadata.title || "AI Generated Course",
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

  const handleGenerate = async () => {
    if (!prompt || !prompt.trim()) {
      setErrorMsg("Please describe what you want to teach in the prompt box.");
      return;
    }

    setWorkflowState("GENERATING");
    setErrorMsg("");
    setValidationErrors([]);
    setCurrentStepIndex(0);

    // Staged progress timers for UI feedback
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STAGED_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    try {
      const response = await api.post(
        "/api/ai/generate",
        {
          scope: "COURSE",
          prompt: prompt.trim(),
          context: {
            size,
            level,
            language,
            targetAudience: targetAudience || undefined,
          },
        },
        {
          timeout: 240000, // 4-minute maximum timeout for LLM generation
        }
      );

      clearInterval(stepInterval);

      if (!response.data?.success) {
        const msg = response.data?.message || "AI course generation failed.";
        const errors = response.data?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setWorkflowState("INPUT");
        return;
      }

      const resultData = response.data.data;
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

  // Helper stats for preview step
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-10 font-sans pb-32">
      {/* Navigation Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <Link
            href="/instructor/courses"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Back to courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Create Course with AI
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-full flex items-center space-x-1">
                <Bot className="w-3 h-3" />
                <span>Gemini 3.6 Flash</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Describe what you want to teach. AI will turn your idea into a structured course with modules, lessons, content, and quizzes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* INPUT STATE: PROMPT-FIRST COURSE CREATION */}
        {workflowState === "INPUT" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Main Prompt Container */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-amber-400" />
                  <span>Tell AI what you want to create</span>
                </label>
                <p className="text-xs text-slate-400">
                  Write your course request naturally. Specify topics, audience, depth, or duration if desired.
                </p>
              </div>

              {/* Natural Language Textarea */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="e.g. Create a beginner Python course for college students. Cover variables, control flow, functions, OOP, and data structures with practical code examples and quizzes..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition leading-relaxed resize-y font-sans shadow-inner"
                />
              </div>

              {/* Lightweight Example Prompt Pills */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-xs font-medium text-slate-300 hover:text-amber-400 transition"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Advanced Options Accordion */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1"
                >
                  <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                  <span>Customize Generation (Advanced options)</span>
                  {showAdvanced ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Course Size</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="AUTO">Auto (Inferred)</option>
                        <option value="SMALL">Small (3-4 modules)</option>
                        <option value="MEDIUM">Medium (5-7 modules)</option>
                        <option value="LARGE">Large (8-10 modules)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Difficulty Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                      >
                        <option value="AUTO">Auto (Inferred)</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Target Audience</label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g. Beginners, Employees (Auto)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Language</label>
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Generates canonical course structure with modules & quizzes</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 text-sm font-extrabold shadow-lg shadow-orange-500/20 transition flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Generate Course</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATING STATE: STAGED PIPELINE FEEDBACK */}
        {workflowState === "GENERATING" && (
          <div className="p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-8 animate-in fade-in duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-orange-400" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Creating your course with AI...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Gemini 3.6 Flash is authoring your modules, lessons, topic materials, and quizzes.
              </p>
            </div>

            {/* Staged UI Steps */}
            <div className="max-w-md mx-auto space-y-3 text-left">
              {STAGED_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center space-x-3.5 ${
                      isDone
                        ? "bg-slate-950/80 border-emerald-500/30 text-emerald-300"
                        : isCurrent
                        ? "bg-slate-950 border-orange-500/50 text-orange-400 shadow-lg"
                        : "bg-slate-950/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-5 h-5 text-orange-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">{step.label}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PREVIEW STATE: GENERATED DRAFT PREVIEW & APPLY */}
        {workflowState === "PREVIEW" && (
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Course Draft Preview</h3>
              </div>

              <button
                type="button"
                onClick={() => setWorkflowState("INPUT")}
                className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition underline"
              >
                Edit Prompt / Re-generate
              </button>
            </div>

            {/* Summary Stats Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block">Modules</span>
                <span className="text-xl font-black text-amber-400 mt-1 block">{totalModulesCount}</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block">Lessons</span>
                <span className="text-xl font-black text-orange-400 mt-1 block">{totalLessonsCount}</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block">Quizzes</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{totalQuizzesCount}</span>
              </div>
            </div>

            {/* Course Tree Hierarchy Preview */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl max-h-[50vh] overflow-y-auto space-y-4">
              <div>
                <h4 className="text-base font-extrabold text-amber-400">
                  {targetMetadata?.title || "AI Generated Course"}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {targetMetadata?.description || "Course description generated by AI."}
                </p>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 mt-2">
                  <span>Level: {targetMetadata?.level || "BEGINNER"}</span>
                  <span>•</span>
                  <span>Category: {targetMetadata?.category || "General"}</span>
                </div>
              </div>

              {modulesList.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  {modulesList.map((m, idx) => (
                    <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-100">
                        <span className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-amber-400" />
                          <span>Module {idx + 1}: {m.title}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {Array.isArray(m.lessons) ? `${m.lessons.length} lessons` : "0 lessons"}
                        </span>
                      </div>
                      {m.description && <p className="text-xs text-slate-400 leading-relaxed pl-6">{m.description}</p>}

                      {Array.isArray(m.lessons) && m.lessons.length > 0 && (
                        <div className="pl-6 border-l border-slate-800 space-y-1.5 mt-2">
                          {m.lessons.map((l, lIdx) => (
                            <div key={lIdx} className="text-xs text-slate-300 flex items-center justify-between">
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

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWorkflowState("INPUT")}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
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
    </div>
  );
}
