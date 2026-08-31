"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
  PanelLeftOpen,
} from "lucide-react";

import Loader from "@/components/common/Loader";
import { useInstructorCourse } from "@/hooks/queries/instructor/useInstructorCourse";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useUpdateCourse } from "@/hooks/queries/instructor/useUpdateCourse";
import { useUpdateLesson } from "@/hooks/queries/instructor/useUpdateLesson";
import { useDeleteModule } from "@/hooks/queries/instructor/useDeleteModule";
import { useDeleteCourse } from "@/hooks/queries/instructor/useDeleteCourse";
import { usePublishCourse } from "@/hooks/queries/instructor/usePublishCourse";
import { useUnpublishCourse } from "@/hooks/queries/instructor/useUnpublishCourse";
import { useArchiveCourse } from "@/hooks/queries/instructor/useArchiveCourse";
import { useRestoreCourse } from "@/hooks/queries/instructor/useRestoreCourse";
import { useDeleteLesson } from "@/hooks/queries/instructor/useDeleteLesson";
import { useDeleteTopic } from "@/hooks/queries/instructor/useDeleteTopic";
import { useDeleteContent } from "@/hooks/queries/instructor/useDeleteContent";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useConceptMastery } from "@/hooks/queries/instructor/useInstructorDashboard";
import { useToast } from "@/components/ui/ToastProvider";
import { LessonComposerPanel } from "@/components/instructor/LessonComposer/LessonComposerPanel";
import { validateCoursePublish, duplicateCourse } from "@/services/course.service";
import { createQuiz as createQuizService, updateQuiz as updateQuizService, deleteQuiz as deleteQuizService } from "@/services/quiz.service";
import {
  bulkCreateQuestions as bulkCreateQuestionsService,
  updateRepositoryQuestion,
  removeQuestionFromQuiz as removeQuestionFromQuizService,
  importQuestionsToQuiz as importQuestionsToQuizService,
} from "@/services/questionRepository.service";

import { CourseComposerHeader } from "@/components/instructor/courses/CourseComposerHeader";
import { CourseComposerSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { CourseOverviewView } from "@/components/instructor/courses/CourseOverviewView";
import { ModuleOverviewView } from "@/components/instructor/courses/ModuleOverviewView";
import { LessonOverviewView } from "@/components/instructor/courses/LessonOverviewView";
import { QuizOverviewView } from "@/components/instructor/courses/QuizOverviewView";
import { EntityFormModal } from "@/components/instructor/courses/EntityFormModal";
import { PublishValidationModal } from "@/components/instructor/courses/PublishValidationModal";
import { UnpublishModal } from "@/components/instructor/courses/UnpublishModal";
import { DeleteCourseModal } from "@/components/instructor/courses/DeleteCourseModal";
import AiComposerModal from "@/components/instructor/composer/AiComposerModal";

/** Finds a lesson and its parent module by lessonId across all modules */
function findModuleAndLessonById(modules, lessonId) {
  if (!modules || !lessonId) return { module: null, lesson: null };
  for (const mod of modules) {
    const found = (mod.lessons || []).find((l) => String(l.id || l._id) === String(lessonId));
    if (found) return { module: mod, lesson: found };
  }
  return { module: null, lesson: null };
}

function findHierarchyByTopicId(modules, topicId) {
  if (!modules || !topicId) return { module: null, lesson: null, topic: null };
  for (const mod of modules) {
    for (const les of mod.lessons || []) {
      const foundTopic = (les.topics || []).find((t) => String(t.id || t._id) === String(topicId));
      if (foundTopic) {
        return { module: mod, lesson: les, topic: foundTopic };
      }
    }
  }
  return { module: null, lesson: null, topic: null };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId;
  const { showToast } = useToast();

  // React Query Hooks
  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useInstructorCourse(courseId);

  const {
    data: modules = [],
    isLoading: modulesLoading,
  } = useModules(courseId);

  const deleteModuleMutation = useDeleteModule();
  const deleteCourseMutation = useDeleteCourse();
  const publishCourseMutation = usePublishCourse();
  const unpublishCourseMutation = useUnpublishCourse();
  const archiveCourseMutation = useArchiveCourse();
  const restoreCourseMutation = useRestoreCourse();
  const deleteLessonMutation = useDeleteLesson();
  const deleteTopicMutation = useDeleteTopic();
  const deleteContentMutation = useDeleteContent();
  const updateCourseMutation = useUpdateCourse();
  const updateLessonMutation = useUpdateLesson();
  const queryClient = useQueryClient();

  const { data: conceptMasteryData = [] } = useConceptMastery(courseId);

  // Global View Mode: 'rendered' | 'edit'
  const [globalMode, setGlobalMode] = useState("rendered");

  // Active Workspace Selection: 'course' | 'lesson' | 'module' | 'topic' | 'quiz'
  const [composerMode, setComposerMode] = useState("course");
  const [quizMode, setQuizMode] = useState("view"); // "view" | "edit" | "create"
  const [composeLessonId, setComposeLessonId] = useState(searchParams.get("compose") || null);
  const [composeModuleId, setComposeModuleId] = useState(null);
  const [composeTopicId, setComposeTopicId] = useState(null);
  const [composeQuizId, setComposeQuizId] = useState(null);
  const [selectedQuizState, setSelectedQuizState] = useState(null);
  const [quizStartEditing, setQuizStartEditing] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState(null);

  // Edit Mode for Metadata Headers
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);

  // Editable Form States
  const [courseForm, setCourseForm] = useState({});
  const [lessonForm, setLessonForm] = useState({});

  // Module/Lesson/Topic modal
  const [entityModalState, setEntityModalState] = useState(null);
  const openEntityModal = (config) => setEntityModalState(config);
  const closeEntityModal = () => setEntityModalState(null);

  // Ask OTree AI State & Handlers
  const [askAiModalOpen, setAskAiModalOpen] = useState(false);
  const [askAiScope, setAskAiScope] = useState("COURSE");
  const [askAiContext, setAskAiContext] = useState({});

  const handleOpenAskAi = (overrideScope = null) => {
    const currentCourse = effectiveCourse;

    const currentModule = composeModuleId
      ? effectiveModules.find((m) => String(m.id || m._id) === String(composeModuleId))
      : null;

    let currentLesson = null;
    if (currentModule && composeLessonId) {
      currentLesson = (currentModule.lessons || []).find((l) => String(l.id || l._id) === String(composeLessonId));
    } else if (composeLessonId) {
      for (const mod of effectiveModules) {
        const found = (mod.lessons || []).find((l) => String(l.id || l._id) === String(composeLessonId));
        if (found) {
          currentLesson = found;
          break;
        }
      }
    }

    let currentTopic = null;
    if (currentLesson && composeTopicId) {
      currentTopic = (currentLesson.topics || []).find((t) => String(t.id || t._id) === String(composeTopicId));
    } else if (composeTopicId) {
      for (const mod of effectiveModules) {
        for (const les of mod.lessons || []) {
          const found = (les.topics || []).find((t) => String(t.id || t._id) === String(composeTopicId));
          if (found) {
            currentTopic = found;
            break;
          }
        }
        if (currentTopic) break;
      }
    }

    let currentContent = null;
    if (currentTopic && selectedCellId) {
      currentContent = (currentTopic.contents || []).find((c) => String(c.id || c._id) === String(selectedCellId));
    }

    const activeLevel = currentContent
      ? "CONTENT"
      : currentTopic
      ? "TOPIC"
      : currentLesson
      ? "LESSON"
      : currentModule
      ? "MODULE"
      : "COURSE";

    const ctx = {
      courseId,
      courseTitle: currentCourse?.title || "",
      moduleId: currentModule?.id || currentModule?._id || null,
      moduleTitle: currentModule?.title || "",
      lessonId: currentLesson?.id || currentLesson?._id || null,
      lessonTitle: currentLesson?.title || "",
      topicId: currentTopic?.id || currentTopic?._id || null,
      topicTitle: currentTopic?.title || "",
      contentId: currentContent?.id || currentContent?._id || null,
      activeLevel,
      modules: effectiveModules || [],
      courseQuizzes: effectiveCourse?.quizzes || [],
    };

    const initialScope =
      overrideScope ||
      (activeLevel === "CONTENT"
        ? "CONTENT"
        : activeLevel === "TOPIC"
        ? "TOPIC"
        : activeLevel === "LESSON"
        ? "TOPIC"
        : activeLevel === "MODULE"
        ? "LESSON"
        : "MODULE");

    setAskAiScope(initialScope);
    setAskAiContext(ctx);
    setAskAiModalOpen(true);
  };

  const handleApplyAiGeneratedData = async (generatedData, scope, contextData) => {
    try {
      const pos = contextData?.position || "END";

      const insertByPos = (arr = [], newItem) => {
        let resArr = [];
        if (!pos || pos === "END" || pos === "AUTO_END") {
          resArr = [...arr, newItem];
        } else if (pos === "BEGINNING") {
          resArr = [newItem, ...arr];
        } else if (pos.startsWith("AFTER_")) {
          const afterId = pos.replace("AFTER_", "");
          const idx = arr.findIndex((item) => String(item.id || item._id) === String(afterId));
          if (idx !== -1) {
            resArr = [...arr];
            resArr.splice(idx + 1, 0, newItem);
          } else {
            resArr = [...arr, newItem];
          }
        } else {
          resArr = [...arr, newItem];
        }
        return resArr.map((item, i) => ({ ...item, order: i + 1 }));
      };

      if (!isDraftMode) {
        // Transactional Backend Application (Requirement: Atomicity & Single Operation)
        await api.post("/api/ai/apply", {
          scope,
          generatedData,
          context: {
            courseId,
            moduleId: contextData.moduleId || composeModuleId,
            lessonId: contextData.lessonId || composeLessonId,
            topicId: contextData.topicId || composeTopicId,
            position: pos,
            quizLevel: contextData.quizLevel || "COURSE",
          },
        });

        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, courseId] });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODULES] });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
        if (contextData.topicId || composeTopicId) {
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTENTS, contextData.topicId || composeTopicId] });
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOPIC, contextData.topicId || composeTopicId] });
        }
        showToast(`${scope} created from AI!`, "success");
        return;
      }

      if (scope === "MODULE") {
        const newModId = `draft-mod-${Date.now()}`;
        const title = generatedData.title || "AI Generated Module";
        const description = generatedData.description || "";

        const newMod = {
          id: newModId,
          title,
          description,
          order: 1,
          quizzes: (generatedData.quizzes || []).map((qz, qIdx) => ({
            id: `draft-qz-${newModId}-${qIdx + 1}`,
            title: qz.title || `Module Quiz ${qIdx + 1}`,
            description: qz.description || "",
            questions: (qz.questions || []).map((q, qIdx2) => ({
              id: `draft-quest-${newModId}-${qIdx + 1}-${qIdx2 + 1}`,
              question: q.question || `Question ${qIdx2 + 1}`,
              questionType: q.questionType || "MCQ_SINGLE",
              options: q.options || [],
              correctAnswer: q.correctAnswer || "",
            })),
          })),
          lessons: (generatedData.lessons || []).map((l, lIdx) => ({
            id: `draft-les-${newModId}-${lIdx + 1}`,
            title: l.title || `Lesson ${lIdx + 1}`,
            description: l.description || "",
            order: lIdx + 1,
            quizzes: (l.quizzes || []).map((qz, qIdx) => ({
              id: `draft-qz-${newModId}-${lIdx + 1}-${qIdx + 1}`,
              title: qz.title || `Lesson Quiz ${qIdx + 1}`,
              description: qz.description || "",
              questions: (qz.questions || []).map((q, qIdx2) => ({
                id: `draft-quest-${newModId}-${lIdx + 1}-${qIdx + 1}-${qIdx2 + 1}`,
                question: q.question || `Question ${qIdx2 + 1}`,
                questionType: q.questionType || "MCQ_SINGLE",
                options: q.options || [],
                correctAnswer: q.correctAnswer || "",
              })),
            })),
            topics: (l.topics || []).map((t, tIdx) => ({
              id: `draft-top-${newModId}-${lIdx + 1}-${tIdx + 1}`,
              title: t.title || `Topic ${tIdx + 1}`,
              description: t.description || "",
              order: tIdx + 1,
              quiz: t.quiz ? {
                id: `draft-qz-${newModId}-${lIdx + 1}-${tIdx + 1}`,
                title: t.quiz.title || "Topic Quiz",
                questions: (t.quiz.questions || []).map((q, qIdx2) => ({
                  id: `draft-quest-${newModId}-${lIdx + 1}-${tIdx + 1}-${qIdx2 + 1}`,
                  question: q.question || `Question ${qIdx2 + 1}`,
                  questionType: q.questionType || "MCQ_SINGLE",
                  options: q.options || [],
                  correctAnswer: q.correctAnswer || "",
                })),
              } : null,
              contents: (t.contents || []).map((c, cIdx) => ({
                id: `draft-cnt-${newModId}-${lIdx + 1}-${tIdx + 1}-${cIdx + 1}`,
                type: c.type || "HTML",
                title: c.title || "Content Block",
                htmlContent: c.htmlContent || c.code || c.body || c.content || "",
                order: cIdx + 1,
              })),
            })),
          })),
        };
        const nextMods = insertByPos(draftModules, newMod);
        setDraftModules(nextMods);
        handleSelectModule(newMod);
        showToast("Module created from AI!", "success");
      } else if (scope === "LESSON") {
        const targetModuleId = contextData.moduleId || composeModuleId || effectiveModules[0]?.id;
        const title = generatedData.title || "AI Generated Lesson";
        const description = generatedData.description || "";

        let createdLessonObj = null;
        const nextMods = draftModules.map((m) => {
          if (String(m.id || m._id) === String(targetModuleId)) {
            const lesOrder = ((m.lessons || []).length > 0 ? Math.max(...m.lessons.map((l) => l.order || 0)) : 0) + 1;
            createdLessonObj = {
              id: `draft-les-${Date.now()}`,
              title,
              description,
              order: lesOrder,
              quizzes: (generatedData.quizzes || []).map((qz, qIdx) => ({
                id: `draft-qz-${Date.now()}-${qIdx + 1}`,
                title: qz.title || `Lesson Quiz ${qIdx + 1}`,
                description: qz.description || "",
                questions: (qz.questions || []).map((q, qIdx2) => ({
                  id: `draft-quest-${Date.now()}-${qIdx + 1}-${qIdx2 + 1}`,
                  question: q.question || `Question ${qIdx2 + 1}`,
                  questionType: q.questionType || "MCQ_SINGLE",
                  options: q.options || [],
                  correctAnswer: q.correctAnswer || "",
                })),
              })),
              topics: (generatedData.topics || []).map((t, tIdx) => ({
                id: `draft-top-${Date.now()}-${tIdx + 1}`,
                title: t.title || `Topic ${tIdx + 1}`,
                description: t.description || "",
                order: tIdx + 1,
                quiz: t.quiz ? {
                  id: `draft-qz-${Date.now()}-${tIdx + 1}`,
                  title: t.quiz.title || "Topic Quiz",
                  questions: (t.quiz.questions || []).map((q, qIdx2) => ({
                    id: `draft-quest-${Date.now()}-${tIdx + 1}-${qIdx2 + 1}`,
                    question: q.question || `Question ${qIdx2 + 1}`,
                    questionType: q.questionType || "MCQ_SINGLE",
                    options: q.options || [],
                    correctAnswer: q.correctAnswer || "",
                  })),
                } : null,
                contents: (t.contents || []).map((c, cIdx) => ({
                  id: `draft-cnt-${Date.now()}-${tIdx + 1}-${cIdx + 1}`,
                  type: c.type || "HTML",
                  title: c.title || "Content Block",
                  htmlContent: c.htmlContent || c.code || c.body || c.content || "",
                  order: cIdx + 1,
                })),
              })),
            };
            return { ...m, lessons: insertByPos(m.lessons || [], createdLessonObj) };
          }
          return m;
        });
        setDraftModules(nextMods);
        if (createdLessonObj) {
          handleSelectLesson(createdLessonObj.id, targetModuleId);
        }
        showToast("Lesson created from AI!", "success");
      } else if (scope === "TOPIC") {
        const targetLessonId = contextData.lessonId || composeLessonId;
        const targetModuleId = contextData.moduleId || composeModuleId;
        const title = generatedData.title || "AI Generated Topic";
        const description = generatedData.description || "";

        let createdTopicObj = null;
        const nextMods = draftModules.map((m) => ({
          ...m,
          lessons: (m.lessons || []).map((l) => {
            if (String(l.id || l._id) === String(targetLessonId)) {
              const topOrder = ((l.topics || []).length > 0 ? Math.max(...l.topics.map((t) => t.order || 0)) : 0) + 1;
              createdTopicObj = {
                id: `draft-top-${Date.now()}`,
                title,
                description,
                order: topOrder,
                quiz: generatedData.quiz ? {
                  id: `draft-qz-${Date.now()}`,
                  title: generatedData.quiz.title || "Topic Quiz",
                  questions: (generatedData.quiz.questions || []).map((q, qIdx2) => ({
                    id: `draft-quest-${Date.now()}-${qIdx2 + 1}`,
                    question: q.question || `Question ${qIdx2 + 1}`,
                    questionType: q.questionType || "MCQ_SINGLE",
                    options: q.options || [],
                    correctAnswer: q.correctAnswer || "",
                  })),
                } : null,
                contents: (generatedData.contents || []).map((c, cIdx) => ({
                  id: `draft-cnt-${Date.now()}-${cIdx + 1}`,
                  type: c.type || "HTML",
                  title: c.title || "Content Block",
                  htmlContent: c.htmlContent || c.code || c.body || c.content || "",
                  order: cIdx + 1,
                })),
              };
              return { ...l, topics: insertByPos(l.topics || [], createdTopicObj) };
            }
            return l;
          }),
        }));
        setDraftModules(nextMods);
        if (createdTopicObj) {
          handleSelectTopic(createdTopicObj.id, targetLessonId, targetModuleId);
        }
        showToast("Topic created from AI!", "success");
      } else if (scope === "CONTENT") {
        const targetTopicId = contextData.topicId || composeTopicId;
        if (!targetTopicId) {
          showToast("Please select a target topic before adding content.", "error");
          return;
        }

        const newContents = Array.isArray(generatedData?.contents)
          ? generatedData.contents
          : Array.isArray(generatedData)
          ? generatedData
          : [generatedData];

        const nextMods = draftModules.map((m) => ({
          ...m,
          lessons: (m.lessons || []).map((l) => ({
            ...l,
            topics: (l.topics || []).map((t) => {
              if (String(t.id || t._id) === String(targetTopicId)) {
                let cntOrder = ((t.contents || []).length > 0 ? Math.max(...t.contents.map((c) => c.order || 0)) : 0);
                const mappedNewContents = newContents.map((c) => {
                  cntOrder += 1;
                  let type = (c.type || "HTML").toUpperCase();
                  if (type === "TEXT_BLOCK" || type === "MARKDOWN") type = "HTML";
                  if (type === "CODE_BLOCK" || type === "SNIPPET") type = "CODE";

                  return {
                    id: `draft-cnt-${Date.now()}-${cntOrder}`,
                    type,
                    title: c.title || "Content Block",
                    htmlContent: c.htmlContent || c.code || c.body || c.content || "",
                    order: cntOrder,
                  };
                });
                let nextContents = t.contents || [];
                for (const newC of mappedNewContents) {
                  nextContents = insertByPos(nextContents, newC);
                }
                return { ...t, contents: nextContents };
              }
              return t;
            }),
          })),
        }));
        setDraftModules(nextMods);
        showToast("Content added from AI!", "success");
      } else if (scope === "QUIZ") {
        const targetLevel = contextData.quizLevel || "COURSE";
        const quizTitle = generatedData.title || `${targetLevel} Quiz`;
        const quizDesc = generatedData.description || "";
        const rawQuestions = Array.isArray(generatedData.questions) ? generatedData.questions : [];

        const formattedQuestions = rawQuestions.map((q, idx) => ({
          question: q.question || `Question ${idx + 1}`,
          questionType: q.questionType || "MCQ_SINGLE",
          options: Array.isArray(q.options) ? q.options : ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : "Option 1"),
          explanation: q.explanation || "",
        }));

        const newQuizData = {
          title: quizTitle,
          description: quizDesc,
          passingScore: Number(generatedData.passingScore) || 70,
          timeLimit: Number(generatedData.timeLimit) || 15,
          isPublished: true,
          questions: formattedQuestions,
        };

        if (targetLevel === "MODULE") {
          setComposeModuleId(contextData.moduleId || composeModuleId);
          setComposeLessonId(null);
          setComposeTopicId(null);
        } else if (targetLevel === "LESSON") {
          setComposeModuleId(contextData.moduleId || composeModuleId);
          setComposeLessonId(contextData.lessonId || composeLessonId);
          setComposeTopicId(null);
        } else if (targetLevel === "TOPIC") {
          setComposeModuleId(contextData.moduleId || composeModuleId);
          setComposeLessonId(contextData.lessonId || composeLessonId);
          setComposeTopicId(contextData.topicId || composeTopicId);
        } else {
          setComposeModuleId(null);
          setComposeLessonId(null);
          setComposeTopicId(null);
        }

        await handleSaveQuiz(newQuizData);
        showToast(`${targetLevel} quiz created from AI!`, "success");
      }
    } catch (err) {
      console.error("Apply AI Data Error:", err);
      showToast("Failed to apply AI generated content.", "error");
    }
  };

  // Lifecycle Modal States
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishValidation, setPublishValidation] = useState(null);
  const [isValidatingPublish, setIsValidatingPublish] = useState(false);

  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteHasStudentData, setDeleteHasStudentData] = useState(false);

  // Auto-open signal for Add Content picker
  const [autoOpenAddSignal, setAutoOpenAddSignal] = useState(0);

  // Mobile Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Desktop Course Map collapse state
  const [isCourseMapOpen, setIsCourseMapOpen] = useState(true);

  const isDraftMode = courseId === "draft" || courseId === "new";
  const [draftData, setDraftData] = useState(null);
  const [draftModules, setDraftModules] = useState([]);
  const [draftQuizzes, setDraftQuizzes] = useState([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Ensures all modules, lessons, topics, contents, and quizzes have non-empty string IDs in draft mode
  const ensureDraftIds = (modules = [], courseQuizzes = []) => {
    const mappedQuizzes = (courseQuizzes || []).map((quiz, qIdx) => {
      const qzId = quiz.id || `draft-quiz-course-${qIdx + 1}`;
      return {
        ...quiz,
        id: qzId,
        questions: (quiz.questions || []).map((q, quIdx) => ({
          ...q,
          id: q.id || `draft-que-${qzId}-${quIdx + 1}`,
        })),
      };
    });

    const mappedModules = (modules || []).map((mod, mIdx) => {
      const modId = mod.id || `draft-mod-${mIdx + 1}`;
      return {
        ...mod,
        id: modId,
        quizzes: (mod.quizzes || []).map((quiz, qIdx) => {
          const qzId = quiz.id || `draft-quiz-mod-${mIdx + 1}-${qIdx + 1}`;
          return {
            ...quiz,
            id: qzId,
            moduleId: quiz.moduleId || modId,
            questions: (quiz.questions || []).map((q, quIdx) => ({
              ...q,
              id: q.id || `draft-que-${qzId}-${quIdx + 1}`,
            })),
          };
        }),
        lessons: (mod.lessons || []).map((les, lIdx) => {
          const lesId = les.id || `draft-les-${mIdx + 1}-${lIdx + 1}`;
          return {
            ...les,
            id: lesId,
            quizzes: (les.quizzes || []).map((quiz, qIdx) => {
              const qzId = quiz.id || `draft-quiz-les-${mIdx + 1}-${lIdx + 1}-${qIdx + 1}`;
              return {
                ...quiz,
                id: qzId,
                moduleId: quiz.moduleId || modId,
                lessonId: quiz.lessonId || lesId,
                questions: (quiz.questions || []).map((q, quIdx) => ({
                  ...q,
                  id: q.id || `draft-que-${qzId}-${quIdx + 1}`,
                })),
              };
            }),
            topics: (les.topics || []).map((top, tIdx) => {
              const topId = top.id || `draft-top-${mIdx + 1}-${lIdx + 1}-${tIdx + 1}`;
              const topQuizzes = top.quizzes || (top.quiz ? [top.quiz] : []);
              return {
                ...top,
                id: topId,
                quizzes: topQuizzes.map((quiz, qIdx) => {
                  const qzId = quiz.id || `draft-quiz-top-${mIdx + 1}-${lIdx + 1}-${tIdx + 1}-${qIdx + 1}`;
                  return {
                    ...quiz,
                    id: qzId,
                    moduleId: quiz.moduleId || modId,
                    lessonId: quiz.lessonId || lesId,
                    topicId: quiz.topicId || topId,
                    questions: (quiz.questions || []).map((q, quIdx) => ({
                      ...q,
                      id: q.id || `draft-que-${qzId}-${quIdx + 1}`,
                    })),
                  };
                }),
                contents: (top.contents || []).map((cnt, cIdx) => ({
                  ...cnt,
                  id: cnt.id || `draft-cnt-${mIdx + 1}-${lIdx + 1}-${tIdx + 1}-${cIdx + 1}`,
                })),
              };
            }),
          };
        }),
      };
    });

    return { modules: mappedModules, quizzes: mappedQuizzes };
  };

  // Load temporary draft from sessionStorage if in draft mode
  useEffect(() => {
    if (isDraftMode) {
      try {
        const raw = sessionStorage.getItem("imported_course_draft");
        if (raw) {
          const parsed = JSON.parse(raw);
          setDraftData(parsed);
          const inputModules = parsed.modules || parsed.canonicalJson?.modules || [];
          const inputQuizzes = parsed.quizzes || parsed.canonicalJson?.quizzes || [];
          const { modules: mappedMods, quizzes: mappedQuiz } = ensureDraftIds(inputModules, inputQuizzes);
          setDraftModules(mappedMods);
          setDraftQuizzes(mappedQuiz);
          setCourseForm({
            title: parsed.metadata?.title || "Imported Course",
            subtitle: parsed.metadata?.description || "",
            description: parsed.metadata?.description || "",
            category: parsed.metadata?.category || "General",
            level: parsed.metadata?.level || "BEGINNER",
            thumbnailUrl: parsed.metadata?.thumbnailUrl || "",
            duration: parsed.metadata?.estimatedLearningHours ? `${parsed.metadata.estimatedLearningHours} hours` : "",
            audience: "",
            author: "",
          });
        }
      } catch (err) {
        console.error("Failed to parse imported_course_draft from sessionStorage:", err);
      } finally {
        setDraftLoaded(true);
      }
    }
  }, [isDraftMode]);

  // Sync normal course data into form state when loading real database record
  useEffect(() => {
    if (!isDraftMode && course) {
      setCourseForm({
        title: course.title || "",
        subtitle: course.subtitle || course.shortDescription || "",
        description: course.description || "",
        category: course.category || "",
        level: course.level || "Beginner",
        thumbnailUrl: course.thumbnailUrl || "",
        duration: course.duration || "",
        audience: course.audience || "",
        author: course.author || course.creator?.name || "",
      });
    }
  }, [isDraftMode, course]);

  const effectiveCourseQuizzes = (isDraftMode ? draftQuizzes : (course?.quizzes || [])).filter(
    (q) => !q.moduleId && !q.lessonId && !q.topicId
  );

  const effectiveCourse = isDraftMode
    ? (draftData ? {
        id: "draft",
        title: courseForm.title || draftData.metadata?.title || "Imported Course",
        description: courseForm.description || draftData.metadata?.description || "",
        category: courseForm.category || draftData.metadata?.category || "General",
        level: courseForm.level || draftData.metadata?.level || "BEGINNER",
        thumbnailUrl: courseForm.thumbnailUrl || draftData.metadata?.thumbnailUrl || null,
        status: "DRAFT",
        isImportDraft: true,
        quizzes: effectiveCourseQuizzes,
      } : null)
    : (course ? { ...course, quizzes: effectiveCourseQuizzes } : null);

  const effectiveModules = (isDraftMode ? draftModules : (modules || [])).map((mod) => {
    const rawModQuizzes = (mod.quizzes && mod.quizzes.length > 0)
      ? mod.quizzes
      : (isDraftMode ? draftQuizzes : (course?.quizzes || [])).filter(
          (q) => q.moduleId && (String(q.moduleId) === String(mod.id) || String(q.moduleId) === String(mod._id))
        );

    return {
      ...mod,
      quizzes: rawModQuizzes.filter((q) => !q.lessonId && !q.topicId),
      lessons: (mod.lessons || []).map((lesson) => {
        const rawLesQuizzes = (lesson.quizzes && lesson.quizzes.length > 0)
          ? lesson.quizzes
          : (isDraftMode ? draftQuizzes : (course?.quizzes || [])).filter(
              (q) => q.lessonId && (String(q.lessonId) === String(lesson.id) || String(q.lessonId) === String(lesson._id))
            );

        return {
          ...lesson,
          quizzes: rawLesQuizzes.filter((q) => !q.topicId),
          topics: (lesson.topics || []).map((topic) => {
            const rawTopQuizzes = (topic.quizzes && topic.quizzes.length > 0)
              ? topic.quizzes
              : (topic.quiz ? [topic.quiz] : (isDraftMode ? draftQuizzes : (course?.quizzes || [])).filter(
                  (q) => q.topicId && (String(q.topicId) === String(topic.id) || String(q.topicId) === String(topic._id))
                ));

            return {
              ...topic,
              quizzes: rawTopQuizzes,
            };
          }),
        };
      }),
    };
  });
  const effectiveLoading = isDraftMode ? (!draftLoaded || !draftData) : (courseLoading || modulesLoading);
  const effectiveError = isDraftMode ? (draftLoaded && !draftData) : (courseError || !course);

  // Selection Handlers
  const handleSelectCourseOverview = () => {
    setComposerMode("course");
    setQuizMode("view");
    setComposeLessonId(null);
    setComposeModuleId(null);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizStartEditing(false);
    setSelectedCellId(null);
    setMobileSidebarOpen(false);
  };

  const handleSelectQuiz = (quiz, mod = null, lesson = null, topic = null, options = {}) => {
    if (!quiz) return;

    if (topic && typeof topic === "object" && ("startEditing" in topic || "isEditing" in topic || "mode" in topic)) {
      options = topic;
      topic = null;
    }

    const qId = quiz.id || quiz._id;
    setComposeQuizId(qId);
    setSelectedQuizState(quiz);

    const targetModuleId = mod?.id || mod?._id || quiz.moduleId || null;
    const targetLessonId = lesson?.id || lesson?._id || quiz.lessonId || null;
    const targetTopicId = topic?.id || topic?._id || quiz.topicId || null;

    setComposeModuleId(targetModuleId);
    setComposeLessonId(targetLessonId);
    setComposeTopicId(targetTopicId);
    setSelectedCellId(null);

    const startEdit = Boolean(options?.startEditing);
    setQuizMode(startEdit ? "edit" : "view");
    setComposerMode("quiz");
    setQuizStartEditing(startEdit);
    setMobileSidebarOpen(false);
  };

  const handleAddCourseQuiz = () => {
    setComposeModuleId(null);
    setComposeLessonId(null);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
    setSelectedCellId(null);
    setMobileSidebarOpen(false);
  };

  const handleAddModuleQuiz = (mod) => {
    const targetModuleId = mod?.id || mod?._id || composeModuleId;
    setComposeModuleId(targetModuleId);
    setComposeLessonId(null);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
    setSelectedCellId(null);
    setMobileSidebarOpen(false);
  };

  const handleAddLessonQuiz = (lesson, mod = null) => {
    const targetModuleId = mod?.id || mod?._id || composeModuleId;
    setComposeModuleId(targetModuleId || null);
    setComposeLessonId(lesson?.id || lesson?._id || null);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
    setSelectedCellId(null);
    setMobileSidebarOpen(false);
  };

  const handleAddTopicQuiz = (topic, lesson = null, mod = null) => {
    const targetLessonId = lesson?.id || lesson?._id || composeLessonId;
    const targetModuleId = mod?.id || mod?._id || composeModuleId;
    setComposeModuleId(targetModuleId || null);
    setComposeLessonId(targetLessonId || null);
    setComposeTopicId(topic?.id || topic?._id || null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
    setSelectedCellId(null);
    setMobileSidebarOpen(false);
  };

  // QuizOverviewView's editor authors questions inline as local state — they
  // aren't Content rows, they're real Question-repository entities linked to
  // the quiz via QuizQuestion, so saving the quiz metadata alone (the plain
  // createQuizService/updateQuizService calls below) never persisted them.
  // This maps that local question shape onto what /questions/bulk and
  // /questions/:id expect.
  const mapQuestionForApi = (q) => ({
    question: q.question,
    questionType: q.questionType,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    marks: Number(q.marks) || 1,
    difficulty: q.difficulty,
  });

  // Diffs the editor's current question list against what the quiz actually
  // had before this save (empty for a brand-new quiz): new rows (no id, or a
  // locally-generated "draft-que-" id) get bulk-created and attached; rows
  // that already existed get their fields updated in place; anything that
  // existed before but isn't in the current list anymore gets unlinked.
  const syncQuizQuestions = async (quizId, currentQuestions, originalQuestionIds) => {
    const isNew = (q) => !q.id || String(q.id).startsWith("draft-");
    const originalIdSet = new Set((originalQuestionIds || []).map(String));

    const newQuestions = (currentQuestions || []).filter(isNew);
    const existingQuestions = (currentQuestions || []).filter((q) => !isNew(q));
    // A repository question picked via "From Repository" already has a real
    // id but wasn't linked to this quiz before this save — attach it as-is
    // rather than overwriting its (possibly shared, used-elsewhere) content.
    // Only a question that was already this quiz's own gets its edits saved.
    const alreadyLinkedQuestions = existingQuestions.filter((q) => originalIdSet.has(String(q.id)));
    const newlyAttachedQuestionIds = existingQuestions
      .filter((q) => !originalIdSet.has(String(q.id)))
      .map((q) => q.id);

    const keptIds = new Set(existingQuestions.map((q) => String(q.id)));
    const removedIds = (originalQuestionIds || []).filter((id) => !keptIds.has(String(id)));

    if (newQuestions.length > 0) {
      await bulkCreateQuestionsService(quizId, newQuestions.map(mapQuestionForApi));
    }
    if (newlyAttachedQuestionIds.length > 0) {
      await importQuestionsToQuizService(quizId, newlyAttachedQuestionIds);
    }
    for (const q of alreadyLinkedQuestions) {
      await updateRepositoryQuestion(q.id, mapQuestionForApi(q));
    }
    for (const id of removedIds) {
      await removeQuestionFromQuizService(quizId, id);
    }
  };

  const handleSaveQuiz = async (updatedQuizData) => {
    if (isDraftMode) {
      let createdQuiz;
      if (quizMode === "create" || !selectedQuizState) {
        const isTopicQuiz = Boolean(composeTopicId);
        const isLessonQuiz = !isTopicQuiz && Boolean(composeLessonId);
        createdQuiz = {
          id: `draft-quiz-${isTopicQuiz ? "topic" : isLessonQuiz ? "lesson" : "mod"}-${Date.now()}`,
          title: updatedQuizData.title || (isTopicQuiz ? "Topic Quiz" : isLessonQuiz ? "Lesson Quiz" : "Module Quiz"),
          description: updatedQuizData.description || "",
          passingScore: Number(updatedQuizData.passingScore) || 70,
          timeLimit: Number(updatedQuizData.timeLimit) || 30,
          isPublished: updatedQuizData.isPublished !== false,
          moduleId: composeModuleId,
          lessonId: composeLessonId || null,
          topicId: composeTopicId || null,
          scope: isTopicQuiz ? "TOPIC" : isLessonQuiz ? "LESSON" : "MODULE",
          questions: updatedQuizData.questions || [],
        };

        const nextDraftModules = draftModules.map((m) => {
          if (m.id !== composeModuleId) return m;
          if (isTopicQuiz) {
            return {
              ...m,
              lessons: (m.lessons || []).map((l) => {
                if (l.id !== composeLessonId) return l;
                return {
                  ...l,
                  topics: (l.topics || []).map((t) => {
                    if (t.id !== composeTopicId) return t;
                    return {
                      ...t,
                      quizzes: [...(t.quizzes || []), createdQuiz],
                    };
                  }),
                };
              }),
            };
          }
          if (isLessonQuiz) {
            return {
              ...m,
              lessons: (m.lessons || []).map((l) =>
                l.id === composeLessonId
                  ? { ...l, quizzes: [...(l.quizzes || []), createdQuiz] }
                  : l
              ),
            };
          }
          return {
            ...m,
            quizzes: [...(m.quizzes || []), createdQuiz],
          };
        });

        setDraftModules(nextDraftModules);

        if (draftData) {
          const updatedDraft = {
            ...draftData,
            modules: nextDraftModules,
          };
          setDraftData(updatedDraft);
          sessionStorage.setItem("imported_course_draft", JSON.stringify(updatedDraft));
        }

        showToast(isTopicQuiz ? "Topic quiz created in draft!" : isLessonQuiz ? "Lesson quiz created in draft!" : "Module quiz created in draft!", "success");
      } else {
        const targetId = selectedQuizState.id || selectedQuizState._id || composeQuizId;
        const isCourseQuiz = draftQuizzes.some(
          (q) => targetId && (String(q.id || q._id) === String(targetId))
        );
        const isTopicQuiz = !isCourseQuiz && Boolean(composeTopicId || selectedQuizState.topicId);
        const isLessonQuiz = !isCourseQuiz && !isTopicQuiz && Boolean(composeLessonId || selectedQuizState.lessonId);

        let nextDraftQuizzes = [...draftQuizzes];
        let nextDraftModules = [...draftModules];

        if (isCourseQuiz || (!composeModuleId && !isLessonQuiz && !isTopicQuiz)) {
          nextDraftQuizzes = nextDraftQuizzes.map((q) => {
            if (targetId && String(q.id || q._id) === String(targetId)) {
              return { ...q, ...updatedQuizData };
            }
            return q;
          });
          createdQuiz = { ...selectedQuizState, ...updatedQuizData };
        } else if (isTopicQuiz) {
          nextDraftModules = nextDraftModules.map((mod) => ({
            ...mod,
            lessons: (mod.lessons || []).map((l) => ({
              ...l,
              topics: (l.topics || []).map((t) => {
                if (!(t.quizzes || []).some((q) => targetId && String(q.id || q._id) === String(targetId))) {
                  return t;
                }
                return {
                  ...t,
                  quizzes: (t.quizzes || []).map((q) =>
                    targetId && String(q.id || q._id) === String(targetId) ? { ...q, ...updatedQuizData } : q
                  ),
                };
              }),
            })),
          }));
          createdQuiz = { ...selectedQuizState, ...updatedQuizData };
        } else if (isLessonQuiz) {
          nextDraftModules = nextDraftModules.map((mod) => ({
            ...mod,
            lessons: (mod.lessons || []).map((l) => {
              if (!(l.quizzes || []).some((q) => targetId && String(q.id || q._id) === String(targetId))) {
                return l;
              }
              return {
                ...l,
                quizzes: (l.quizzes || []).map((q) =>
                  targetId && String(q.id || q._id) === String(targetId) ? { ...q, ...updatedQuizData } : q
                ),
              };
            }),
          }));
          createdQuiz = { ...selectedQuizState, ...updatedQuizData };
        } else {
          nextDraftModules = nextDraftModules.map((mod) => {
            if (mod.id === composeModuleId || (mod.quizzes || []).some((q) => targetId && String(q.id || q._id) === String(targetId))) {
              const updatedQuizzes = (mod.quizzes || []).map((q) => {
                if (targetId && String(q.id || q._id) === String(targetId)) {
                  return { ...q, ...updatedQuizData };
                }
                return q;
              });
              return { ...mod, quizzes: updatedQuizzes };
            }
            return mod;
          });
          createdQuiz = { ...selectedQuizState, ...updatedQuizData };
        }

        setDraftQuizzes(nextDraftQuizzes);
        setDraftModules(nextDraftModules);

        if (draftData) {
          const updatedDraft = {
            ...draftData,
            quizzes: nextDraftQuizzes,
            modules: nextDraftModules,
          };
          setDraftData(updatedDraft);
          sessionStorage.setItem("imported_course_draft", JSON.stringify(updatedDraft));
        }

        showToast("Quiz updated in draft!", "success", "Saved");
      }

      setSelectedQuizState(createdQuiz);
      setComposeQuizId(createdQuiz.id);
      setQuizMode("view");
      setQuizStartEditing(false);
    } else {
      // Saved Course Mode (via REST API)
      if (quizMode === "create" || !selectedQuizState) {
        try {
          const resQuiz = await createQuizService({
            title: updatedQuizData.title || (composeTopicId ? "Topic Quiz" : composeLessonId ? "Lesson Quiz" : "Module Quiz"),
            description: updatedQuizData.description || "",
            passingScore: Number(updatedQuizData.passingScore) || 70,
            timeLimit: Number(updatedQuizData.timeLimit) || 30,
            isPublished: updatedQuizData.isPublished !== false,
            courseId,
            moduleId: composeModuleId || null,
            lessonId: composeLessonId || null,
            topicId: composeTopicId || null,
            questions: updatedQuizData.questions || [],
          });

          if (updatedQuizData.questions?.length > 0) {
            try {
              await syncQuizQuestions(resQuiz.id, updatedQuizData.questions, []);
            } catch (qErr) {
              console.error("Save Quiz Questions Error:", qErr);
              showToast(qErr?.response?.data?.message || "Quiz created, but some questions failed to save.", "error");
            }
          }

          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, courseId] });
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });

          showToast(composeTopicId ? "Topic quiz created successfully!" : composeLessonId ? "Lesson quiz created successfully!" : "Module quiz created successfully!", "success");
          setSelectedQuizState(resQuiz);
          setComposeQuizId(resQuiz.id);
          setQuizMode("view");
          setQuizStartEditing(false);
        } catch (err) {
          console.error("Create Quiz Error:", err);
          showToast(err?.response?.data?.message || "Failed to create quiz.", "error");
        }
      } else {
        const targetId = selectedQuizState.id || selectedQuizState._id || composeQuizId;
        try {
          const resQuiz = await updateQuizService(targetId, {
            title: updatedQuizData.title,
            description: updatedQuizData.description,
            passingScore: Number(updatedQuizData.passingScore),
            timeLimit: Number(updatedQuizData.timeLimit),
            isPublished: updatedQuizData.isPublished,
            courseId,
            moduleId: composeModuleId || selectedQuizState.moduleId || null,
            lessonId: composeLessonId || selectedQuizState.lessonId || null,
            topicId: composeTopicId || selectedQuizState.topicId || null,
          });

          const updatedQuiz = resQuiz || { ...selectedQuizState, ...updatedQuizData };

          try {
            const originalQuestionIds = (selectedQuizState.quizQuestions || [])
              .map((qq) => qq.question?.id || qq.questionId)
              .filter(Boolean);
            await syncQuizQuestions(targetId, updatedQuizData.questions || [], originalQuestionIds);
          } catch (qErr) {
            console.error("Save Quiz Questions Error:", qErr);
            showToast(qErr?.response?.data?.message || "Quiz updated, but some questions failed to save.", "error");
          }

          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE, courseId] });
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });

          showToast("Quiz updated successfully!", "success");
          setSelectedQuizState(updatedQuiz);
          setQuizMode("view");
          setQuizStartEditing(false);
        } catch (err) {
          console.error("Update Quiz Error:", err);
          showToast(err?.response?.data?.message || "Failed to update quiz.", "error");
        }
      }
    }
  };

  const handleCancelQuizEdit = () => {
    if (composeTopicId) {
      setComposerMode("topic");
    } else if (composeLessonId) {
      setComposerMode("lesson");
    } else if (composeModuleId) {
      setComposerMode("module");
    } else {
      handleSelectCourseOverview();
    }
    setQuizMode("view");
    setQuizStartEditing(false);
  };

  const handleDuplicateQuiz = async (quiz, mod = null, lesson = null, topic = null) => {
    const dupId = `draft-quiz-${topic ? "topic" : lesson ? "lesson" : mod ? "mod" : "course"}-${Date.now()}`;
    const duplicatedQuiz = {
      ...quiz,
      id: dupId,
      title: `${quiz.title || "Quiz"} (Copy)`,
      questions: (quiz.questions || (quiz.quizQuestions || []).map((qq) => qq.question) || []).map((q, qIdx) => ({
        ...q,
        id: `draft-que-${dupId}-${qIdx + 1}`,
      })),
    };

    if (isDraftMode) {
      let nextDraftQuizzes = [...draftQuizzes];
      let nextDraftModules = [...draftModules];

      if (topic && lesson && mod) {
        nextDraftModules = nextDraftModules.map((m) =>
          m.id === mod.id
            ? {
                ...m,
                lessons: (m.lessons || []).map((l) =>
                  l.id === lesson.id
                    ? {
                        ...l,
                        topics: (l.topics || []).map((t) =>
                          t.id === topic.id ? { ...t, quizzes: [...(t.quizzes || []), duplicatedQuiz] } : t
                        ),
                      }
                    : l
                ),
              }
            : m
        );
      } else if (lesson && mod) {
        nextDraftModules = nextDraftModules.map((m) =>
          m.id === mod.id
            ? {
                ...m,
                lessons: (m.lessons || []).map((l) =>
                  l.id === lesson.id ? { ...l, quizzes: [...(l.quizzes || []), duplicatedQuiz] } : l
                ),
              }
            : m
        );
      } else if (!mod) {
        nextDraftQuizzes.push(duplicatedQuiz);
      } else {
        nextDraftModules = nextDraftModules.map((m) => {
          if (m.id === mod.id) {
            return {
              ...m,
              quizzes: [...(m.quizzes || []), duplicatedQuiz],
            };
          }
          return m;
        });
      }

      setDraftQuizzes(nextDraftQuizzes);
      setDraftModules(nextDraftModules);

      if (draftData) {
        const updatedDraft = {
          ...draftData,
          quizzes: nextDraftQuizzes,
          modules: nextDraftModules,
        };
        setDraftData(updatedDraft);
        sessionStorage.setItem("imported_course_draft", JSON.stringify(updatedDraft));
      }

      showToast("Quiz duplicated in draft!", "success");
      handleSelectQuiz(duplicatedQuiz, mod, lesson, topic, { startEditing: false });
    } else {
      try {
        await api.post("/quizzes", {
          ...quiz,
          title: `${quiz.title || "Quiz"} (Copy)`,
          courseId,
          moduleId: mod?.id || null,
          lessonId: lesson?.id || null,
          topicId: topic?.id || null,
        });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
        showToast("Quiz duplicated successfully!", "success");
      } catch (err) {
        showToast("Failed to duplicate quiz.", "error");
      }
    }
  };

  const handleDeleteQuiz = async (e, quiz, mod = null, lesson = null, topic = null) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${quiz.title || "this quiz"}"?`)) return;

    if (isDraftMode) {
      const qTargetId = quiz.id || quiz._id;
      let nextDraftQuizzes = draftQuizzes.filter((q) => String(q.id || q._id) !== String(qTargetId));
      let nextDraftModules = draftModules.map((m) => {
        if (topic && lesson && mod && m.id === mod.id) {
          return {
            ...m,
            lessons: (m.lessons || []).map((l) =>
              l.id === lesson.id
                ? {
                    ...l,
                    topics: (l.topics || []).map((t) =>
                      t.id === topic.id
                        ? { ...t, quizzes: (t.quizzes || []).filter((q) => String(q.id || q._id) !== String(qTargetId)) }
                        : t
                    ),
                  }
                : l
            ),
          };
        }
        if (lesson && mod && m.id === mod.id) {
          return {
            ...m,
            lessons: (m.lessons || []).map((l) =>
              l.id === lesson.id
                ? { ...l, quizzes: (l.quizzes || []).filter((q) => String(q.id || q._id) !== String(qTargetId)) }
                : l
            ),
          };
        }
        if (!lesson && mod && m.id === mod.id) {
          return {
            ...m,
            quizzes: (m.quizzes || []).filter((q) => String(q.id || q._id) !== String(qTargetId)),
          };
        }
        return m;
      });

      setDraftQuizzes(nextDraftQuizzes);
      setDraftModules(nextDraftModules);

      if (draftData) {
        const updatedDraft = {
          ...draftData,
          quizzes: nextDraftQuizzes,
          modules: nextDraftModules,
        };
        setDraftData(updatedDraft);
        sessionStorage.setItem("imported_course_draft", JSON.stringify(updatedDraft));
      }

      showToast("Quiz deleted from draft!", "info");

      if (composeQuizId && String(composeQuizId) === String(qTargetId)) {
        handleSelectCourseOverview();
      }
    } else {
      try {
        const qTargetId = quiz.id || quiz._id;
        if (qTargetId && !String(qTargetId).startsWith("draft-")) {
          await deleteQuizService(qTargetId);
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
        }
        showToast("Quiz deleted successfully!", "success");
        if (composeQuizId && String(composeQuizId) === String(qTargetId)) {
          handleSelectCourseOverview();
        }
      } catch (err) {
        showToast("Failed to delete quiz from server.", "error");
      }
    }
  };

  const handleSelectLesson = (lessonId) => {
    setComposeLessonId(lessonId);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setComposerMode("lesson");

    const { lesson: foundLesson, module: foundModule } = findModuleAndLessonById(effectiveModules, lessonId);
    if (foundLesson) {
      setLessonForm({
        title: foundLesson.title || "",
        subtitle: foundLesson.subtitle || "",
        summary: foundLesson.summary || foundLesson.description || "",
      });
      if (foundModule) {
        setComposeModuleId(foundModule.id);
      }
    }
    setMobileSidebarOpen(false);
  };

  const handleSelectModule = (mod, lessonId = null) => {
    setComposeModuleId(mod.id);
    setComposeLessonId(lessonId);
    setComposeTopicId(null);
    setComposeQuizId(null);
    setComposerMode("module");
    setMobileSidebarOpen(false);
  };

  const handleSelectTopic = (topicId, lessonId, moduleId) => {
    setComposeTopicId(topicId);
    setComposeLessonId(lessonId);
    setComposeModuleId(moduleId);
    setComposeQuizId(null);
    setComposerMode("topic");
    setMobileSidebarOpen(false);
  };

  const handleSelectContent = (content, topic, lesson, mod) => {
    setComposeTopicId(topic.id);
    setComposeLessonId(lesson.id);
    setComposeModuleId(mod.id);
    setComposeQuizId(null);
    setComposerMode("topic");
    setSelectedCellId(content.id);
    setMobileSidebarOpen(false);
  };

  const handleAddContentFromSidebar = (topicId, lessonId, moduleId) => {
    setComposeTopicId(topicId);
    if (lessonId) setComposeLessonId(lessonId);
    if (moduleId) setComposeModuleId(moduleId);
    setComposerMode("topic");
    setAutoOpenAddSignal((n) => n + 1);
    setMobileSidebarOpen(false);
  };

  const handleEntityCreated = ({ entity, parentId, moduleId, created }) => {
    if (!created?.id) return;
    if (entity === "module") {
      setComposeModuleId(created.id);
      setComposeLessonId(null);
      setComposeTopicId(null);
      setComposerMode("module");
    } else if (entity === "lesson") {
      setComposeModuleId(parentId);
      setComposeLessonId(created.id);
      setComposeTopicId(null);
      setComposerMode("lesson");
    } else if (entity === "topic") {
      if (moduleId) setComposeModuleId(moduleId);
      setComposeLessonId(parentId);
      setComposeTopicId(created.id);
      setComposerMode("topic");
    }
  };

  const topicHierarchy = findHierarchyByTopicId(effectiveModules, composeTopicId);
  const lessonHierarchy = findModuleAndLessonById(effectiveModules, composeLessonId);

  const composingLesson = topicHierarchy.lesson || lessonHierarchy.lesson;
  const composingModule = topicHierarchy.module || lessonHierarchy.module;
  const activeModuleObj =
    effectiveModules.find((m) => String(m.id || m._id) === String(composeModuleId)) ||
    composingModule ||
    effectiveModules[0];
  const composingTopic = topicHierarchy.topic || composingLesson?.topics?.find((t) => String(t.id || t._id) === String(composeTopicId));
  const quizzesById = new Map();
  const extractAllQuizzesFromModuleList = (modList = []) => {
    const list = [];
    for (const m of modList || []) {
      if (!m) continue;
      if (Array.isArray(m.quizzes)) list.push(...m.quizzes);
      for (const l of m.lessons || []) {
        if (!l) continue;
        if (Array.isArray(l.quizzes)) list.push(...l.quizzes);
        for (const t of l.topics || []) {
          if (!t) continue;
          if (Array.isArray(t.quizzes)) list.push(...t.quizzes);
          if (t.quiz) list.push(t.quiz);
        }
      }
    }
    return list;
  };

  const allRawQuizzes = [
    ...(course?.quizzes || []),
    ...(effectiveCourseQuizzes || []),
    ...(draftQuizzes || []),
    ...extractAllQuizzesFromModuleList(modules),
    ...extractAllQuizzesFromModuleList(effectiveModules),
    ...extractAllQuizzesFromModuleList(draftModules),
    ...(selectedQuizState ? [selectedQuizState] : []),
  ];

  for (const q of allRawQuizzes) {
    if (!q) continue;
    const qKey = q.id ?? q._id;
    if (qKey !== undefined && qKey !== null) {
      quizzesById.set(String(qKey), q);
    }
  }

  const activeQuizObj = composeQuizId
    ? (quizzesById.get(String(composeQuizId)) || (selectedQuizState && (String(selectedQuizState.id) === String(composeQuizId) || String(selectedQuizState._id) === String(composeQuizId)) ? selectedQuizState : null))
    : null;

  // Delete Handlers for structural children
  const handleDeleteModule = async (e, mod) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this module and all its contents?")) return;
    if (isDraftMode) {
      const deletedLessonIds = new Set((mod.lessons || []).map((l) => l.id));
      const deletedTopicIds = new Set((mod.lessons || []).flatMap((l) => (l.topics || []).map((t) => t.id)));
      const nextMods = draftModules.filter((m) => m.id !== mod.id);
      const nextQuizzes = draftQuizzes.filter(
        (q) => q.moduleId !== mod.id && (!q.lessonId || !deletedLessonIds.has(q.lessonId)) && (!q.topicId || !deletedTopicIds.has(q.topicId))
      );
      setDraftModules(nextMods);
      setDraftQuizzes(nextQuizzes);
      showToast("Module deleted from draft", "success");
      handleSelectCourseOverview();
      return;
    }
    try {
      await deleteModuleMutation.mutateAsync(mod.id);
      showToast("Module deleted successfully", "success");
      handleSelectCourseOverview();
    } catch (err) {
      showToast("Failed to delete module", "error");
    }
  };

  const handleDeleteLesson = async (e, lesson, moduleId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    if (isDraftMode) {
      const deletedTopicIds = new Set((lesson.topics || []).map((t) => t.id));
      const nextMods = draftModules.map((m) => {
        if (m.id === moduleId || (m.lessons || []).some((l) => l.id === lesson.id)) {
          return {
            ...m,
            lessons: (m.lessons || []).filter((l) => l.id !== lesson.id)
          };
        }
        return m;
      });
      const nextQuizzes = draftQuizzes.filter(
        (q) => q.lessonId !== lesson.id && (!q.topicId || !deletedTopicIds.has(q.topicId))
      );
      setDraftModules(nextMods);
      setDraftQuizzes(nextQuizzes);
      showToast("Lesson deleted from draft", "success");
      handleSelectCourseOverview();
      return;
    }
    try {
      await deleteLessonMutation.mutateAsync({ lessonId: lesson.id, moduleId });
      showToast("Lesson deleted successfully", "success");
      handleSelectCourseOverview();
    } catch (err) {
      showToast("Failed to delete lesson", "error");
    }
  };

  const handleDeleteTopic = async (e, topic, lessonId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this topic and all its contents?")) return;
    if (isDraftMode) {
      const nextMods = draftModules.map((m) => ({
        ...m,
        lessons: (m.lessons || []).map((l) => {
          if (l.id === lessonId || (l.topics || []).some((t) => t.id === topic.id)) {
            return {
              ...l,
              topics: (l.topics || []).filter((t) => t.id !== topic.id)
            };
          }
          return l;
        })
      }));
      const nextQuizzes = draftQuizzes.filter((q) => q.topicId !== topic.id);
      setDraftModules(nextMods);
      setDraftQuizzes(nextQuizzes);
      showToast("Topic deleted from draft", "success");
      if (composeTopicId === topic.id) {
        setComposeTopicId(null);
        setComposerMode("lesson");
      }
      return;
    }
    try {
      await deleteTopicMutation.mutateAsync({ topicId: topic.id, lessonId });
      showToast("Topic deleted successfully", "success");
      if (composeTopicId === topic.id) {
        setComposeTopicId(null);
        setComposerMode("lesson");
      }
    } catch (err) {
      showToast("Failed to delete topic", "error");
    }
  };

  const handleDeleteContent = async (e, content, topicId) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    if (isDraftMode) {
      const nextMods = draftModules.map((m) => ({
        ...m,
        lessons: (m.lessons || []).map((l) => ({
          ...l,
          topics: (l.topics || []).map((t) => {
            if (t.id === topicId || (t.contents || []).some((c) => c.id === content.id)) {
              return {
                ...t,
                contents: (t.contents || []).filter((c) => c.id !== content.id)
              };
            }
            return t;
          })
        }))
      }));
      setDraftModules(nextMods);
      showToast("Content deleted from draft", "success");
      if (selectedCellId === content.id) setSelectedCellId(null);
      return;
    }
    try {
      await deleteContentMutation.mutateAsync({ contentId: content.id, topicId });
      showToast("Content deleted successfully", "success");
      if (selectedCellId === content.id) setSelectedCellId(null);
    } catch (err) {
      showToast("Failed to delete content", "error");
    }
  };

  const handleSaveCourse = async () => {
    if (isDraftMode) {
      if (!draftData || !draftData.jobId) {
        showToast("No active course draft found to save.", "error");
        return;
      }
      setIsSavingDraft(true);
      try {
        const updatedCanonicalJson = {
          ...(draftData.canonicalJson || {}),
          metadata: {
            ...(draftData.canonicalJson?.metadata || {}),
            title: courseForm.title || draftData.metadata?.title || "Imported Course",
            description: courseForm.description || draftData.metadata?.description || "",
            category: courseForm.category || draftData.metadata?.category || "General",
            level: courseForm.level || draftData.metadata?.level || "BEGINNER",
            thumbnailUrl: courseForm.thumbnailUrl || draftData.metadata?.thumbnailUrl || null,
          },
          settings: draftData.settings || {},
          quizzes: draftQuizzes.length > 0 ? draftQuizzes : (draftData.quizzes || draftData.canonicalJson?.quizzes || []),
          modules: draftModules,
          assetMap: draftData.assetMap || {}
        };

        const response = await api.post(`/course-import/jobs/${draftData.jobId}/import`, {
          canonicalJson: updatedCanonicalJson
        });

        const createdCourse = response.data?.data;
        const persistedCourseId = createdCourse?.courseId || createdCourse?.id;

        if (!persistedCourseId) {
          throw new Error("Failed to save course: No course ID returned.");
        }

        sessionStorage.removeItem("imported_course_draft");
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE] });
        await queryClient.resetQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE] });

        showToast("Course saved and created successfully!", "success", "Saved");
        router.push(`/instructor/courses/${persistedCourseId}`);
      } catch (err) {
        console.error("Save Draft Error:", err);
        const msg = err?.response?.data?.message || err?.message || "Failed to save course to database.";
        showToast(msg, "error");
      } finally {
        setIsSavingDraft(false);
      }
    } else {
      try {
        await updateCourseMutation.mutateAsync({ courseId, courseData: courseForm });
        showToast("Course saved successfully!", "success", "Saved");
      } catch (err) {
        showToast("Failed to save course", "error");
      }
    }
  };

  // --- LIFECYCLE ACTION HANDLERS ---

  // 1. Publish Modal & Handler
  const handleOpenPublishModal = async () => {
    setPublishModalOpen(true);
    setIsValidatingPublish(true);
    try {
      const valData = await validateCoursePublish(courseId);
      setPublishValidation(valData);
    } catch (err) {
      showToast("Failed to validate course for publish", "error");
    } finally {
      setIsValidatingPublish(false);
    }
  };

  const handleConfirmPublish = async () => {
    try {
      await publishCourseMutation.mutateAsync(courseId);
      setPublishModalOpen(false);
      showToast("Course published successfully!", "success", "Published");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to publish course";
      showToast(msg, "error");
    }
  };

  // 2. Unpublish Modal & Handler
  const handleOpenUnpublishModal = () => {
    setUnpublishModalOpen(true);
  };

  const handleConfirmUnpublish = async () => {
    try {
      await unpublishCourseMutation.mutateAsync(courseId);
      setUnpublishModalOpen(false);
      showToast("Course unpublished (set to DRAFT)", "success", "Unpublished");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to unpublish course";
      showToast(msg, "error");
    }
  };

  // 3. Delete Modal & Handler
  const handleOpenDeleteModal = () => {
    setDeleteHasStudentData(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteCourse = async () => {
    try {
      if (isDraftMode || courseId === "draft") {
        sessionStorage.removeItem("imported_course_draft");
        setDeleteModalOpen(false);
        showToast("Course draft discarded successfully", "info");
        router.push("/instructor/courses");
        return;
      }
      await deleteCourseMutation.mutateAsync(courseId);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE] });
      await queryClient.resetQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES_TABLE] });
      setDeleteModalOpen(false);
      showToast("Course deleted successfully", "success");
      router.push("/instructor/courses");
    } catch (err) {
      const errRes = err?.response?.data;
      if (errRes?.code === "COURSE_HAS_STUDENT_DATA" || errRes?.hasStudentData) {
        setDeleteHasStudentData(true);
      } else {
        const msg = errRes?.message || err?.message || "Failed to delete course";
        showToast(msg, "error");
      }
    }
  };

  // 4. Archive Handler
  const handleConfirmArchiveCourse = async () => {
    try {
      await archiveCourseMutation.mutateAsync(courseId);
      setDeleteModalOpen(false);
      showToast("Course archived successfully", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to archive course";
      showToast(msg, "error");
    }
  };

  // 5. Restore Handler
  const handleConfirmRestoreCourse = async () => {
    try {
      await restoreCourseMutation.mutateAsync(courseId);
      showToast("Course restored to DRAFT successfully", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to restore course";
      showToast(msg, "error");
    }
  };

  // 6. Duplicate Handler
  const handleDuplicateCourse = async () => {
    try {
      const res = await duplicateCourse(courseId);
      const newCourse = res?.data || res;
      showToast("Course duplicated successfully!", "success");
      if (newCourse?.id) {
        router.push(`/instructor/courses/${newCourse.id}`);
      }
    } catch (err) {
      showToast("Failed to duplicate course", "error");
    }
  };

  if (effectiveLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader />
      </div>
    );
  }

  if (effectiveError || !effectiveCourse) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-card border border-border rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested course could not be loaded.
        </p>
        <Link
          href="/instructor/courses"
          className="inline-block px-5 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-slate-950 text-xs font-black transition"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const isPublished = effectiveCourse.status === "PUBLISHED";

  const courseMapEffectivelyOpen = mobileSidebarOpen || isCourseMapOpen;
  const sidebarWrapperClassName = mobileSidebarOpen
    ? "fixed inset-y-0 left-0 z-50 w-80 bg-background p-4 shadow-2xl block shrink-0 overflow-y-auto"
    : `hidden lg:block shrink-0 lg:sticky lg:top-24 transition-[width] duration-300 ease-in-out ${
        isCourseMapOpen ? "w-full lg:w-[320px]" : "w-full lg:w-0"
      }`;

  return (
    <div className="space-y-4 pb-16 animate-fade-in duration-300">
      {/* 1. APP HEADER */}
      <CourseComposerHeader
        course={effectiveCourse}
        courseId={courseId}
        globalMode={globalMode}
        onToggleGlobalMode={() => setGlobalMode(globalMode === "rendered" ? "edit" : "rendered")}
        onSaveCourse={handleSaveCourse}
        onImportCourse={() => router.push("/instructor/courses/import")}
        onOpenAskAi={() => handleOpenAskAi()}
        isSaving={isDraftMode ? isSavingDraft : updateCourseMutation.isPending}
        onPublishClick={handleOpenPublishModal}
        onUnpublishClick={handleOpenUnpublishModal}
        onDuplicateClick={handleDuplicateCourse}
        onArchiveClick={handleConfirmArchiveCourse}
        onRestoreClick={handleConfirmRestoreCourse}
        onDeleteClick={handleOpenDeleteModal}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="relative flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Sidebar Panel */}
        <div className={sidebarWrapperClassName}>
          <CourseComposerSidebar
            modules={effectiveModules}
            courseQuizzes={effectiveCourseQuizzes}
            composerMode={composerMode}
            composeModuleId={composeModuleId}
            composeLessonId={composeLessonId}
            composeTopicId={composeTopicId}
            composeQuizId={composeQuizId}
            selectedCellId={selectedCellId}
            isOpen={courseMapEffectivelyOpen}
            onToggleOpen={() => {
              setMobileSidebarOpen(false);
              setIsCourseMapOpen((v) => !v);
            }}
            onSelectCourseOverview={handleSelectCourseOverview}
            onSelectQuiz={handleSelectQuiz}
            onDuplicateQuiz={handleDuplicateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onSelectLesson={handleSelectLesson}
            onSelectModule={handleSelectModule}
            onSelectTopic={handleSelectTopic}
            onSelectContent={handleSelectContent}
            onAddModule={() => openEntityModal({ entity: "module", mode: "create", courseId })}
            onEditModule={(mod) => openEntityModal({ entity: "module", mode: "edit", entityData: mod })}
            onAddLesson={(targetModuleId) =>
              openEntityModal({ entity: "lesson", mode: "create", parentId: targetModuleId || composeModuleId || modules[0]?.id })
            }
            onAddQuizToCourse={handleAddCourseQuiz}
            onAddQuizToModule={handleAddModuleQuiz}
            onAddQuizToLesson={handleAddLessonQuiz}
            onAddQuizToTopic={handleAddTopicQuiz}
            onEditLesson={(lesson, moduleId) => openEntityModal({ entity: "lesson", mode: "edit", entityData: lesson, parentId: moduleId })}
            onAddTopic={(lessonId) => openEntityModal({ entity: "topic", mode: "create", parentId: lessonId })}
            onEditTopic={(topic, lessonId, moduleId) =>
              openEntityModal({ entity: "topic", mode: "edit", entityData: topic, parentId: lessonId, moduleId })
            }
            onAddContent={handleAddContentFromSidebar}
            onDeleteLesson={handleDeleteLesson}
            onDeleteModule={handleDeleteModule}
            onDeleteTopic={handleDeleteTopic}
            onDeleteContent={handleDeleteContent}
            isDraftMode={isDraftMode}
          />
        </div>

        {/* Center Main Workspace Notebook Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Workspace Header & Breadcrumbs */}
          <div className="flex items-center justify-between pb-3 border-b border-transparent/80">
            <div className="flex items-center gap-3">
              {!isCourseMapOpen && !mobileSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsCourseMapOpen(true)}
                  className="hidden lg:flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-primary/50 bg-background text-primary shadow-md transition hover:bg-primary/10 hover:border-primary hover:text-orange-300 cursor-pointer"
                  aria-label="Show course map"
                  title="Show course map"
                >
                  <PanelLeftOpen size={16} />
                </button>
              )}
              <div>
                <div className="text-xs font-semibold text-primary mb-0.5">
                  {composerMode === "course" && `Course Overview`}
                  {composerMode === "quiz" && (quizMode === "create" ? (composeTopicId ? "New Topic Quiz Creation" : composeLessonId ? "New Lesson Quiz Creation" : "New Module Quiz Creation") : `Quiz Overview`)}
                  {composerMode === "lesson" && `Lesson: ${composingLesson?.title || "Lesson Overview"}`}
                  {composerMode === "module" && `Module: ${activeModuleObj?.title || "Module Cells"}`}
                  {composerMode === "topic" && `Topic: ${composingTopic?.title || "Topic Composer"}`}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {composerMode === "course" && (effectiveCourse?.title || "Course Overview Header")}
                  {composerMode === "quiz" && (quizMode === "create" ? `Create Quiz for ${composeTopicId ? (composingTopic?.title || "Topic") : composeLessonId ? (composingLesson?.title || "Lesson") : (activeModuleObj?.title || "Module")}` : (activeQuizObj?.title || "Quiz Details"))}
                  {composerMode === "lesson" && (composingLesson?.title || "Lesson Overview Header")}
                  {composerMode === "module" && (activeModuleObj?.title || "Module Cells Notebook")}
                  {composerMode === "topic" && (composingTopic?.title || "Topic Cells Notebook")}
                </h2>
              </div>
            </div>
          </div>

          {/* Notebook Workspace Dynamic View */}
          <div className="rounded-2xl border border-transparent bg-background/60 p-4 sm:p-6 shadow-xl">
            {composerMode === "course" && (
              <CourseOverviewView
                course={effectiveCourse}
                courseForm={courseForm}
                setCourseForm={setCourseForm}
                isEditing={isEditingCourse || globalMode === "edit"}
                setIsEditing={setIsEditingCourse}
                onSaveCourseMeta={async () => {
                  if (isDraftMode) {
                    setIsEditingCourse(false);
                    showToast("Draft course details updated locally!", "success", "Saved");
                  } else {
                    try {
                      await updateCourseMutation.mutateAsync({ courseId, courseData: courseForm });
                      setIsEditingCourse(false);
                      showToast("Course details updated!", "success", "Saved");
                    } catch (err) {
                      showToast("Failed to save course", "error");
                    }
                  }
                }}
                isSaving={isDraftMode ? isSavingDraft : updateCourseMutation.isPending}
                modules={effectiveModules}
                onSelectModule={handleSelectModule}
                onSelectQuiz={handleSelectQuiz}
                onAddModule={() => openEntityModal({ entity: "module", mode: "create", courseId })}
              />
            )}

            {composerMode === "quiz" && (
              <QuizOverviewView
                key={composeQuizId || `new-quiz-${composeTopicId || composeLessonId || composeModuleId || "course"}`}
                quiz={activeQuizObj}
                quizMode={quizMode}
                moduleTitle={activeModuleObj?.title}
                lessonTitle={composeLessonId ? composingLesson?.title : null}
                topicTitle={composeTopicId ? composingTopic?.title : null}
                onSaveQuiz={handleSaveQuiz}
                onCancel={handleCancelQuizEdit}
                startEditing={quizStartEditing}
              />
            )}

            {composerMode === "lesson" && (
              <LessonOverviewView
                lesson={composingLesson}
                lessonForm={lessonForm}
                setLessonForm={setLessonForm}
                isEditing={isEditingLesson || globalMode === "edit"}
                setIsEditing={setIsEditingLesson}
                onSaveLessonMeta={async () => {
                  if (isDraftMode) {
                    setIsEditingLesson(false);
                    showToast("Draft lesson details updated locally!", "success", "Saved");
                  } else {
                    try {
                      await updateLessonMutation.mutateAsync({
                        lessonId: composeLessonId,
                        lessonData: { ...lessonForm, moduleId: composeModuleId },
                      });
                      setIsEditingLesson(false);
                      showToast("Lesson updated!", "success", "Saved");
                    } catch (err) {
                      showToast("Failed to save lesson", "error");
                    }
                  }
                }}
                isSaving={isDraftMode ? isSavingDraft : updateLessonMutation.isPending}
                topics={composingLesson?.topics || []}
                onSelectTopic={handleSelectTopic}
                onAddTopic={() => openEntityModal({ entity: "topic", mode: "create", parentId: composeLessonId, moduleId: composeModuleId })}
                onAddContent={handleAddContentFromSidebar}
                onEditTopic={(topic) => openEntityModal({ entity: "topic", mode: "edit", entityId: topic.id, initialData: topic, parentId: composeLessonId, moduleId: composeModuleId })}
                onDeleteTopic={(e, topic, lId) => handleDeleteTopic(e, topic, lId || composeLessonId)}
                parentModule={activeModuleObj}
                onSelectLesson={handleSelectLesson}
              />
            )}

            {composerMode === "module" && activeModuleObj && (
              <ModuleOverviewView
                module={activeModuleObj}
                onSelectLesson={handleSelectLesson}
                onAddLesson={(modId) => openEntityModal({ entity: "lesson", mode: "create", parentId: modId })}
                onEditModule={(mod) => openEntityModal({ entity: "module", mode: "edit", entityId: mod.id, initialData: mod, courseId })}
                onEditLesson={(les) => openEntityModal({ entity: "lesson", mode: "edit", entityId: les.id, initialData: les, parentId: activeModuleObj.id })}
                onAddTopic={(lesId) => openEntityModal({ entity: "topic", mode: "create", parentId: lesId, moduleId: activeModuleObj.id })}
                onDeleteLesson={handleDeleteLesson}
                allModules={effectiveModules}
                onSelectModule={handleSelectModule}
              />
            )}

            {composerMode === "topic" && (
              <LessonComposerPanel
                topicId={composeTopicId}
                selectedCellId={selectedCellId}
                onSelectCell={setSelectedCellId}
                autoOpenAddSignal={autoOpenAddSignal}
                onAddQuiz={composingTopic ? () => handleAddTopicQuiz(composingTopic, composingLesson, composingModule) : undefined}
                draftContents={isDraftMode ? composingTopic?.contents || [] : undefined}
                isDraftMode={isDraftMode}
                onUpdateDraftContents={(newContents) => {
                  if (!isDraftMode || !composeTopicId) return;
                  const nextDraftModules = draftModules.map((m) => ({
                    ...m,
                    lessons: (m.lessons || []).map((l) => ({
                      ...l,
                      topics: (l.topics || []).map((t) =>
                        t.id === composeTopicId ? { ...t, contents: newContents } : t
                      ),
                    })),
                  }));
                  setDraftModules(nextDraftModules);
                  if (draftData) {
                    const updatedDraft = { ...draftData, modules: nextDraftModules };
                    setDraftData(updatedDraft);
                    sessionStorage.setItem("imported_course_draft", JSON.stringify(updatedDraft));
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Module/Lesson/Topic create+edit modal */}
      <EntityFormModal
        state={entityModalState}
        onClose={closeEntityModal}
        onCreated={handleEntityCreated}
      />

      {/* Publish Validation Modal */}
      <PublishValidationModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handleConfirmPublish}
        validation={publishValidation}
        isValidating={isValidatingPublish}
        isPublishing={publishCourseMutation.isPending}
        courseTitle={effectiveCourse?.title}
      />

      {/* Unpublish Confirmation Modal */}
      <UnpublishModal
        isOpen={unpublishModalOpen}
        onClose={() => setUnpublishModalOpen(false)}
        onUnpublish={handleConfirmUnpublish}
        isUnpublishing={unpublishCourseMutation.isPending}
        courseTitle={effectiveCourse?.title}
      />

      {/* Delete / Archive Safety Modal */}
      <DeleteCourseModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDeleteCourse}
        onConfirmArchive={handleConfirmArchiveCourse}
        isDeleting={deleteCourseMutation.isPending}
        isArchiving={archiveCourseMutation.isPending}
        courseTitle={effectiveCourse?.title}
        hasStudentData={deleteHasStudentData}
        isPublished={isPublished}
      />

      {/* Unified Ask OTree AI Assistant Modal */}
      <AiComposerModal
        isOpen={askAiModalOpen}
        onClose={() => setAskAiModalOpen(false)}
        initialScope={askAiScope}
        contextData={askAiContext}
        onApply={handleApplyAiGeneratedData}
      />
    </div>
  );
}
