"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import LessonForm from "@/components/lessons/LessonForm";

import {
  getLessonById,
  updateLesson,
} from "@/services/lesson.service";

export default function EditLesson() {
  const { lessonId } =
    useParams();

  const router =
    useRouter();

  const [formData,
    setFormData] =
    useState({
      title: "",
      description: "",
      order: 1,
    });

  useEffect(() => {
    const loadLesson =
      async () => {
        const lesson =
          await getLessonById(
            lessonId
          );

        setFormData({
          title:
            lesson.title,
          description:
            lesson.description,
          order:
            lesson.order,
        });
      };

    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      await updateLesson(
        lessonId,
        formData
      );

      router.push(
        `/instructor/lessons/${lessonId}`
      );
    };

  return (
    <LessonForm
      title="Edit Lesson"
      buttonText="Update Lesson"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
    />
  );
}