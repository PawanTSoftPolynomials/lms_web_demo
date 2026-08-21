"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
  Eye,
  Pencil,
  Plus,
  GraduationCap,
  Calendar,
  Clock,
  User,
  ChevronRight,
  ChevronDown,
  FileText,
  Trash2,
  Rocket,
  Undo2,
  LayoutGrid,
  X,
  BookOpen,
  Settings2,
  SlidersHorizontal,
  BarChart3,
  Search,
  Home,
  CheckCircle2,
  ClipboardList,
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
    const found = (mod.lessons || []).find((l) => l.id === lessonId);
    if (found) return { module: mod, lesson: found };
  }
  return { module: null, lesson: null };
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
  const [aiModalOpen, setAiModalOpen] = useState(false);

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
            topics: (les.topics || []).map((top, tIdx) => {
              const topId = top.id || `draft-top-${mIdx + 1}-${lIdx + 1}-${tIdx + 1}`;
              return {
                ...top,
                id: topId,
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

  const effectiveCourseQuizzes = isDraftMode
    ? draftQuizzes
    : (course?.quizzes || []).filter((q) => !q.moduleId);

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

  const effectiveModules = isDraftMode
    ? draftModules
    : (modules || []).map((mod) => ({
        ...mod,
        // "Module quizzes" excludes any quiz that's actually scoped to one of
        // this module's lessons (has a lessonId) — those render under their
        // owning lesson instead, via the lessons.map below, so a quiz never
        // shows up twice.
        quizzes: mod.quizzes || (course?.quizzes || []).filter(
          (q) => q.moduleId && !q.lessonId && (String(q.moduleId) === String(mod.id) || String(q.moduleId) === String(mod._id))
        ),
        lessons: (mod.lessons || []).map((lesson) => ({
          ...lesson,
          quizzes: lesson.quizzes || (course?.quizzes || []).filter(
            (q) => q.lessonId && (String(q.lessonId) === String(lesson.id) || String(q.lessonId) === String(lesson._id))
          ),
        })),
      }));
  const effectiveLoading = isDraftMode ? (!draftLoaded || !draftData) : (courseLoading || modulesLoading);
  const effectiveError = isDraftMode ? (draftLoaded && !draftData) : (courseError || !course);

  // Selection Handlers
  const handleSelectCourseOverview = () => {
    setComposerMode("course");
    setQuizMode("view");
    setComposeLessonId(null);
    setComposeModuleId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizStartEditing(false);
    setMobileSidebarOpen(false);
  };

  const handleSelectQuiz = (quiz, mod = null, lesson = null, options = {}) => {
    if (!quiz) return;
    const qId = quiz.id || quiz._id;
    setComposeQuizId(qId);
    setSelectedQuizState(quiz);
    if (mod) {
      setComposeModuleId(mod.id || mod._id);
    } else if (quiz.moduleId) {
      setComposeModuleId(quiz.moduleId);
    } else {
      setComposeModuleId(null);
    }
    if (lesson) {
      setComposeLessonId(lesson.id || lesson._id);
    } else if (quiz.lessonId) {
      setComposeLessonId(quiz.lessonId);
    } else {
      setComposeLessonId(null);
    }
    setQuizMode(options?.startEditing ? "edit" : "view");
    setComposerMode("quiz");
    setQuizStartEditing(options?.startEditing || false);
    setMobileSidebarOpen(false);
  };

  const handleAddModuleQuiz = (mod) => {
    const targetModuleId = mod?.id || mod?._id || composeModuleId;
    setComposeModuleId(targetModuleId);
    setComposeLessonId(null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
    setMobileSidebarOpen(false);
  };

  const handleAddLessonQuiz = (lesson, mod = null) => {
    const targetModuleId = mod?.id || mod?._id || composeModuleId;
    setComposeModuleId(targetModuleId || null);
    setComposeLessonId(lesson?.id || lesson?._id || null);
    setComposeQuizId(null);
    setSelectedQuizState(null);
    setQuizMode("create");
    setComposerMode("quiz");
    setQuizStartEditing(true);
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
    const newQuestions = (currentQuestions || []).filter(isNew);
    const existingQuestions = (currentQuestions || []).filter((q) => !isNew(q));
    const keptIds = new Set(existingQuestions.map((q) => String(q.id)));
    const removedIds = (originalQuestionIds || []).filter((id) => !keptIds.has(String(id)));

    if (newQuestions.length > 0) {
      await bulkCreateQuestionsService(quizId, newQuestions.map(mapQuestionForApi));
    }
    for (const q of existingQuestions) {
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
        const isLessonQuiz = Boolean(composeLessonId);
        createdQuiz = {
          id: `draft-quiz-${isLessonQuiz ? "lesson" : "mod"}-${Date.now()}`,
          title: updatedQuizData.title || (isLessonQuiz ? "Lesson Quiz" : "Module Quiz"),
          description: updatedQuizData.description || "",
          passingScore: Number(updatedQuizData.passingScore) || 70,
          timeLimit: Number(updatedQuizData.timeLimit) || 30,
          isPublished: updatedQuizData.isPublished !== false,
          moduleId: composeModuleId,
          lessonId: composeLessonId || null,
          scope: isLessonQuiz ? "LESSON" : "MODULE",
          questions: updatedQuizData.questions || [],
        };

        const nextDraftModules = draftModules.map((m) => {
          if (m.id !== composeModuleId) return m;
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

        showToast(isLessonQuiz ? "Lesson quiz created in draft!" : "Module quiz created in draft!", "success");
      } else {
        const targetId = selectedQuizState.id || selectedQuizState._id || composeQuizId;
        const isCourseQuiz = draftQuizzes.some(
          (q) => targetId && (String(q.id || q._id) === String(targetId))
        );
        const isLessonQuiz = !isCourseQuiz && Boolean(composeLessonId || selectedQuizState.lessonId);

        let nextDraftQuizzes = [...draftQuizzes];
        let nextDraftModules = [...draftModules];

        if (isCourseQuiz || (!composeModuleId && !isLessonQuiz)) {
          nextDraftQuizzes = nextDraftQuizzes.map((q) => {
            if (targetId && String(q.id || q._id) === String(targetId)) {
              return { ...q, ...updatedQuizData };
            }
            return q;
          });
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
    } else {
      // Saved Course Mode (via REST API)
      if (quizMode === "create" || !selectedQuizState) {
        try {
          const resQuiz = await createQuizService({
            title: updatedQuizData.title || (composeLessonId ? "Lesson Quiz" : "Module Quiz"),
            description: updatedQuizData.description || "",
            passingScore: Number(updatedQuizData.passingScore) || 70,
            timeLimit: Number(updatedQuizData.timeLimit) || 30,
            isPublished: updatedQuizData.isPublished !== false,
            courseId,
            moduleId: composeModuleId || null,
            lessonId: composeLessonId || null,
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

          showToast(composeLessonId ? "Lesson quiz created successfully!" : "Module quiz created successfully!", "success");
          setSelectedQuizState(resQuiz);
          setComposeQuizId(resQuiz.id);
          setQuizMode("view");
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
        } catch (err) {
          console.error("Update Quiz Error:", err);
          showToast(err?.response?.data?.message || "Failed to update quiz.", "error");
        }
      }
    }
  };

  const handleDuplicateQuiz = async (quiz, mod = null, lesson = null) => {
    const dupId = `draft-quiz-${lesson ? "lesson" : mod ? "mod" : "course"}-${Date.now()}`;
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

      if (lesson && mod) {
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
      handleSelectQuiz(duplicatedQuiz, mod, lesson, { startEditing: false });
    } else {
      try {
        await api.post("/quizzes", {
          ...quiz,
          title: `${quiz.title || "Quiz"} (Copy)`,
          courseId,
          moduleId: mod?.id || null,
          lessonId: lesson?.id || null,
        });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES] });
        showToast("Quiz duplicated successfully!", "success");
      } catch (err) {
        showToast("Failed to duplicate quiz.", "error");
      }
    }
  };

  const handleDeleteQuiz = async (e, quiz, mod = null, lesson = null) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${quiz.title || "this quiz"}"?`)) return;

    if (isDraftMode) {
      const qTargetId = quiz.id || quiz._id;
      let nextDraftQuizzes = draftQuizzes.filter((q) => String(q.id || q._id) !== String(qTargetId));
      let nextDraftModules = draftModules.map((m) => {
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

  const { module: composingModule, lesson: composingLesson } =
    findModuleAndLessonById(effectiveModules, composeLessonId);

  const activeModuleObj =
    effectiveModules.find((m) => m.id === composeModuleId) ||
    composingModule ||
    effectiveModules[0];
  const composingTopic = composingLesson?.topics?.find((t) => t.id === composeTopicId);
  const quizzesById = new Map();
  const allRawQuizzes = [
    ...(course?.quizzes || []),
    ...(effectiveCourseQuizzes || []),
    ...(draftQuizzes || []),
    ...(modules || []).flatMap((m) => m.quizzes || []),
    ...(effectiveModules || []).flatMap((m) => m.quizzes || []),
    ...(draftModules || []).flatMap((m) => m.quizzes || []),
    ...(effectiveModules || []).flatMap((m) => (m.lessons || []).flatMap((l) => l.quizzes || [])),
    ...(draftModules || []).flatMap((m) => (m.lessons || []).flatMap((l) => l.quizzes || [])),
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
      const nextMods = draftModules.filter((m) => m.id !== mod.id);
      setDraftModules(nextMods);
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
      const nextMods = draftModules.map((m) => {
        if (m.id === moduleId || (m.lessons || []).some((l) => l.id === lesson.id)) {
          return {
            ...m,
            lessons: (m.lessons || []).filter((l) => l.id !== lesson.id)
          };
        }
        return m;
      });
      setDraftModules(nextMods);
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
      setDraftModules(nextMods);
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
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-[#0D1021] border border-[#1A1F35] rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-white">Course Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested course could not be loaded.
        </p>
        <Link
          href="/instructor/courses"
          className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black transition"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const isPublished = effectiveCourse.status === "PUBLISHED";

  const courseMapEffectivelyOpen = mobileSidebarOpen || isCourseMapOpen;
  const sidebarWrapperClassName = mobileSidebarOpen
    ? "fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 p-4 shadow-2xl block shrink-0 overflow-y-auto"
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
        onAiClick={() => setAiModalOpen(true)}
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
            onToggleOpen={() => setIsCourseMapOpen((v) => !v)}
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
            onAddQuizToModule={handleAddModuleQuiz}
            onAddQuizToLesson={handleAddLessonQuiz}
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              {!isCourseMapOpen && !mobileSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsCourseMapOpen(true)}
                  className="hidden lg:flex shrink-0 h-9 w-9 items-center justify-center rounded-full border border-orange-500/50 bg-slate-900 text-orange-400 shadow-md transition hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-300 cursor-pointer"
                  aria-label="Show course map"
                  title="Show course map"
                >
                  <PanelLeftOpen size={16} />
                </button>
              )}
              <div>
                <div className="text-xs font-semibold text-orange-400 mb-0.5">
                  {composerMode === "course" && `Course Overview`}
                  {composerMode === "quiz" && (quizMode === "create" ? (composeLessonId ? "New Lesson Quiz Creation" : "New Module Quiz Creation") : `Quiz Overview`)}
                  {composerMode === "lesson" && `Lesson: ${composingLesson?.title || "Lesson Overview"}`}
                  {composerMode === "module" && `Module: ${activeModuleObj?.title || "Module Cells"}`}
                  {composerMode === "topic" && `Topic: ${composingTopic?.title || "Topic Composer"}`}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {composerMode === "course" && (effectiveCourse?.title || "Course Overview Header")}
                  {composerMode === "quiz" && (quizMode === "create" ? `Create Quiz for ${composeLessonId ? (composingLesson?.title || "Lesson") : (activeModuleObj?.title || "Module")}` : (activeQuizObj?.title || "Quiz Details"))}
                  {composerMode === "lesson" && (composingLesson?.title || "Lesson Overview Header")}
                  {composerMode === "module" && (activeModuleObj?.title || "Module Cells Notebook")}
                  {composerMode === "topic" && (composingTopic?.title || "Topic Cells Notebook")}
                </h2>
              </div>
            </div>
          </div>

          {/* Notebook Workspace Dynamic View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-xl">
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
                quiz={activeQuizObj}
                quizMode={quizMode}
                moduleTitle={activeModuleObj?.title}
                lessonTitle={composeLessonId ? composingLesson?.title : null}
                onSaveQuiz={handleSaveQuiz}
                onCancel={handleSelectCourseOverview}
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
                onAddQuiz={composingLesson ? () => handleAddLessonQuiz(composingLesson, composingModule) : undefined}
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

      {/* AI Course Composer Modal */}
      <AiComposerModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </div>
  );
}
