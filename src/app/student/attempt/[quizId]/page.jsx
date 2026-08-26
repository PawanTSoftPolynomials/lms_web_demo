"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Loader from "@/components/common/Loader";
import QuizExperience from "@/components/student/attempt/QuizExperience";

function QuizAttemptPageContent() {
    const { quizId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Where to send the student after they submit — set by whichever page
    // launched this quiz (e.g. the lesson's Assessment Quiz panel), so the
    // result page can return them there instead of the generic quizzes hub.
    const from = searchParams.get("from");

    return (
        <div className="space-y-3 pb-3 max-w-full">
            <QuizExperience
                quizId={quizId}
                onBack={() => router.back()}
                resultReturnTo={from}
            />
        </div>
    );
}

export default function QuizAttemptPage() {
    return (
        <Suspense fallback={<Loader />}>
            <QuizAttemptPageContent />
        </Suspense>
    );
}
