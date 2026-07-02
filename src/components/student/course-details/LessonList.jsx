import {
    BookOpen,
    PlayCircle,
    FileText,
    Clock,
} from "lucide-react";

export default function LessonList({
                                       lessons = [],
                                   }) {
    if (!lessons.length) {
        return (
            <div className="rounded-lg border border-dashed border-slate-700 p-5 text-center">
                <p className="text-sm text-slate-400">
                    No lessons available in this module.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {lessons.map((lesson, index) => {
                const contentCount =
                    lesson.contents?.length || 0;

                const videoCount =
                    lesson.contents?.filter(
                        (content) => content.type === "VIDEO"
                    ).length || 0;

                const documentCount =
                    lesson.contents?.filter(
                        (content) =>
                            content.type === "FILE" ||
                            content.type === "HTML"
                    ).length || 0;

                return (
                    <div
                        key={lesson.id}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-orange-500/40"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <div className="mt-1 rounded-lg bg-orange-500/10 p-2 text-orange-500">
                                    <BookOpen className="h-5 w-5" />
                                </div>

                                <div>
                                    <h4 className="font-semibold text-white">
                                        Lesson {index + 1}: {lesson.title}
                                    </h4>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {lesson.description}
                                    </p>
                                </div>
                            </div>

                            {!lesson.isPublished && (
                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                  Draft
                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <PlayCircle className="h-4 w-4 text-orange-500" />
                                <span>
                  {videoCount} Video
                                    {videoCount !== 1 ? "s" : ""}
                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-orange-500" />
                                <span>
                  {documentCount} Resource
                                    {documentCount !== 1 ? "s" : ""}
                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span>
                  {contentCount} Content Item
                                    {contentCount !== 1 ? "s" : ""}
                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}