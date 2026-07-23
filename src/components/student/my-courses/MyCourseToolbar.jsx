import { Search } from "lucide-react";

export default function MyCourseToolbar({
    search,
    setSearch,
    sortBy,
    setSortBy,
}) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="w-full md:max-w-md relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search enrolled courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-850 bg-slate-955 text-xs font-semibold text-white focus:outline-none focus:border-orange-500 transition"
                />
            </div>

            {/* Sorting Dropdown */}
            <div className="w-full md:w-56">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border border-slate-850 bg-slate-955 px-4 py-2.5 text-xs font-semibold text-white outline-none transition focus:border-orange-500 cursor-pointer"
                >
                    <option value="latest">Latest Enrolled</option>
                    <option value="oldest">Oldest Enrolled</option>
                    <option value="name-asc">Course Name (A-Z)</option>
                    <option value="name-desc">Course Name (Z-A)</option>
                </select>
            </div>
        </div>
    );
}