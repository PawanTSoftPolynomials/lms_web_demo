"use client";

import QuestionRepositoryView from "@/components/instructor/questions/QuestionRepositoryView";

export default function WorkQuestionRepositoryPage() {
  return (
    <div className="rounded-2xl border border-[#1A1F35] bg-[#0D1021] p-5 sm:p-8">
      <QuestionRepositoryView showImportShortcuts />
    </div>
  );
}
