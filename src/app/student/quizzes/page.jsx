"use client";

import {useMemo, useState} from "react";

import Loader from "@/components/common/Loader";
import PageHeader from "@/components/layouts/PageHeader";
import Card from "@/components/ui/Card";

import QuizStats from "@/components/student/quizzes/QuizStats";
import QuizFilters from "@/components/student/quizzes/QuizFilters";
import QuizTable from "@/components/student/quizzes/QuizTable";

import useQuizzes from "@/hooks/queries/student/useQuizzes";

export default function StudentQuizzesPage() {
    const {
        data: quizzes = [],
        isLoading,
        isError,
    } = useQuizzes();

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] =
        useState("latest");

    const filteredQuizzes = useMemo(() => {
        let result = [...quizzes];

        // Search
        if (search.trim()) {
            const keyword =
                search.toLowerCase();

            result = result.filter(
                (quiz) =>
                    quiz.title
                        ?.toLowerCase()
                        .includes(keyword) ||
                    quiz.description
                        ?.toLowerCase()
                        .includes(keyword)
            );
        }

        // Sorting
        switch (sortBy) {
            case "title":
                result.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                break;

            case "questions":
                result.sort(
                    (a, b) =>
                        (b._count?.questions ?? 0) -
                        (a._count?.questions ?? 0)
                );
                break;

            case "passingScore":
                result.sort(
                    (a, b) =>
                        b.passingScore -
                        a.passingScore
                );
                break;

            case "timeLimit":
                result.sort(
                    (a, b) =>
                        b.timeLimit -
                        a.timeLimit
                );
                break;

            case "latest":
            default:
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                );
        }

        return result;
    }, [quizzes, search, sortBy]);

    if (isLoading) {
        return <Loader/>;
    }

    if (isError) {
        return (
            <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold text-white">
                    Unable to load quizzes
                </h2>

                <p className="mt-2 text-slate-400">
                    Please try again later.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Quizzes"
                subtitle="Test your knowledge by attempting quizzes assigned to your courses."
            />

            <QuizStats
                quizzes={quizzes}
            />

            <QuizFilters
                search={search}
                setSearch={setSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            <QuizTable
                quizzes={filteredQuizzes}
            />
        </div>
    );
}