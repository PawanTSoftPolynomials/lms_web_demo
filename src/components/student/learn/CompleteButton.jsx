"use client";

import { useState } from "react";

import {
  updateProgress,
} from "@/services/progress.service";

export default function CompleteButton({
  lessonId,
}) {
  const [completed,
    setCompleted] =
    useState(false);

  const handleComplete =
    async () => {
      try {
        await updateProgress({
          lessonId,
        });

        setCompleted(true);
      } catch (error) {
        console.error(error);
      }
    };

  return completed ? (
    <button
      disabled
      className="
        bg-green-700
        px-5
        py-3
        rounded-lg
      "
    >
      ✓ Completed
    </button>
  ) : (
    <button
      onClick={
        handleComplete
      }
      className="
        bg-green-600
        hover:bg-green-700
        px-5
        py-3
        rounded-lg
      "
    >
      Mark Complete
    </button>
  );
}