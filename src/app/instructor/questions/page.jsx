"use client";

import QuestionRepositoryView from "@/components/instructor/questions/QuestionRepositoryView";

export default function QuestionRepositoryPage() {
  return (
    // DashboardLayout's <main> already supplies the page padding — no extra
    // wrapper padding here, or it stacks into a large gap under the navbar.
    <div className="max-w-7xl mx-auto w-full">
      <QuestionRepositoryView />
    </div>
  );
}
