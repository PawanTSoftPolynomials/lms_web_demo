import Input from "@/components/ui/Input";

export default function MyCourseToolbar({
                                            search,
                                            setSearch,
                                            sortBy,
                                            setSortBy,
                                        }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
                <Input
                    placeholder="Search my courses..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
            </div>

            <div className="w-full md:w-56">
                <select
                    value={sortBy}
                    onChange={(e) =>
                        setSortBy(e.target.value)
                    }
                    className="
            w-full
            rounded-lg
            border
            border-slate-700
            bg-slate-950
            px-4
            py-2.5
            text-white
            outline-none
            transition
            focus:border-orange-500
          "
                >
                    <option value="latest">
                        Latest Enrolled
                    </option>

                    <option value="oldest">
                        Oldest Enrolled
                    </option>

                    <option value="name-asc">
                        Course Name (A-Z)
                    </option>

                    <option value="name-desc">
                        Course Name (Z-A)
                    </option>
                </select>
            </div>
        </div>
    );
}