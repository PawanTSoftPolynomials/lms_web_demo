"use client";

import { useRouter } from "next/navigation";

import {
    FaClock,
    FaQuestionCircle,
    FaClipboardList,
} from "react-icons/fa";

import ActionMenu from "@/components/menus/ActionMenu";

export default function QuizCard({
                                     quiz,
                                     onDelete,
                                 }) {
    const router = useRouter();

    const openQuiz = () => {
        router.push(
            `/instructor/courses/${quiz.courseId}/quizzes/${quiz.id}`
        );
    };

    return (
        <div
            onClick={openQuiz}
            className="
        cursor-pointer
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-500
      "
        >
            <div className="flex h-full flex-col justify-between">
                {/* Header */}
                <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex flex-1 items-start gap-4">
                            <div
                                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-500/15
                  text-orange-400
                "
                            >
                                <FaClipboardList size={20} />
                            </div>

                            <div className="flex-1">
                                <h3 className="line-clamp-1 text-xl font-semibold text-white">
                                    {quiz.title}
                                </h3>

                                <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                                    {quiz.description ||
                                        "No description available."}
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <ActionMenu
                                items={[
                                    {
                                        label: "Edit",
                                        onClick: () =>
                                            router.push(
                                                `/instructor/courses/${quiz.courseId}/quizzes/edit/${quiz.id}`
                                            ),
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () =>
                                            onDelete?.(quiz.id),
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FaClock className="text-orange-400" />

                            <span>
                {quiz.timeLimit} min
              </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                            <FaQuestionCircle className="text-green-400" />

                            <span>
                Pass: {quiz.passingScore}%
              </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
            <span
                className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-medium
                ${
                    quiz.isPublished
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                }
              `}
            >
              {quiz.isPublished
                  ? "Published"
                  : "Draft"}
            </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();

                                openQuiz();
                            }}
                            className="
                rounded-lg
                bg-orange-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-orange-700
              "
                        >
                            Manage Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}