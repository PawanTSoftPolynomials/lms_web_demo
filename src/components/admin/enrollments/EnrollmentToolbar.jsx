"use client";

import { RotateCcw } from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EnrollmentToolbar({
                                              search,
                                              onSearchChange,
                                              onRefresh,
                                          }) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
                <Input
                    placeholder="Search by student, email or course..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange?.(e.target.value)
                    }
                    className="md:max-w-sm"
                />
            </div>

            <Button
                onClick={onRefresh}
                className="flex items-center gap-2"
            >
                <RotateCcw size={16} />
                Refresh
            </Button>
        </div>
    );
}