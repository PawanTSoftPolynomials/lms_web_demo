"use client";

import Link from "next/link";
import {useParams, useRouter} from "next/navigation";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";

import LessonHeader from "@/components/instructor/lessons/LessonHeader";

import {useLesson} from "@/hooks/queries/instructor/useLesson";
import {useDeleteLesson} from "@/hooks/queries/instructor/useDeleteLesson";
import {useModule} from "@/hooks/queries/instructor/useModule";

import {useContents} from "@/hooks/queries/instructor/useContents";

import ActionMenu from "@/components/menus/ActionMenu";

export default function LessonDetailsPage() {
    const params = useParams();
    const lessonId = params.lessonId;

    const router = useRouter();

    const {
        data: lesson,
        isLoading: lessonLoading,
        isError: lessonError,
    } = useLesson(lessonId);

    const { data: moduleData } = useModule(lesson?.moduleId, { enabled: !!lesson?.moduleId });

    const moduleId = params.moduleId || lesson?.moduleId;
    const courseId = params.courseId || moduleData?.courseId;

    const {
        data: contents = [],
        isLoading: contentLoading,
        isError: contentError,
    } = useContents(lessonId);

    const deleteLessonMutation =
        useDeleteLesson();

    const handleDelete = async () => {
        if (!confirm("Delete this lesson?")) {
            return;
        }

        try {
            await deleteLessonMutation.mutateAsync({
                lessonId,
                moduleId: lesson.moduleId,
            });

            router.push(
                `/instructor/courses/${courseId}/modules/${moduleId}`
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (lessonLoading || contentLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (
        lessonError ||
        contentError ||
        !lesson
    ) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Failed to load lesson
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
            <LessonHeader lesson={lesson}/>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">
                        Contents
                    </h2>

                    <p className="mt-1 text-slate-400">
                        Manage lesson contents.
                    </p>
                </div>

                <Link
                    href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/create`}
                    className="
            rounded-xl
            bg-orange-600
            px-5
            py-3
            text-white
            transition
            hover:bg-orange-700
          "
                >
                    Add Content
                </Link>
            </div>

            {!contents.length ? (
                <Card>
                    <div className="py-16 text-center">
                        <h3 className="text-2xl font-semibold">
                            No Contents Found
                        </h3>

                        <p className="mt-2 text-slate-400">
                            Add your first content.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {contents.map((content) => (
                        <Card
                            key={content.id}
                            className="
          transition
          hover:border-orange-500
        "
                        >
                            <div className="flex flex-col gap-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {content.title}
                                        </h3>

                                        <span
                                            className="
                  mt-3
                  inline-block
                  rounded-full
                  bg-orange-500/15
                  px-3
                  py-1
                  text-sm
                  text-orange-400
                "
                                        >
                {content.type}
              </span>
                                    </div>

                                    <ActionMenu
                                        items={[
                                            {
                                                label: "View",
                                                onClick: () =>
                                                    router.push(
                                                        `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${content.id}`
                                                    ),
                                            },
                                            {
                                                label: "Edit",
                                                onClick: () =>
                                                    router.push(
                                                        `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/edit/${content.id}`
                                                    ),
                                            },
                                            {
                                                label: "Delete",
                                                onClick: () =>
                                                    console.log("Delete Content"),
                                            },
                                        ]}
                                    />
                                </div>

                                <div className="flex justify-between border-t border-slate-800 pt-4">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/contents/${content.id}`
                                            )
                                        }
                                        className="
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
                                        View Content
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