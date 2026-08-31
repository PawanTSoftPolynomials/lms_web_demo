"use client";

import QuestionRepositoryView from "@/components/instructor/questions/QuestionRepositoryView";

export default function WorkQuestionRepositoryPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
      <QuestionRepositoryView showImportShortcuts />
    </div>
  );
}
