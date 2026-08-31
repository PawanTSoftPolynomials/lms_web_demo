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
        <div className="rounded-xl border border-border bg-background p-5">
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
            border-transparent
            bg-muted
            px-4
            py-3
            text-foreground
            outline-none
            transition
            focus:border-primary
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
            border-transparent
            bg-muted
            px-4
            py-3
            text-foreground
            outline-none
            transition
            focus:border-primary
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