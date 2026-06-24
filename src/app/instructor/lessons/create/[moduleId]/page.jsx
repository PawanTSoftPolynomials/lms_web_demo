"use client";

import { useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import LessonForm from "@/components/lessons/LessonForm";

import {
  createLesson,
} from "@/services/lesson.service";

export default function CreateLesson() {
  const { moduleId } =
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

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      await createLesson({
        ...formData,
        moduleId,
      });

      router.push(
        `/instructor/modules/${moduleId}`
      );
    };

  return (
    <LessonForm
      title="Create Lesson"
      buttonText="Create Lesson"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
    />
  );
}