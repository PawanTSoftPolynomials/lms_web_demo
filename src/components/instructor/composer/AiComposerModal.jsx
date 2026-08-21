"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Bot, X, Wand2, AlertCircle, RefreshCw, Layers, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";

/**
 * Assigns client-side temporary IDs to canonical JSON entities for Course Composer draft state.
 */
function withDraftIds(modules = [], courseQuizzes = []) {
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
}

const DEMO_JAVA_PROMPT = `Create a beginner Java course with 1 module.

Create 1 lesson explaining Java, JVM, JDK and JRE.
Include one simple Java code example.

Add one 3-question MCQ quiz to the module.`;

export default function AiComposerModal({ isOpen, onClose }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  if (!isOpen) return null;

  const prepareDraftAndNavigate = (targetJob) => {
    const canonical = targetJob.canonicalJson || {};
    const metadata = canonical.metadata || {};
    const settings = canonical.settings || {};
    const { modules, quizzes } = withDraftIds(
      Array.isArray(canonical.modules) ? canonical.modules : [],
      Array.isArray(canonical.quizzes) ? canonical.quizzes : []
    );
    const assetMap = canonical.assetMap || {};

    const draftPayload = {
      jobId: targetJob.id,
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
      canonicalJson: canonical
    };

    sessionStorage.setItem("imported_course_draft", JSON.stringify(draftPayload));
    router.push("/instructor/courses/draft");
  };

  const handleGenerate = async () => {
    if (!prompt || !prompt.trim()) {
      setErrorMsg("Please enter instructions for the AI course generator.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setValidationErrors([]);

    try {
      const response = await api.post(
        "/course-import/json",
        {
          prompt: prompt.trim(),
          scope: "COURSE",
          context: {}
        },
        {
          timeout: 180000 // 3 minutes timeout for LLM generation
        }
      );

      if (!response.data?.success) {
        const msg = response.data?.message || "AI course generation failed.";
        const errors = response.data?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      const createdJob = response.data.data;
      if (createdJob?.status === "FAILED") {
        const msg = createdJob.errorMessage || "Generated course structure validation failed.";
        const errors = createdJob.validationReport?.errors || [msg];
        setErrorMsg(msg);
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      if (createdJob?.canonicalJson) {
        onClose();
        prepareDraftAndNavigate(createdJob);
      } else {
        throw new Error("No canonical course data returned from AI service.");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      const msg = err?.response?.data?.message || err?.message || "AI course generation failed. Please try again.";
      const errors = err?.response?.data?.errors || [msg];
      setErrorMsg(msg);
      setValidationErrors(errors);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-400/20 border border-orange-500/30 text-orange-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">AI Course Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-slate-800 border border-slate-700 text-amber-400 rounded-full flex items-center space-x-1">
                  <Bot className="w-3 h-3" />
                  <span>Qwen3B</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter natural language instructions to compose a course draft
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                What course would you like to create?
              </label>
              <button
                type="button"
                onClick={() => setPrompt(DEMO_JAVA_PROMPT)}
                disabled={loading}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1 transition"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Load Demo Prompt</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="e.g. Create a beginner Java Programming course with 2 modules. Module 1: Java Fundamentals (2 lessons). Module 2: OOP (2 lessons). Include code examples and one quiz per module."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition font-mono resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 font-medium text-slate-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>How AI Draft Composition Works</span>
            </div>
            <p>
              Qwen3B generates a validated course draft adhering to LMS hierarchy rules.
              The draft will load inside the Course Composer where you can inspect, edit, or add modules before saving to database.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-5 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Course (Qwen3B)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Course Draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
