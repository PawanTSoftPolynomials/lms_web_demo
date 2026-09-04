"use client";

export default function ProgressOverview({
                                             completedLessons = 0,
                                             totalLessons = 0,
                                             percentage = 0,
                                         }) {
    return (
        <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Overall Progress
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {completedLessons} of {totalLessons} lessons completed
                    </p>
                </div>

                <span className="text-3xl font-bold text-primary">
          {percentage}%
        </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}