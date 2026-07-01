"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";

export default function EmptyModules({
                                         courseId,
                                     }) {
    return (
        <Card>
            <div className="flex flex-col items-center py-16 text-center">
                <div
                    className="
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-orange-500/10
          "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-orange-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v12m6-6H6"
                        />
                    </svg>
                </div>

                <h3 className="text-2xl font-semibold text-white">
                    No Modules Yet
                </h3>

                <p className="mt-3 max-w-md text-slate-400">
                    This course does not have any modules.
                    Create your first module to start
                    organizing lessons and content.
                </p>

                <Link
                    href={`/instructor/modules/create/${courseId}`}
                    className="
            mt-8
            rounded-lg
            bg-orange-500
            px-6
            py-3
            font-medium
            text-white
            transition
            hover:bg-orange-600
          "
                >
                    Create First Module
                </Link>
            </div>
        </Card>
    );
}