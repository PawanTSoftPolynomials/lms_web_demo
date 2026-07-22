"use client";

import Link from "next/link";
import { FaPlus, FaLayerGroup, FaCloudUploadAlt } from "react-icons/fa";
import Card from "@/components/ui/Card";

export default function EmptyQuestions({ quizId, onImport }) {
    return (<Card className="py-20">
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
                ❓
            </div>

            <h2 className="text-3xl font-bold text-white">
                No Questions Found
            </h2>

            <p className="mt-4 text-slate-400">
                This quiz does not have any questions yet.
                Choose a method below to add your first questions.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {/* Single */}
                <Link
                    href={`/instructor/questions/create/${quizId}`}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-medium text-white transition hover:bg-orange-700"
                >
                    <FaPlus size={14} />
                    Add Question
                </Link>

                {/* Bulk */}
                <Link
                    href={`/instructor/questions/bulk/${quizId}`}
                    className="flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 px-5 py-3 font-medium text-orange-400 transition hover:bg-orange-500/20"
                >
                    <FaLayerGroup size={14} />
                    Add Multiple
                </Link>

                {/* Import */}
                <button
                    type="button"
                    onClick={onImport}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-medium text-slate-300 transition hover:border-orange-500/50 hover:text-orange-400"
                >
                    <FaCloudUploadAlt size={14} />
                    Import File
                </button>
            </div>
        </div>
    </Card>);
}