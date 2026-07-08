"use client";

import Link from "next/link";
import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import ActionMenu from "@/components/menus/ActionMenu";
import Card from "@/components/ui/Card";

import {useModule} from "@/hooks/queries/instructor/useModule";
import {useLessons} from "@/hooks/queries/instructor/useLessons";
import {useDeleteLesson} from "@/hooks/queries/instructor/useDeleteLesson";

export default function ModuleDetailsPage() {
    const {moduleId} = useParams();
    const router = useRouter();

    const {
        data: module,
        isLoading: moduleLoading,
        isError: moduleError,
    } = useModule(moduleId);

    const {
        data: lessons = [],
        isLoading: lessonsLoading,
        isError: lessonsError,
    } = useLessons(moduleId);

    const deleteLessonMutation = useDeleteLesson();

    const handleDelete = async (lessonId) => {
        if (!confirm("Delete this lesson?")) return;

        try {
            await deleteLessonMutation.mutateAsync({
                lessonId,
                moduleId,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (moduleLoading || lessonsLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (moduleError || lessonsError || !module) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Failed to load module
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Please try again later.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Module Header */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                <h1 className="mb-4 text-4xl font-bold text-white">
                    {module.title}
                </h1>

                <p className="text-lg text-slate-400">
                    {module.description}
                </p>
            </div>

            {/* Lessons Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">
                        Lessons
                    </h2>

                    <p className="mt-1 text-slate-400">
                        Manage lessons and contents.
                    </p>
                </div>

                <Link
                    href={`/instructor/lessons/create/${moduleId}`}
                    className="rounded-xl bg-orange-600 px-5 py-3 text-white transition hover:bg-orange-700"
                >
                    Add Lesson
                </Link>
            </div>

            {lessons.length === 0 ? (
                <Card>
                    <div className="py-16 text-center">
                        <h3 className="text-2xl font-semibold">
                            No Lessons Found
                        </h3>

                        <p className="mt-2 text-slate-400">
                            Create your first lesson.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {lessons.map((lesson) => (
                        <Card
                            key={lesson.id}
                            onClick={() =>
                                router.push(
                                    `/instructor/lessons/${lesson.id}`
                                )
                            }
                            className="
                cursor-pointer
                transition
                hover:border-orange-500
                hover:-translate-y-1
              "
                        >
                            <div className="flex flex-col gap-5">
                                <div>
                                    <div className="mb-4 flex items-start justify-between">
                                        <h3 className="text-2xl font-semibold">
                                            {lesson.title}
                                        </h3>

                                        <div
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: "View",
                                                        onClick: () =>
                                                            router.push(
                                                                `/instructor/lessons/${lesson.id}`
                                                            ),
                                                    },
                                                    {
                                                        label: "Edit",
                                                        onClick: () =>
                                                            router.push(
                                                                `/instructor/lessons/edit/${lesson.id}`
                                                            ),
                                                    },
                                                    {
                                                        label: "Delete",
                                                        onClick: () =>
                                                            handleDelete(
                                                                lesson.id
                                                            ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <p className="line-clamp-3 text-slate-400">
                                        {lesson.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm text-orange-400">
                    Lesson
                  </span>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            router.push(
                                                `/instructor/lessons/${lesson.id}`
                                            );
                                        }}
                                        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium transition hover:bg-orange-700"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}