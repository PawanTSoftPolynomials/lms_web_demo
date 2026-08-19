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

import { CourseComposerHeader } from "@/components/instructor/courses/CourseComposerHeader";
import { CourseComposerSidebar } from "@/components/instructor/courses/CourseComposerSidebar";
import { CourseOverviewView } from "@/components/instructor/courses/CourseOverviewView";
import { LessonOverviewView } from "@/components/instructor/courses/LessonOverviewView";
import { EntityFormModal } from "@/components/instructor/courses/EntityFormModal";
import { PublishValidationModal } from "@/components/instructor/courses/PublishValidationModal";
import { UnpublishModal } from "@/components/instructor/courses/UnpublishModal";
import { DeleteCourseModal } from "@/components/instructor/courses/DeleteCourseModal";

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

  // Active Workspace Selection: 'course' | 'lesson' | 'module' | 'topic'
  const [composerMode, setComposerMode] = useState("course");
  const [composeLessonId, setComposeLessonId] = useState(searchParams.get("compose") || null);
  const [composeModuleId, setComposeModuleId] = useState(null);
  const [composeTopicId, setComposeTopicId] = useState(null);
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
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Ensures all modules, lessons, topics, and contents have non-empty string IDs in draft mode
  const ensureDraftIds = (modules = []) =>
    modules.map((mod, mIdx) => {
      const modId = mod.id || `draft-mod-${mIdx + 1}`;
      return {
        ...mod,
        id: modId,
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

  // Load temporary draft from sessionStorage if in draft mode
  useEffect(() => {
    if (isDraftMode) {
      try {
        const raw = sessionStorage.getItem("imported_course_draft");
        if (raw) {
          const parsed = JSON.parse(raw);
          setDraftData(parsed);
          setDraftModules(ensureDraftIds(parsed.modules || []));
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
      } : null)
    : course;

  const effectiveModules = isDraftMode ? draftModules : modules;
  const effectiveLoading = isDraftMode ? (!draftLoaded || !draftData) : (courseLoading || modulesLoading);
  const effectiveError = isDraftMode ? (draftLoaded && !draftData) : (courseError || !course);

  // Selection Handlers
  const handleSelectCourseOverview = () => {
    setComposerMode("course");
    setComposeLessonId(null);
    setComposeModuleId(null);
    setMobileSidebarOpen(false);
  };

  const handleSelectLesson = (lessonId) => {
    setComposeLessonId(lessonId);
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
    setComposerMode("module");
    if (lessonId) {
      setComposeLessonId(lessonId);
    }
    setMobileSidebarOpen(false);
  };

  const handleSelectTopic = (topicId, lessonId, moduleId) => {
    setComposeTopicId(topicId);
    setComposeLessonId(lessonId);
    setComposeModuleId(moduleId);
    setComposerMode("topic");
    setMobileSidebarOpen(false);
  };

  const handleSelectContent = (content, topic, lesson, mod) => {
    setComposeTopicId(topic.id);
    setComposeLessonId(lesson.id);
    setComposeModuleId(mod.id);
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

  const activeModuleObj = composingModule || effectiveModules.find((m) => m.id === composeModuleId) || effectiveModules[0];
  const composingTopic = composingLesson?.topics?.find((t) => t.id === composeTopicId);

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
    ? "fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 p-4 shadow-2xl block shrink-0"
    : `hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
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
            composerMode={composerMode}
            composeModuleId={composeModuleId}
            composeLessonId={composeLessonId}
            composeTopicId={composeTopicId}
            selectedCellId={selectedCellId}
            isOpen={courseMapEffectivelyOpen}
            onToggleOpen={() => setIsCourseMapOpen((v) => !v)}
            onSelectCourseOverview={handleSelectCourseOverview}
            onSelectLesson={handleSelectLesson}
            onSelectModule={handleSelectModule}
            onSelectTopic={handleSelectTopic}
            onSelectContent={handleSelectContent}
            onAddModule={() => openEntityModal({ entity: "module", mode: "create", courseId })}
            onEditModule={(mod) => openEntityModal({ entity: "module", mode: "edit", entityData: mod })}
            onAddLesson={(targetModuleId) =>
              openEntityModal({ entity: "lesson", mode: "create", parentId: targetModuleId || composeModuleId || modules[0]?.id })
            }
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
                  {composerMode === "lesson" && `Lesson: ${composingLesson?.title || "Lesson Overview"}`}
                  {composerMode === "module" && `Module: ${activeModuleObj?.title || "Module Cells"}`}
                  {composerMode === "topic" && `Topic: ${composingTopic?.title || "Topic Composer"}`}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {composerMode === "course" && (effectiveCourse?.title || "Course Overview Header")}
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
                onAddModule={() => openEntityModal({ entity: "module", mode: "create", courseId })}
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
                modules={effectiveModules.filter((m) =>
                  (m.lessons || []).some((l) => l.id === composeLessonId)
                )}
                onSelectModule={handleSelectModule}
                onAddModule={() => openEntityModal({ entity: "module", mode: "create", courseId })}
              />
            )}

            {composerMode === "module" && activeModuleObj && (() => {
              const effectiveLesson =
                composingLesson ||
                activeModuleObj.lessons?.[0] ||
                effectiveModules.flatMap((m) => m.lessons || [])[0];
              const effectiveTopic = effectiveLesson?.topics?.[0];
              const effectiveTopicId = effectiveTopic?.id;
              return (
                <LessonComposerPanel
                  topicId={effectiveTopicId}
                  selectedCellId={selectedCellId}
                  onSelectCell={setSelectedCellId}
                  draftContents={isDraftMode ? effectiveTopic?.contents || [] : undefined}
                  isDraftMode={isDraftMode}
                />
              );
            })()}

            {composerMode === "topic" && (
              <LessonComposerPanel
                topicId={composeTopicId}
                selectedCellId={selectedCellId}
                onSelectCell={setSelectedCellId}
                autoOpenAddSignal={autoOpenAddSignal}
                draftContents={isDraftMode ? composingTopic?.contents || [] : undefined}
                isDraftMode={isDraftMode}
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
    </div>
  );
}
