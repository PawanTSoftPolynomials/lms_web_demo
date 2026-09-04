"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import {RotateCcw} from "lucide-react";

export default function StudentToolbar({
                                           search,
                                           onSearchChange,
                                           status,
                                           onStatusChange,
                                           onRefresh,
                                       }) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) =>
                        onSearchChange?.(e.target.value)
                    }
                    className="md:max-w-sm"
                />

                <select
                    value={status}
                    onChange={(e) =>
                        onStatusChange?.(e.target.value)
                    }
                    className="
            rounded-lg
            border
            border-white/10
            bg-background
            px-4
            py-2
            text-sm
            text-foreground
            outline-none
            focus:border-primary
          "
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="Top Performer">
                        Top Performer
                    </option>

                    <option value="Behind Average">
                        Behind Average
                    </option>

                    <option value="Struggling">
                        Struggling
                    </option>

                    <option value="Not Started">
                        Not Started
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