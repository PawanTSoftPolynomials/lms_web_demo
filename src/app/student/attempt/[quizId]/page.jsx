"use client";

import { useParams } from "next/navigation";

import QuizExperience from "@/components/student/attempt/QuizExperience";

export default function QuizAttemptPage() {
    const { quizId } = useParams();

    return <QuizExperience quizId={quizId} />;
}
