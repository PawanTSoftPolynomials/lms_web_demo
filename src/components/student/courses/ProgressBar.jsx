export default function ProgressBar({
                                        value = 0,
                                        size = "md",
                                        variant = "solid",
                                        showLabel = false,
                                    }) {
    const progress = Math.min(
        Math.max(Number(value) || 0, 0),
        100
    );

    const heights = {
        xs: "h-1.5",
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
    };

    // "solid" (default) is the original flat-orange look every existing
    // consumer already renders — untouched. "gradient" is the thin
    // orange-to-pink bar used on the student Learn page.
    const trackClass = variant === "gradient" ? "bg-background border border-border" : "bg-slate-700";
    const fillClass =
        variant === "gradient"
            ? "bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
            : "bg-primary transition-all duration-500 ease-out";

    return (
        <div className="space-y-2">
            {showLabel && (
                <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Progress
          </span>

                    <span className="font-medium text-primary">
            {progress}%
          </span>
                </div>
            )}

            <div
                className={`w-full rounded-full overflow-hidden ${trackClass} ${heights[size]}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
            >
                <div
                    className={`h-full rounded-full ${fillClass}`}
                    style={{width: `${progress}%`}}
                />
            </div>
        </div>
    );
}