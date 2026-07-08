"use client";

import Input from "@/components/ui/Input";

export default function CourseFilters({
                                          search,
                                          onSearchChange,
                                          category,
                                          onCategoryChange,
                                          level,
                                          onLevelChange,
                                          categories = [],
                                          levels = [],
                                      }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                />

                <select
                    value={category}
                    onChange={(e) =>
                        onCategoryChange(e.target.value)
                    }
                    className="
            rounded-lg
            border
            border-slate-700
            bg-slate-800
            px-4
            py-3
            text-white
            outline-none
            transition
            focus:border-orange-500
          "
                >
                    <option value="">
                        All Categories
                    </option>

                    {categories.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={level}
                    onChange={(e) =>
                        onLevelChange(e.target.value)
                    }
                    className="
            rounded-lg
            border
            border-slate-700
            bg-slate-800
            px-4
            py-3
            text-white
            outline-none
            transition
            focus:border-orange-500
          "
                >
                    <option value="">
                        All Levels
                    </option>

                    {levels.map((item) => (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}