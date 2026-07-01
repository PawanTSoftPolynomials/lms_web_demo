import Link from "next/link";

export default function CourseCard({
                                       course,
                                       action,
                                   }) {
    const button = action ?? {
        label: "View Course",
        href: `/courses/${course.id}`,
    };

    return (
        <div
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition hover:border-orange-500">
            <div className="h-48 bg-slate-800">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                        No Image
                    </div>
                )}
            </div>

            <div className="p-5">
        <span className="text-xs text-orange-400">
          {course.category}
        </span>

                <h3 className="mt-2 text-lg font-semibold">
                    {course.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {course.description}
                </p>

                <div className="mt-4 flex justify-between text-sm text-slate-400">
                    <span>{course.level}</span>

                    <span>
            {course.modules?.length ?? 0} Modules
          </span>
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>
            {course.quizzes?.length ?? 0} Quizzes
          </span>

                    <span>{course.status}</span>
                </div>

                <Link
                    href={button.href}
                    className="mt-4 block rounded-lg bg-orange-500 py-2 text-center font-medium transition hover:bg-orange-600"
                >
                    {button.label}
                </Link>
            </div>
        </div>
    );
}