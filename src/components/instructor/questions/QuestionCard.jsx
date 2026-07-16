"use client";

import {useRouter} from "next/navigation";

import {
    FaQuestionCircle,
    FaCheckCircle,
    FaStar,
} from "react-icons/fa";

import ActionMenu from "@/components/menus/ActionMenu";

export default function QuestionCard({
                                         question,
                                         courseId,
                                         onDelete,
                                     }) {
    const router = useRouter();

    const openQuestion = () => {
        router.push(
            `/instructor/courses/${courseId}/quizzes/${question.quizId}/questions/view/${question.id}`
        );
    };

    return (
        <div
            onClick={openQuestion}
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
                                <FaQuestionCircle size={20}/>
                            </div>

                            <div className="flex-1">
                                <h3 className="line-clamp-2 text-lg font-semibold text-white">
                                    {question.question}
                                </h3>

                                <p className="mt-3 text-sm text-slate-400">
                                    {Array.isArray(question.options)
                                        ? `${question.options.length} Options`
                                        : "No options"}
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
                                                `/instructor/courses/${courseId}/quizzes/${question.quizId}/questions/edit/${question.id}`
                                            ),
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () =>
                                            onDelete?.(
                                                question.id
                                            ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 border-t border-slate-800 pt-4">
                    <div className="mb-4 flex flex-wrap gap-3">
                        <span
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-orange-500/15
                                px-3
                                py-1
                                text-xs
                                font-medium
                                text-orange-400
                            "
                        >
                            <FaStar size={12}/>
                            {question.marks} Mark
                            {question.marks > 1
                                ? "s"
                                : ""}
                        </span>

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                bg-green-500/15
                                px-3
                                py-1
                                text-xs
                                font-medium
                                text-green-400
                            "
                        >
                            <FaCheckCircle
                                size={12}
                            />
                            Correct Answer
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openQuestion();
                        }}
                        className="
                            w-full
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
                        View Question
                    </button>
                </div>
            </div>
        </div>
    );
}