"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import {RotateCcw} from "lucide-react";

export default function StudentToolbar({
                                           search,
                                           onSearchChange,
                                           onRefresh,
                                       }) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:flex-wrap">
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange?.(e.target.value)
                    }
                    className="md:max-w-sm md:shrink-0"
                />
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