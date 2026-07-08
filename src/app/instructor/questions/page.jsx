"use client";

import {useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import {useQuizzes} from "@/hooks/queries/instructor/useQuizzes";

export default function QuizzesPage() {
    const router = useRouter();

    const {
        data: quizzes = [], isLoading, isError,
    } = useQuizzes();

    if (isLoading) {
        return (<div className="flex justify-center py-20">
            <Loader/>
        </div>);
    }

    if (isError) {
        return (<Card>
            <div className="py-16 text-center">
                <h2 className="text-2xl font-semibold">
                    Failed to Load Quizzes
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </div>
        </Card>);
    }

    return (<div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-white">
                Quizzes
            </h1>

            <p className="mt-2 text-slate-400">
                Browse all quizzes.
            </p>
        </div>

        {!quizzes.length ? (<Card>
            <div className="py-16 text-center">
                <h2 className="text-2xl font-semibold">
                    No Quizzes Found
                </h2>

                <p className="mt-2 text-slate-400">
                    There are no quizzes available.
                </p>
            </div>
        </Card>) : (<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (<Card
                key={quiz.id}
                onClick={() => router.push(`/instructor/quizzes/view/${quiz.id}`)}
                className="
                                cursor-pointer
                                transition
                                hover:border-orange-500
                                hover:-translate-y-1
                            "
            >
                <div className="space-y-4">
                                <span
                                    className="
                                        inline-flex
                                        rounded-full
                                        bg-orange-500/15
                                        px-3
                                        py-1
                                        text-sm
                                        font-medium
                                        text-orange-400
                                    "
                                >
                                    Quiz
                                </span>

                    <h2 className="text-2xl font-semibold text-white">
                        {quiz.title}
                    </h2>

                    <p className="line-clamp-3 text-slate-400">
                        {quiz.description || "No description available."}
                    </p>

                    <div
                        className="flex justify-between border-t border-slate-800 pt-4 text-sm text-slate-400">
                                    <span>
                                        Passing:{" "}
                                        <span className="text-white">
                                            {quiz.passingScore}%
                                        </span>
                                    </span>

                        <span>
                                        Time:{" "}
                            <span className="text-white">
                                            {quiz.timeLimit || 0} min
                                        </span>
                                    </span>
                    </div>
                </div>
            </Card>))}
        </div>)}
    </div>);
}