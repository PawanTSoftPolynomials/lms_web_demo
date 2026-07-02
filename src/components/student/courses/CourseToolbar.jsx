import Button from "@/components/ui/Button";

export default function CourseToolbar({
                                          totalCourses = 0,
                                          activeFilters = 0,
                                          onResetFilters,
                                      }) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Browse Courses
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    {totalCourses} course
                    {totalCourses !== 1 ? "s" : ""} available
                    {activeFilters > 0 &&
                        ` • ${activeFilters} filter${
                            activeFilters > 1 ? "s" : ""
                        } applied`}
                </p>
            </div>

            <Button
                type="button"
                onClick={onResetFilters}
                disabled={activeFilters === 0}
            >
                Reset Filters
            </Button>
        </div>
    );
}