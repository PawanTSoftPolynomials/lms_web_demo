"use client";

import Input from "@/components/ui/Input";

export default function QuizFilters({
                                        search,
                                        setSearch,
                                        sortBy,
                                        setSortBy,
                                    }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex-1">
                    <Input
                        placeholder="Search quizzes..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                <div className="w-full lg:w-64">
                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                    >
                        <option value="latest">
                            Latest Added
                        </option>

                        <option value="title">
                            Quiz Name (A-Z)
                        </option>

                        <option value="questions">
                            Most Questions
                        </option>

                        <option value="passingScore">
                            Highest Passing Score
                        </option>

                        <option value="timeLimit">
                            Longest Duration
                        </option>
                    </select>
                </div>
            </div>
        </div>
    );
}