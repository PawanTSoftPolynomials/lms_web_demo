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
            className="group bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:border-orange-500/35 hover:shadow-luxury-lg transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
        >
            <div className="h-48 bg-slate-950 overflow-hidden relative border-b border-slate-800/60">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-out"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                        <span className="font-serif text-lg text-orange-500 tracking-widest uppercase">Studio Class</span>
                        <span className="text-[9px] text-slate-500 tracking-widest uppercase mt-1">Elite Member Exclusive</span>
                    </div>
                )}
            </div>

            <div className="p-6">
                <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">
                    {course.category}
                </span>

                <h3 className="mt-2 text-xl font-serif text-white tracking-tight leading-snug group-hover:text-orange-500 transition-colors duration-300">
                    {course.title}
                </h3>

                <p className="mt-2.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {course.description}
                </p>

                <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-4">
                    <span>{course.level}</span>

                    <span>
                        {course.modules?.length ?? 0} Modules
                    </span>
                </div>

                <div className="mt-2.5 flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>
                        {course.quizzes?.length ?? 0} Quizzes
                    </span>

                    <span className="text-emerald-500">{course.status}</span>
                </div>

                <Link
                    href={button.href}
                    className="mt-5 block rounded-lg bg-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-widest py-3 text-center transition-all duration-300 hover:bg-orange-600 active:translate-y-0.5 shadow-md"
                >
                    {button.label}
                </Link>
            </div>
        </div>
    );
}