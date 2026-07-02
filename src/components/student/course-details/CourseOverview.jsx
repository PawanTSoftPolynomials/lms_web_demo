import Card from "@/components/ui/Card";

export default function CourseOverview({
                                           course,
                                       }) {
    if (!course) return null;

    const totalModules =
        course.modules?.length || 0;

    const totalLessons =
        course.modules?.reduce(
            (count, module) =>
                count +
                (module.lessons?.length || 0),
            0
        ) || 0;

    const totalContents =
        course.modules?.reduce(
            (count, module) =>
                count +
                (module.lessons?.reduce(
                    (lessonCount, lesson) =>
                        lessonCount +
                        (lesson.contents?.length || 0),
                    0
                ) || 0),
            0
        ) || 0;

    const totalQuizzes =
        course.quizzes?.length || 0;

    return (
        <Card className="p-6">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Course Overview
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Learn what this course contains before
                        you begin.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <OverviewItem
                        title="Modules"
                        value={totalModules}
                    />

                    <OverviewItem
                        title="Lessons"
                        value={totalLessons}
                    />

                    <OverviewItem
                        title="Learning Contents"
                        value={totalContents}
                    />

                    <OverviewItem
                        title="Quizzes"
                        value={totalQuizzes}
                    />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                    <h3 className="font-semibold text-white">
                        About this course
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                        {course.description}
                    </p>
                </div>
            </div>
        </Card>
    );
}

function OverviewItem({
                          title,
                          value,
                      }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center">
            <p className="text-sm text-slate-400">
                {title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-orange-500">
                {value}
            </h3>
        </div>
    );
}