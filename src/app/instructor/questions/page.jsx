"use client";

import QuestionRepositoryView from "@/components/instructor/questions/QuestionRepositoryView";

export default function QuestionRepositoryPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <QuestionRepositoryView />
      </div>
    </div>
  );
}
