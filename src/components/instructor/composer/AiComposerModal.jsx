"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Wand2,
  ChevronRight,
} from "lucide-react";
import { useGenerateAiContent } from "@/hooks/queries/instructor/useGenerateAiContent";

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

  // Extract normalized context directly from Composer
  const {
    courseTitle = "",
    moduleId: initialModuleId,
    moduleTitle: initialModuleTitle = "",
    lessonId: initialLessonId,
    lessonTitle: initialLessonTitle = "",
    topicId: initialTopicId,
    topicTitle: initialTopicTitle = "",
    contentId,
    activeLevel = "COURSE",
    modules = [],
  } = contextData || {};

  // Active Scope, Action & Quiz Level State
  const [selectedScope, setSelectedScope] = useState(initialScope);
  const [selectedAction, setSelectedAction] = useState("CREATE"); // "CREATE" | "IMPROVE" | "EXPAND" | "SIMPLIFY"
  const [quizLevel, setQuizLevel] = useState("COURSE"); // "COURSE" | "MODULE" | "LESSON" | "TOPIC"

  // Cascading Parent Selection States
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // Optional Order Selection State ("AUTO_END" | "AFTER_<itemId>")
  const [selectedOrderValue, setSelectedOrderValue] = useState("AUTO_END");

  // Prompt & Generation State Machine ("INPUT" | "PREVIEW")
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState("INPUT");
  const generateAiMutation = useGenerateAiContent();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  const prevIsOpenRef = useRef(false);

  // Sync initial scope, cascading parent, and order ONCE when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setErrorMsg("");
      setValidationErrors([]);
      setGeneratedDraft(null);
      setStep("INPUT");
      setPrompt("");
      setSelectedAction("CREATE");
      setSelectedOrderValue("AUTO_END");

      const modId = initialModuleId || (modules.length > 0 ? String(modules[0].id || modules[0]._id) : "");
      setSelectedModuleId(modId);

      const targetMod = modules.find((m) => String(m.id || m._id) === String(modId));
      const lesId = initialLessonId || (targetMod?.lessons?.length > 0 ? String(targetMod.lessons[0].id || targetMod.lessons[0]._id) : "");
      setSelectedLessonId(lesId);

      const targetLes = targetMod?.lessons?.find((l) => String(l.id || l._id) === String(lesId));
      const topId = initialTopicId || (targetLes?.topics?.length > 0 ? String(targetLes.topics[0].id || targetLes.topics[0]._id) : "");
      setSelectedTopicId(topId);

      // Map default scope & quiz level based on active location context
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
    prevIsOpenRef.current = isOpen;
  }, [isOpen, activeLevel, initialScope, initialModuleId, initialLessonId, initialTopicId, modules]);

  // Derived Active Module, Lesson, Topic objects from REAL modules array
  const activeModuleObj = useMemo(() => {
    return modules.find((m) => String(m.id || m._id) === String(selectedModuleId)) || null;
  }, [modules, selectedModuleId]);

  const activeLessonObj = useMemo(() => {
    if (!activeModuleObj) return null;
    return (activeModuleObj.lessons || []).find((l) => String(l.id || l._id) === String(selectedLessonId)) || null;
  }, [activeModuleObj, selectedLessonId]);

  const activeTopicObj = useMemo(() => {
    if (!activeLessonObj) return null;
    return (activeLessonObj.topics || []).find((t) => String(t.id || t._id) === String(selectedTopicId)) || null;
  }, [activeLessonObj, selectedTopicId]);

  // Cascading Reset Rules (Requirement 12)
  const handleModuleChange = (newModId) => {
    setSelectedModuleId(newModId);
    const targetMod = modules.find((m) => String(m.id || m._id) === String(newModId));
    const firstLesId = targetMod?.lessons?.length > 0 ? String(targetMod.lessons[0].id || targetMod.lessons[0]._id) : "";
    setSelectedLessonId(firstLesId);

    const targetLes = targetMod?.lessons?.find((l) => String(l.id || l._id) === String(firstLesId));
    const firstTopId = targetLes?.topics?.length > 0 ? String(targetLes.topics[0].id || targetLes.topics[0]._id) : "";
    setSelectedTopicId(firstTopId);
    setSelectedOrderValue("AUTO_END");
  };

  const handleLessonChange = (newLesId) => {
    setSelectedLessonId(newLesId);
    const targetLes = (activeModuleObj?.lessons || []).find((l) => String(l.id || l._id) === String(newLesId));
    const firstTopId = targetLes?.topics?.length > 0 ? String(targetLes.topics[0].id || targetLes.topics[0]._id) : "";
    setSelectedTopicId(firstTopId);
    setSelectedOrderValue("AUTO_END");
  };

  const handleTopicChange = (newTopId) => {
    setSelectedTopicId(newTopId);
    setSelectedOrderValue("AUTO_END");
  };

  const handleScopeChange = (newScope) => {
    setSelectedScope(newScope);
    setSelectedOrderValue("AUTO_END");
  };

  // Derive sibling list for order calculations using REAL course data
  const siblingItems = useMemo(() => {
    if (selectedScope === "MODULE") {
      return modules;
    } else if (selectedScope === "LESSON") {
      return activeModuleObj?.lessons || [];
    } else if (selectedScope === "TOPIC") {
      return activeLessonObj?.topics || [];
    } else if (selectedScope === "CONTENT") {
      return activeTopicObj?.contents || [];
    } else if (selectedScope === "QUIZ") {
      if (quizLevel === "MODULE") return activeModuleObj?.quizzes || [];
      if (quizLevel === "LESSON") return activeLessonObj?.quizzes || [];
      if (quizLevel === "TOPIC") return activeTopicObj?.quizzes || [];
      return contextData?.courseQuizzes || [];
    }
    return [];
  }, [selectedScope, quizLevel, modules, activeModuleObj, activeLessonObj, activeTopicObj, contextData]);

  if (!isOpen) return null;

  // Determine compiled position string for backend API
  const getCompiledPosition = () => {
    if (!selectedOrderValue || selectedOrderValue === "AUTO_END") return "AUTO_END";
    return selectedOrderValue; // "AFTER_<id>"
  };

  // Contextual placeholder for prompt textarea
  const getPromptPlaceholder = () => {
    if (selectedScope === "MODULE") return "Describe the module you want OTree AI to create...";
    if (selectedScope === "LESSON") return "Describe the lesson you want OTree AI to create...";
    if (selectedScope === "TOPIC") return "Describe the topic you want OTree AI to create...";
    if (selectedScope === "CONTENT") return "Describe the content block you want OTree AI to create...";
    if (selectedScope === "QUIZ") return "Describe what you want this quiz to assess...";
    return "Describe what you want OTree AI to generate...";
  };

  const prepareDraftAndNavigate = (canonical) => {
    const metadata = canonical.metadata || {};
    const settings = canonical.settings || {};
    const { modules: mappedModules, quizzes } = withDraftIds(
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
      modules: mappedModules,
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

    const pos = getCompiledPosition();
    const compiledPrompt = `User Instruction: ${prompt.trim()}

Current Selection Context:
Course: ${courseTitle || "Default Course"}
${activeModuleObj ? `Module: ${activeModuleObj.title}` : ""}
${activeLessonObj ? `Lesson: ${activeLessonObj.title}` : ""}
${activeTopicObj ? `Topic: ${activeTopicObj.title}` : ""}
Scope: ${selectedScope}
Action: ${selectedAction}
Position: ${pos}
${selectedScope === "QUIZ" ? `Quiz Level: ${quizLevel}` : ""}`;

    try {
      const result = await generateAiMutation.mutateAsync({
        scope: selectedScope,
        action: selectedAction,
        prompt: compiledPrompt,
        context: {
          scope: selectedScope,
          action: selectedAction,
          level: quizLevel,
          position: pos,
          courseId: contextData?.courseId,
          courseTitle,
          moduleId: activeModuleObj?.id || activeModuleObj?._id || initialModuleId,
          moduleTitle: activeModuleObj?.title || initialModuleTitle,
          lessonId: activeLessonObj?.id || activeLessonObj?._id || initialLessonId,
          lessonTitle: activeLessonObj?.title || initialLessonTitle,
          topicId: activeTopicObj?.id || activeTopicObj?._id || initialTopicId,
          topicTitle: activeTopicObj?.title || initialTopicTitle,
          contentId: contextData?.contentId,
        },
      });

      if (!result?.success) {
        const msg = result?.message || "AI generation failed.";
        const errors = result?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      const resultData = result.data;
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
      onApply(generatedDraft, selectedScope, {
        ...contextData,
        moduleId: activeModuleObj?.id || activeModuleObj?._id || initialModuleId,
        moduleTitle: activeModuleObj?.title || initialModuleTitle,
        lessonId: activeLessonObj?.id || activeLessonObj?._id || initialLessonId,
        lessonTitle: activeLessonObj?.title || initialLessonTitle,
        topicId: activeTopicObj?.id || activeTopicObj?._id || initialTopicId,
        topicTitle: activeTopicObj?.title || initialTopicTitle,
        quizLevel,
        action: selectedAction,
        position: getCompiledPosition(),
      });
      onClose();
      return;
    }

    const canonical = generatedDraft.canonicalJson || generatedDraft;
    prepareDraftAndNavigate(canonical);
    onClose();
  };

  // Helper for scope labels
  const scopeItemLabel = selectedScope === "CONTENT" ? "blocks" : selectedScope === "MODULE" ? "modules" : selectedScope === "LESSON" ? "lessons" : selectedScope === "TOPIC" ? "topics" : "quizzes";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Compact Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-400/20 border border-orange-500/30 text-orange-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white leading-none flex items-center gap-2">
                <span>Ask OTree AI</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-amber-400 rounded border border-slate-700">
                  Gemini 3.6
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate mt-1 font-medium">
                {courseTitle || "Course Composer"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-4 text-rose-400/90">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === "INPUT" ? (
            <>
              {/* STEP 1: What are you creating? */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  What are you creating?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleScopeChange("MODULE")}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                      selectedScope === "MODULE"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>Module</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScopeChange("LESSON")}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                      selectedScope === "LESSON"
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScopeChange("TOPIC")}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                      selectedScope === "TOPIC"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <FilePlus className="w-3.5 h-3.5 shrink-0" />
                    <span>Topic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScopeChange("CONTENT")}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                      selectedScope === "CONTENT"
                        ? "bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Content</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScopeChange("QUIZ")}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                      selectedScope === "QUIZ"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Quiz</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Quiz Level Selection (Only if Quiz selected) */}
              {selectedScope === "QUIZ" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    What kind of quiz?
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["COURSE", "MODULE", "LESSON", "TOPIC"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setQuizLevel(lvl);
                          setSelectedOrderValue("AUTO_END");
                        }}
                        className={`h-9 text-xs font-bold rounded-lg transition border cursor-pointer ${
                          quizLevel === lvl
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {lvl === "COURSE" ? "Course" : lvl === "MODULE" ? "Module" : lvl === "LESSON" ? "Lesson" : "Topic"} Quiz
                      </button>
                    ))}
                  </div>

                  {quizLevel === "COURSE" && (
                    <p className="text-[11px] font-medium text-purple-400 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                      ℹ️ Course Quiz assess the entire course material.
                    </p>
                  )}
                </div>
              )}

              {/* STEP 3: Target Location Hierarchy Selectors */}
              {/* LESSON: Module dropdown 100% width */}
              {selectedScope === "LESSON" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Target location
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-amber-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                  >
                    {modules.length > 0 ? (
                      modules.map((m) => (
                        <option key={m.id || m._id} value={m.id || m._id}>
                          Module: {m.title || "Untitled Module"}
                        </option>
                      ))
                    ) : (
                      <option value="">No modules exist yet</option>
                    )}
                  </select>
                </div>
              )}

              {/* TOPIC & LESSON QUIZ: 2-column Grid (Module | Lesson) */}
              {((selectedScope === "TOPIC") || (selectedScope === "QUIZ" && quizLevel === "LESSON")) && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Target location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <select
                        value={selectedModuleId}
                        onChange={(e) => handleModuleChange(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-amber-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                      >
                        {modules.length > 0 ? (
                          modules.map((m) => (
                            <option key={m.id || m._id} value={m.id || m._id}>
                              Module: {m.title || "Untitled Module"}
                            </option>
                          ))
                        ) : (
                          <option value="">No modules exist yet</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedLessonId}
                        onChange={(e) => handleLessonChange(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-orange-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                      >
                        {(activeModuleObj?.lessons || []).length > 0 ? (
                          (activeModuleObj?.lessons || []).map((l) => (
                            <option key={l.id || l._id} value={l.id || l._id}>
                              Lesson: {l.title || "Untitled Lesson"}
                            </option>
                          ))
                        ) : (
                          <option value="">No lessons in this module</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT & TOPIC QUIZ: Top Row (Module | Lesson 2-col) + Bottom Row (Topic 100%) */}
              {((selectedScope === "CONTENT") || (selectedScope === "QUIZ" && quizLevel === "TOPIC")) && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Target location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <select
                        value={selectedModuleId}
                        onChange={(e) => handleModuleChange(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-amber-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                      >
                        {modules.length > 0 ? (
                          modules.map((m) => (
                            <option key={m.id || m._id} value={m.id || m._id}>
                              Module: {m.title || "Untitled Module"}
                            </option>
                          ))
                        ) : (
                          <option value="">No modules exist yet</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedLessonId}
                        onChange={(e) => handleLessonChange(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-orange-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                      >
                        {(activeModuleObj?.lessons || []).length > 0 ? (
                          (activeModuleObj?.lessons || []).map((l) => (
                            <option key={l.id || l._id} value={l.id || l._id}>
                              Lesson: {l.title || "Untitled Lesson"}
                            </option>
                          ))
                        ) : (
                          <option value="">No lessons in this module</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => handleTopicChange(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-emerald-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                    >
                      {(activeLessonObj?.topics || []).length > 0 ? (
                        (activeLessonObj?.topics || []).map((t) => (
                          <option key={t.id || t._id} value={t.id || t._id}>
                            Topic: {t.title || "Untitled Topic"}
                          </option>
                        ))
                      ) : (
                        <option value="">No topics in this lesson</option>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* MODULE QUIZ: Module dropdown 100% width */}
              {selectedScope === "QUIZ" && quizLevel === "MODULE" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">
                    Target location
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-amber-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                  >
                    {modules.length > 0 ? (
                      modules.map((m) => (
                        <option key={m.id || m._id} value={m.id || m._id}>
                          Module: {m.title || "Untitled Module"}
                        </option>
                      ))
                    ) : (
                      <option value="">No modules exist yet</option>
                    )}
                  </select>
                </div>
              )}

              {/* STEP 4: Optional Order Dropdown Control (Requirement 1-5, 18, 19) */}
              {["MODULE", "LESSON", "TOPIC", "CONTENT", "QUIZ"].includes(selectedScope) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                    <span>
                      Order <span className="text-slate-500 font-normal">(optional)</span>
                    </span>
                  </label>
                  <select
                    value={selectedOrderValue}
                    onChange={(e) => setSelectedOrderValue(e.target.value)}
                    className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-orange-300 font-bold outline-none focus:border-orange-500/50 cursor-pointer truncate"
                  >
                    <option value="AUTO_END">Auto / End</option>
                    {siblingItems.map((item, i) => (
                      <option key={item.id || item._id} value={`AFTER_${item.id || item._id}`}>
                        After {i + 1} — {item.title || `Item ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* STEP 5: Contextual Prompt Area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Describe what you want OTree AI to generate
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  placeholder={getPromptPlaceholder()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 font-sans resize-none min-h-[85px]"
                />
              </div>
            </>
          ) : (
            /* PREVIEW STEP (Requirement 24: Shows Destination & Re-order Result) */
            <div className="space-y-3">
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

              {/* Destination Path & Order Preview */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-orange-400 block tracking-wider">
                  📍 Destination Location
                </span>
                <div className="text-slate-300 flex flex-wrap items-center gap-1 font-medium">
                  <span className="truncate">{courseTitle}</span>
                  {activeModuleObj && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-amber-400 truncate">{activeModuleObj.title}</span>
                    </>
                  )}
                  {activeLessonObj && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-orange-400 truncate">{activeLessonObj.title}</span>
                    </>
                  )}
                  {activeTopicObj && (
                    <>
                      <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-emerald-400 truncate">{activeTopicObj.title}</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-900">
                  Order:{" "}
                  <span className="text-white">
                    {selectedOrderValue === "AUTO_END"
                      ? `Auto / End (End of ${scopeItemLabel})`
                      : (() => {
                          const afterId = selectedOrderValue.replace("AFTER_", "");
                          const idx = siblingItems.findIndex((it) => String(it.id || it._id) === String(afterId));
                          const item = siblingItems[idx];
                          return `After ${idx + 1} — ${item?.title || "Item"}`;
                        })()}
                  </span>
                </div>
              </div>

              {/* Render generated content preview */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-[40vh] overflow-y-auto space-y-3 font-sans text-xs">
                {selectedScope === "MODULE" && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">Module: {generatedDraft?.title || "AI Module"}</h4>
                      <p className="text-slate-300 text-xs mt-0.5">{generatedDraft?.description}</p>
                    </div>

                    {Array.isArray(generatedDraft?.quizzes) && generatedDraft.quizzes.length > 0 && (
                      <div className="p-2 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-200 text-xs">
                        <strong>🏆 Module Quiz:</strong> {generatedDraft.quizzes.map((q) => q.title).join(", ")}
                      </div>
                    )}

                    {Array.isArray(generatedDraft?.lessons) && (
                      <div className="space-y-2 pl-3 border-l-2 border-slate-800">
                        {generatedDraft.lessons.map((l, i) => (
                          <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                            <div className="font-bold text-orange-300">
                              Lesson {i + 1}: {l.title}
                            </div>
                            {l.description && <p className="text-[11px] text-slate-400">{l.description}</p>}
                            {Array.isArray(l.topics) && l.topics.length > 0 && (
                              <div className="pl-3 border-l border-slate-700 space-y-1 mt-1 text-[11px]">
                                {l.topics.map((t, tIdx) => (
                                  <div key={tIdx} className="text-slate-300">
                                    <span className="text-emerald-400 font-semibold">• Topic {tIdx + 1}: {t.title}</span>
                                    {Array.isArray(t.contents) && (
                                      <span className="text-slate-500 text-[10px] ml-2">({t.contents.length} content blocks)</span>
                                    )}
                                    {t.quiz && (
                                      <span className="text-purple-400 text-[10px] ml-2">[Quiz]</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "LESSON" && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-orange-400">Lesson: {generatedDraft?.title || "AI Lesson"}</h4>
                      <p className="text-slate-300 text-xs mt-0.5">{generatedDraft?.description}</p>
                    </div>

                    {Array.isArray(generatedDraft?.topics) && (
                      <div className="space-y-2 pl-3 border-l-2 border-slate-800">
                        {generatedDraft.topics.map((t, i) => (
                          <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                            <strong className="text-emerald-300 block">• Topic {i + 1}: {t.title}</strong>
                            {t.description && <p className="text-[11px] text-slate-400">{t.description}</p>}
                            {Array.isArray(t.contents) && t.contents.length > 0 && (
                              <div className="text-[11px] text-slate-400 pl-2 border-l border-slate-700 mt-1 space-y-0.5">
                                {t.contents.map((c, cIdx) => (
                                  <div key={cIdx} className="truncate">
                                    <span className="text-teal-400 font-bold uppercase text-[9px] mr-1">[{c.type || "HTML"}]</span>
                                    {c.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedScope === "TOPIC" && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">Topic: {generatedDraft?.title || "AI Topic"}</h4>
                      <p className="text-slate-300 text-xs mt-0.5">{generatedDraft?.description}</p>
                    </div>

                    {generatedDraft?.quiz && (
                      <div className="p-2 bg-purple-950/40 border border-purple-500/30 rounded-lg text-purple-200 text-xs">
                        <strong>🏆 Topic Quiz:</strong> {generatedDraft.quiz.title} ({generatedDraft.quiz.questions?.length || 0} questions)
                      </div>
                    )}

                    {Array.isArray(generatedDraft?.contents) && (
                      <div className="space-y-2 pl-3 border-l-2 border-slate-800">
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
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end space-x-3">
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
                  <span>Generating {selectedScope.toLowerCase()}...</span>
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
