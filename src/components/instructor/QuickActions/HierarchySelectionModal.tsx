"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useInstructorCourses } from "@/hooks/queries/instructor/useInstructorCourses";
import { useModules } from "@/hooks/queries/instructor/useModules";
import { useLessons } from "@/hooks/queries/instructor/useLessons";

interface HierarchySelectionModalProps {
  open: boolean;
  onClose: () => void;
  type: "create-lesson" | "upload-content";
}

export function HierarchySelectionModal({ open, onClose, type }: HierarchySelectionModalProps) {
  const router = useRouter();
  
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const { data: courses = [] } = useInstructorCourses();
  const { data: modules = [], isLoading: loadingModules } = useModules(selectedCourseId);
  const { data: lessons = [], isLoading: loadingLessons } = useLessons(selectedModuleId);

  const handleClose = () => {
    setSelectedCourseId("");
    setSelectedModuleId("");
    setSelectedLessonId("");
    onClose();
  };

  const handleContinue = () => {
    if (type === "create-lesson" && selectedModuleId) {
      router.push(`/instructor/lessons/create/${selectedModuleId}`);
      handleClose();
    } else if (type === "upload-content" && selectedLessonId) {
      router.push(`/instructor/contents/create/${selectedLessonId}`);
      handleClose();
    }
  };

  const isContinueDisabled = type === "create-lesson" ? !selectedModuleId : !selectedLessonId;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={type === "create-lesson" ? "Create New Lesson" : "Upload Content"}
      size="md"
    >
      <div className="space-y-6 text-slate-200 p-2">
        <p className="text-sm text-slate-400">
          {type === "create-lesson"
            ? "Please select the course and module where you want to create the lesson."
            : "Please select the course, module, and lesson where you want to upload content."}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Course</label>
            <select
              className="w-full bg-[#0D1021] border border-[#1A1F35] text-sm px-4 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500 transition-colors"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId("");
                setSelectedLessonId("");
              }}
            >
              <option value="">Select a course...</option>
              {courses.map((course: { id: string; title: string }) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Module</label>
            <select
              className="w-full bg-[#0D1021] border border-[#1A1F35] text-sm px-4 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500 transition-colors disabled:opacity-50"
              value={selectedModuleId}
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
                setSelectedLessonId("");
              }}
              disabled={!selectedCourseId || loadingModules}
            >
              <option value="">Select a module...</option>
              {modules.map((module: { id: string; title: string }) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          {type === "upload-content" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Lesson</label>
              <select
                className="w-full bg-[#0D1021] border border-[#1A1F35] text-sm px-4 py-2.5 rounded-xl outline-none text-slate-200 focus:border-orange-500 transition-colors disabled:opacity-50"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                disabled={!selectedModuleId || loadingLessons}
              >
                <option value="">Select a lesson...</option>
                {lessons.map((lesson: { id: string; title: string }) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#1A1F35]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
