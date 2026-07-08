"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {
    Award,
    ClipboardCheck,
    ArrowLeft,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";

export default function QuizResultPage() {
    const {quizId} = useParams();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quiz Result"
                subtitle="View your quiz performance and results."
            />

            <Card className="p-10">
                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
                        <Award className="h-10 w-10 text-orange-500"/>
                    </div>

                    <h2 className="text-3xl font-bold text-white">
                        Result Not Available
                    </h2>

                    <p className="mt-4 max-w-lg text-slate-400">
                        Quiz results are not available yet because
                        the backend result API has not been
                        integrated.
                    </p>

                    <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                            <p className="text-sm text-slate-400">
                                Score
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                —
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                            <p className="text-sm text-slate-400">
                                Percentage
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                —
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                            <p className="text-sm text-slate-400">
                                Status
                            </p>

                            <p className="mt-2 text-3xl font-bold text-white">
                                —
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-left">
                        <div className="flex items-center gap-3">
                            <ClipboardCheck className="h-5 w-5 text-orange-500"/>

                            <h3 className="text-lg font-semibold text-white">
                                Backend Integration Pending
                            </h3>
                        </div>

                        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-400">
                            <li>Submit quiz API</li>
                            <li>Quiz attempt history</li>
                            <li>Quiz result API</li>
                            <li>Correct/Wrong answer summary</li>
                            <li>Score and percentage</li>
                            <li>Review answers</li>
                        </ul>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link href="/student/quizzes">
                            <Button className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4"/>
                                Back to Quizzes
                            </Button>
                        </Link>

                        <Link href={`/student/attempt/${quizId}`}>
                            <Button className="bg-slate-700 hover:bg-slate-600">
                                Retry Quiz
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}