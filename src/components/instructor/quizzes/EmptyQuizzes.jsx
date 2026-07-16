"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function EmptyQuizzes({
                                         courseId,
                                     }) {
    const isGlobal = !courseId;

    return (
        <Card className="py-20">
            <div className="mx-auto max-w-lg text-center">
                <div
                    className="
            mx-auto
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-orange-500/10
            text-4xl
          "
                >
                    📝
                </div>

                <h2 className="text-3xl font-bold text-white">
                    No Quizzes Found
                </h2>

                <p className="mt-4 text-slate-400">
                    {isGlobal
                        ? "You have not created any quizzes yet. Choose a course first to create and manage quizzes."
                        : "This course does not have any quizzes yet. Create your first quiz to assess your students knowledge."}
                </p>

                <div className="mt-8">
                    <Link
                        href={isGlobal ? "/instructor/courses" : `/instructor/quizzes/create/${courseId}`}
                    >
                        <Button>
                            {isGlobal ? "Go to Courses" : "Create First Quiz"}
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}