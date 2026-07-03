"use client";

export default function ProgressOverview({
                                             completedLessons = 0,
                                             totalLessons = 0,
                                             percentage = 0,
                                         }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Overall Progress
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {completedLessons} of {totalLessons} lessons completed
                    </p>
                </div>

                <span className="text-3xl font-bold text-orange-500">
          {percentage}%
        </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}