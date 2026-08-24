"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  X,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  FolderPlus,
  FilePlus,
  HelpCircle,
  Eye,
  Check,
  MapPin,
  Wand2,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import api from "@/lib/axios";

/**
 * Assigns client-side temporary IDs to canonical JSON entities for Course Composer draft state.
 */
function withDraftIds(modules = [], courseQuizzes = []) {
  const mappedQuizzes = (courseQuizzes || []).map((quiz) => ({
    ...quiz,
    id: quiz.id || `draft-quiz-${crypto.randomUUID()}`,
    questions: (quiz.questions || []).map((q) => ({
      ...q,
      id: q.id || `draft-que-${crypto.randomUUID()}`,
    })),
  }));

  const mappedModules = (modules || []).map((mod) => ({
    ...mod,
    id: mod.id || `draft-mod-${crypto.randomUUID()}`,
    quizzes: (mod.quizzes || []).map((quiz) => ({
      ...quiz,
      id: quiz.id || `draft-quiz-${crypto.randomUUID()}`,
      questions: (quiz.questions || []).map((q) => ({
        ...q,
        id: q.id || `draft-que-${crypto.randomUUID()}`,
      })),
    })),
    lessons: (mod.lessons || []).map((lesson) => ({
      ...lesson,
      id: lesson.id || `draft-les-${crypto.randomUUID()}`,
      topics: (lesson.topics || []).map((topic) => ({
        ...topic,
        id: topic.id || `draft-top-${crypto.randomUUID()}`,
        contents: (topic.contents || []).map((content) => ({
          ...content,
          id: content.id || `draft-cnt-${crypto.randomUUID()}`,
        })),
      })),
    })),
  }));

  return { modules: mappedModules, quizzes: mappedQuizzes };
}

const DEFAULT_CONTEXT = {};

export default function AiComposerModal({
  isOpen,
  onClose,
  initialScope = "COURSE",
  contextData = DEFAULT_CONTEXT,
  onApply = null,
}) {
  const router = useRouter();

  // Active Scope & Action Selection
  const [selectedScope, setSelectedScope] = useState(initialScope);
  const [selectedAction, setSelectedAction] = useState("CREATE"); // "CREATE" | "IMPROVE" | "EXPAND" | "SIMPLIFY"
  const [prompt, setPrompt] = useState("");
  const [quizLevel, setQuizLevel] = useState("COURSE"); // "COURSE" | "MODULE" | "LESSON" | "TOPIC"

  // State Management
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [step, setStep] = useState("INPUT"); // "INPUT" | "PREVIEW"

  // Extract normalized context
  const {
    courseTitle = "",
    moduleId,
    moduleTitle = "",
    lessonId,
    lessonTitle = "",
    topicId,
    topicTitle = "",
    contentId,
    activeLevel = "COURSE",
  } = contextData || {};

  // Sync initial scope, action, and quiz level on open based on context
  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setValidationErrors([]);
      setGeneratedDraft(null);
      setStep("INPUT");
      setPrompt("");
      setSelectedAction("CREATE");

      // Strictly map default scope & quiz level based on active location context (Requirement 10 Action Matrix)
      if (activeLevel === "CONTENT") {
        setSelectedScope("CONTENT");
        setSelectedAction("IMPROVE");
        setQuizLevel("TOPIC");
      } else if (activeLevel === "TOPIC") {
        setSelectedScope("CONTENT");
        setQuizLevel("TOPIC");
      } else if (activeLevel === "LESSON") {
        setSelectedScope("TOPIC");
        setQuizLevel("LESSON");
      } else if (activeLevel === "MODULE") {
        setSelectedScope("LESSON");
        setQuizLevel("MODULE");
      } else {
        setSelectedScope("MODULE");
        setQuizLevel("COURSE");
      }
    }
  }, [isOpen, activeLevel, initialScope]);

  if (!isOpen) return null;

  // Determine allowed actions based on active selection level (Requirement 10)
  const getAllowedActions = () => {
    if (activeLevel === "COURSE") {
      return [
        { scope: "MODULE", label: "+ Create Module", icon: FolderPlus, color: "amber" },
        { scope: "QUIZ", quizLevel: "COURSE", label: "📝 Create Course Quiz", icon: HelpCircle, color: "purple" },
      ];
    } else if (activeLevel === "MODULE") {
      return [
        { scope: "LESSON", label: "+ Create Lesson", icon: BookOpen, color: "orange" },
        { scope: "QUIZ", quizLevel: "MODULE", label: "📝 Create Module Quiz", icon: HelpCircle, color: "purple" },
      ];
    } else if (activeLevel === "LESSON") {
      return [
        { scope: "TOPIC", label: "+ Create Topic", icon: FilePlus, color: "emerald" },
        { scope: "QUIZ", quizLevel: "LESSON", label: "📝 Create Lesson Quiz", icon: HelpCircle, color: "purple" },
      ];
    } else if (activeLevel === "TOPIC") {
      return [
        { scope: "CONTENT", label: "+ Create Content Block", icon: Wand2, color: "teal" },
        { scope: "QUIZ", quizLevel: "TOPIC", label: "📝 Create Topic Quiz", icon: HelpCircle, color: "purple" },
      ];
    } else if (activeLevel === "CONTENT") {
      return [
        { scope: "CONTENT", action: "IMPROVE", label: "✨ Improve Content", icon: Wand2, color: "teal" },
        { scope: "CONTENT", action: "EXPAND", label: "➕ Expand Content", icon: Maximize2, color: "emerald" },
        { scope: "CONTENT", action: "SIMPLIFY", label: "⚡ Simplify Content", icon: Minimize2, color: "orange" },
      ];
    }
    return [
      { scope: "MODULE", label: "+ Create Module", icon: FolderPlus, color: "amber" },
      { scope: "QUIZ", quizLevel: "COURSE", label: "📝 Create Course Quiz", icon: HelpCircle, color: "purple" },
    ];
  };

  // Quick prompt suggestions tailored to context
  const getPromptSuggestions = () => {
    if (selectedScope === "MODULE") {
      return [
        "Create a module about advanced memory management and pointers",
        "Create a module covering Spring Boot REST API development",
        "Create a module explaining Newton's laws of motion",
      ];
    } else if (selectedScope === "LESSON") {
      return [
        `Create a lesson explaining pointer arithmetic under ${moduleTitle || 'this module'}`,
        "Create a lesson covering Dependency Injection with practical exercises",
        "Create a lesson on kinetic vs potential energy",
      ];
    } else if (selectedScope === "TOPIC") {
      return [
        `Create a topic explaining Stack vs Heap memory under ${lessonTitle || 'this lesson'}`,
        "Create a topic covering Controller annotations in Spring Boot",
        "Create a topic on free-body diagrams",
      ];
    } else if (selectedScope === "CONTENT") {
      if (selectedAction === "IMPROVE") {
        return [
          "Improve code clarity and add inline comments",
          "Enhance formatting with structured headings and bullet points",
          "Make explanations more engaging for undergraduate students",
        ];
      }
      return [
        `Create a practical code example demonstrating key concepts for ${topicTitle || lessonTitle}`,
        "Explain this concept with step-by-step bullet points and code",
        "Simplify and expand this explanation for beginner students",
      ];
    } else if (selectedScope === "QUIZ") {
      return [
        `Create a 3-question quiz testing key concepts in ${topicTitle || lessonTitle || moduleTitle || courseTitle}`,
        "Create a multiple-choice quiz covering syntax and common pitfalls",
        "Create an assessment with detailed explanations for correct answers",
      ];
    }
    return [
      "Create a complete course structure for beginner web development",
      "Create a 4-module course covering Python data science basics",
    ];
  };

  const prepareDraftAndNavigate = (canonical) => {
    const metadata = canonical.metadata || {};
    const settings = canonical.settings || {};
    const { modules, quizzes } = withDraftIds(
      Array.isArray(canonical.modules) ? canonical.modules : [],
      Array.isArray(canonical.quizzes) ? canonical.quizzes : []
    );

    const draftPayload = {
      jobId: `draft-${crypto.randomUUID()}`,
      isImportDraft: true,
      metadata: {
        title: metadata.title || courseTitle || "AI Generated Course",
        description: metadata.description || prompt || "",
        category: metadata.category || "General",
        level: metadata.level || "BEGINNER",
        status: "DRAFT",
      },
      settings,
      quizzes,
      modules,
      canonicalJson: canonical,
    };

    sessionStorage.setItem("imported_course_draft", JSON.stringify(draftPayload));
    router.push("/instructor/courses/draft");
  };

  const handleGenerate = async () => {
    if (!prompt || !prompt.trim()) {
      setErrorMsg("Please describe what you would like OTree AI to create.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setValidationErrors([]);

    const compiledPrompt = `User Instruction: ${prompt.trim()}

Current Selection Context:
Course: ${courseTitle || "Default Course"}
${moduleTitle ? `Module: ${moduleTitle}` : ""}
${lessonTitle ? `Lesson: ${lessonTitle}` : ""}
${topicTitle ? `Topic: ${topicTitle}` : ""}
Scope: ${selectedScope}
Action: ${selectedAction}
${selectedScope === "QUIZ" ? `Quiz Level: ${quizLevel}` : ""}`;

    try {
      const response = await api.post(
        "/api/ai/generate",
        {
          scope: selectedScope,
          action: selectedAction,
          prompt: compiledPrompt,
          context: {
            scope: selectedScope,
            action: selectedAction,
            level: quizLevel,
            courseId: contextData?.courseId,
            courseTitle,
            moduleId,
            moduleTitle,
            lessonId,
            lessonTitle,
            topicId,
            topicTitle,
            contentId: contextData?.contentId,
          },
        },
        {
          timeout: 240000,
        }
      );

      if (!response.data?.success) {
        const msg = response.data?.message || "AI generation failed.";
        const errors = response.data?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      const resultData = response.data.data;
      if (resultData) {
        setGeneratedDraft(resultData);
        setStep("PREVIEW");
      } else {
        throw new Error("No data returned from AI service.");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || "AI generation failed. Please try again.";
      if (status === 401) {
        msg = "AI Authorization Failed. Check server GEMINI_API_KEY.";
      } else if (status === 429) {
        msg = "AI Usage limit reached. Please try again later.";
      }
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedDraft) return;

    if (onApply && typeof onApply === "function") {
      onApply(generatedDraft, selectedScope, { ...contextData, quizLevel, action: selectedAction });
      onClose();
      return;
    }

    const canonical = generatedDraft.canonicalJson || generatedDraft;
    prepareDraftAndNavigate(canonical);
    onClose();
  };

  const allowedActions = getAllowedActions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-400/20 border border-orange-500/30 text-orange-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Ask OTree AI</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-slate-800 border border-slate-700 text-amber-400 rounded-full flex items-center space-x-1">
                  <Bot className="w-3 h-3" />
                  <span>Gemini 3.6 Flash</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Context-aware assistant for your selected Composer location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Current Editing Location Context Badge */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-400" />
              <span>Current Selection Context</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {courseTitle && (
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <strong className="text-white truncate max-w-[160px]">{courseTitle}</strong>
                </span>
              )}
              {moduleTitle && (
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Module:</span>
                  <strong className="text-amber-400 truncate max-w-[160px]">{moduleTitle}</strong>
                </span>
              )}
              {lessonTitle && (
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Lesson:</span>
                  <strong className="text-orange-400 truncate max-w-[160px]">{lessonTitle}</strong>
                </span>
              )}
              {topicTitle && (
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Topic:</span>
                  <strong className="text-emerald-400 truncate max-w-[160px]">{topicTitle}</strong>
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside text-xs space-y-0.5 pl-5 text-rose-400/90">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === "INPUT" ? (
            <>
              {/* Scope Selection Tabs */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  What would you like to create?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedScope("MODULE")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      selectedScope === "MODULE"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Module</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedScope("LESSON")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      selectedScope === "LESSON"
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedScope("TOPIC")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      selectedScope === "TOPIC"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Topic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedScope("CONTENT")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      selectedScope === "CONTENT"
                        ? "bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Content</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedScope("QUIZ")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 border cursor-pointer ${
                      selectedScope === "QUIZ"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md"
                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Quiz</span>
                  </button>
                </div>
              </div>

              {/* Sub-selector for Quiz Level if Quiz scope selected */}
              {selectedScope === "QUIZ" && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quiz Target Hierarchy Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["COURSE", "MODULE", "LESSON", "TOPIC"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setQuizLevel(lvl)}
                        className={`py-1.5 text-xs font-extrabold rounded-lg transition border cursor-pointer ${
                          quizLevel === lvl
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {lvl} Quiz
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Language Prompt Area */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Describe what you want OTree AI to generate
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  placeholder={`Describe your requirements for ${selectedScope.toLowerCase()}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 font-sans resize-none"
                />
              </div>

              {/* Quick Prompt Pill Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Ideas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {getPromptSuggestions().map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sug)}
                      disabled={loading}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition text-left cursor-pointer"
                    >
                      💡 {sug}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* PREVIEW STEP */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">AI Generated {selectedScope} Preview</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("INPUT")}
                  className="text-xs text-orange-400 hover:text-orange-300 transition underline cursor-pointer"
                >
                  Re-generate / Change Prompt
                </button>
              </div>

              {/* Render generated content preview */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-[45vh] overflow-y-auto space-y-3 font-sans text-xs">
                {selectedScope === "MODULE" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-amber-400">{generatedDraft?.title || "Module"}</h4>
                    <p className="text-slate-300">{generatedDraft?.description}</p>
                    {Array.isArray(generatedDraft?.lessons) && (
                      <div className="space-y-1.5 pl-3 border-l border-slate-800">
                        {generatedDraft.lessons.map((l, i) => (
                          <div key={i} className="text-slate-300">
                            <strong>• Lesson {i + 1}: {l.title}</strong>
                            {l.description && <p className="text-[11px] text-slate-400 pl-3">{l.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "LESSON" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-orange-400">{generatedDraft?.title || "Lesson"}</h4>
                    <p className="text-slate-300">{generatedDraft?.description}</p>
                    {Array.isArray(generatedDraft?.topics) && (
                      <div className="space-y-1.5 pl-3 border-l border-slate-800">
                        {generatedDraft.topics.map((t, i) => (
                          <div key={i} className="text-slate-300">
                            <strong>• Topic {i + 1}: {t.title}</strong>
                            {t.description && <p className="text-[11px] text-slate-400 pl-3">{t.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "TOPIC" && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-emerald-400">{generatedDraft?.title || "Topic"}</h4>
                    <p className="text-slate-300">{generatedDraft?.description}</p>
                    {Array.isArray(generatedDraft?.contents) && (
                      <div className="space-y-2 pl-3 border-l border-slate-800">
                        {generatedDraft.contents.map((c, i) => (
                          <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 block">{c.type || "HTML"} Content</span>
                            <strong className="text-slate-200 block">{c.title}</strong>
                            {c.htmlContent && <div className="text-[11px] text-slate-400 mt-1 line-clamp-3" dangerouslySetInnerHTML={{ __html: c.htmlContent }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "CONTENT" && (
                  <div className="space-y-2">
                    {Array.isArray(generatedDraft?.contents) ? (
                      generatedDraft.contents.map((c, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-teal-400">{c.type || "HTML"} Block</span>
                          <h5 className="font-bold text-white">{c.title}</h5>
                          {c.htmlContent && <div className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap bg-slate-950 p-2 rounded border border-slate-800" dangerouslySetInnerHTML={{ __html: c.htmlContent }} />}
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200 whitespace-pre-wrap">
                        {JSON.stringify(generatedDraft, null, 2)}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "QUIZ" && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-purple-400">{generatedDraft?.title || "Quiz"}</h4>
                      <p className="text-slate-300">{generatedDraft?.description}</p>
                    </div>
                    {Array.isArray(generatedDraft?.questions) && (
                      <div className="space-y-2">
                        {generatedDraft.questions.map((q, i) => (
                          <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                            <strong className="text-purple-300 block">Q{i + 1}: {q.question}</strong>
                            {Array.isArray(q.options) && (
                              <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                                {q.options.map((opt, oIdx) => (
                                  <li key={oIdx} className={opt === q.correctAnswer ? "text-emerald-400 font-bold" : ""}>
                                    {opt} {opt === q.correctAnswer && "✓"}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          {step === "INPUT" ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="px-5 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-orange-500/10 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating {selectedScope}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Ask OTree AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Composer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
