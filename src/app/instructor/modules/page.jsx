"use client";

import {useRouter} from "next/navigation";

import Card from "@/components/ui/Card";
import Loader from "@/components/common/Loader";

import {useModules} from "@/hooks/queries/instructor/useModules";

export default function ModulesPage() {
    const router = useRouter();

    const {
        data: modules = [],
        isLoading,
        isError,
    } = useModules();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader/>
            </div>
        );
    }

    if (isError) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        Failed to Load Modules
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Please try again later.
                    </p>
                </div>
            </Card>
        );
    }

    if (!modules.length) {
        return (
            <Card>
                <div className="py-16 text-center">
                    <h2 className="text-2xl font-semibold">
                        No Modules Found
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Create your first module.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white">
                    Modules
                </h1>

                <p className="mt-2 text-slate-400">
                    Manage all course modules.
                </p>
            </div>

            {/* Module Cards */}
            <div className="grid gap-5 lg:grid-cols-2">
                {modules.map((module) => (
                    <Card
                        key={module.id}
                        onClick={() =>
                            router.push(`/instructor/modules/${module.id}`)
                        }
                        className="
              cursor-pointer
              transition-all
              duration-300
              hover:border-orange-500
              hover:-translate-y-1
            "
                    >
                        <div className="flex flex-col gap-5">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold line-clamp-1">
                                        {module.title}
                                    </h2>

                                    <p className="mt-2 text-slate-400 line-clamp-2">
                                        {module.description}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                                        module.isPublished
                                            ? "bg-green-500/15 text-green-400"
                                            : "bg-yellow-500/15 text-yellow-400"
                                    }`}
                                >
                  {module.isPublished
                      ? "Published"
                      : "Draft"}
                </span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Module Order
                                    </p>

                                    <p className="font-semibold">
                                        #{module.order}
                                    </p>
                                </div>

                                <div
                                    className="flex gap-3"
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                >
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/instructor/modules/edit/${module.id}`
                                            )
                                        }
                                        className="
                      rounded-lg
                      border
                      border-slate-700
                      px-4
                      py-2
                      text-sm
                      transition
                      hover:border-orange-500
                      hover:text-orange-400
                    "
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/instructor/modules/${module.id}`
                                            )
                                        }
                                        className="
                      rounded-lg
                      bg-orange-600
                      hover:bg-orange-700
                      px-4
                      py-2
                      text-sm
                      font-medium
                      transition
                    "
                                    >
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}