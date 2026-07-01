"use client";

import {RotateCcw} from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CourseToolbar({
                                          search,
                                          onSearchChange,
                                          status,
                                          onStatusChange,
                                          level,
                                          onLevelChange,
                                          onRefresh,
                                      }) {
    return (
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
                <Input
                    placeholder="Search by title, category or creator..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange?.(e.target.value)
                    }
                    className="md:max-w-sm"
                />

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) =>
                        onStatusChange?.(e.target.value)
                    }
                    className="
            rounded-lg
            border
            border-white/10
            bg-slate-900
            px-4
            py-2
            text-sm
            text-white
            outline-none
            focus:border-orange-500
          "
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="PUBLISHED">
                        Published
                    </option>

                    <option value="DRAFT">
                        Draft
                    </option>
                </select>

                {/* Level Filter */}
                <select
                    value={level}
                    onChange={(e) =>
                        onLevelChange?.(e.target.value)
                    }
                    className="
            rounded-lg
            border
            border-white/10
            bg-slate-900
            px-4
            py-2
            text-sm
            text-white
            outline-none
            focus:border-orange-500
          "
                >
                    <option value="">
                        All Levels
                    </option>

                    <option value="Beginner">
                        Beginner
                    </option>

                    <option value="Intermediate">
                        Intermediate
                    </option>

                    <option value="Advanced">
                        Advanced
                    </option>
                </select>
            </div>

            <Button
                onClick={onRefresh}
                className="flex items-center gap-2"
            >
                <RotateCcw size={16}/>
                Refresh
            </Button>
        </div>
    );
}