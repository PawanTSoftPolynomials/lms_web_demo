"use client";

import { useState } from "react";
import {
  FileText,
  BookOpen,
  Link2,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import CourseChat from "@/components/chat/CourseChat";

export default function LessonTabs({ lesson, course }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!lesson) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Select a lesson to view its details.
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BookOpen,
    },
    {
      id: "resources",
      label: "Resources",
      icon: Link2,
    },
    {
      id: "notes",
      label: "Notes",
      icon: FileText,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: ClipboardList,
    },
    {
      id: "discussion",
      label: "Discussion",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              {lesson.title}
            </h2>

            <p className="leading-7 text-slate-300">
              {lesson.description || "No description available."}
            </p>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Learning Resources
            </h2>

            {lesson.contents?.length ? (
              <div className="space-y-3">
                {lesson.contents.map((content) => (
                  <div
                    key={content.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="font-medium text-white">{content.title}</p>

                    <p className="mt-2 text-sm text-slate-400">
                      Type: {content.type}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No resources available.</p>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Notes</h2>

            <textarea
              rows={10}
              placeholder="Write your personal notes..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none focus:border-orange-500"
            />
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Course Quiz</h2>

            {course?.quizzes?.length ? (
              <div className="space-y-3">
                {course.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                  >
                    <h3 className="font-semibold text-white">{quiz.title}</h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {quiz.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>Passing Score: {quiz.passingScore}%</span>

                      <span>{quiz.questions.length} Questions</span>
                    </div>

                    <button className="mt-4 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white transition hover:bg-orange-700">
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">
                No quizzes available for this course.
              </p>
            )}
          </div>
        )}

        {activeTab === "discussion" && (
          <CourseChat course={course} courseId={course?.id} />
        )}
      </div>
    </div>
  );
}
