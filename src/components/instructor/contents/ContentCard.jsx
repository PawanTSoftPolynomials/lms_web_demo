"use client";

import {useRouter} from "next/navigation";

import {
    FaVideo,
    FaFilePdf,
    FaLink,
    FaCode,
    FaFileAlt,
} from "react-icons/fa";

import ActionMenu from "@/components/menus/ActionMenu";

const CONTENT_ICONS = {
    VIDEO: FaVideo,
    FILE: FaFilePdf,
    LINK: FaLink,
    HTML: FaCode,
};

const CONTENT_COLORS = {
    VIDEO: "bg-red-500/15 text-red-400",
    FILE: "bg-blue-500/15 text-blue-400",
    LINK: "bg-green-500/15 text-green-400",
    HTML: "bg-purple-500/15 text-purple-400",
};

export default function ContentCard({
                                        content,
                                        onDelete,
                                    }) {
    const router = useRouter();

    const Icon =
        CONTENT_ICONS[content.type] ||
        FaFileAlt;

    const openContent = () => {
        router.push(
            `/instructor/contents/view/${content.id}`
        );
    };

    return (
        <div
            onClick={openContent}
            className="
        cursor-pointer
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-orange-500
      "
        >
            <div className="flex h-full flex-col justify-between">
                {/* Header */}
                <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div className="flex flex-1 items-start gap-4">
                            <div
                                className={`
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${
                                    CONTENT_COLORS[
                                        content.type
                                        ] ||
                                    "bg-orange-500/15 text-orange-400"
                                }
                `}
                            >
                                <Icon size={20}/>
                            </div>

                            <div className="flex-1">
                                <h3 className="line-clamp-1 text-xl font-semibold text-white">
                                    {content.title}
                                </h3>

                                <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                                    {content.description ||
                                        "No description available."}
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <ActionMenu
                                items={[
                                    {
                                        label: "View",
                                        onClick: openContent,
                                    },
                                    {
                                        label: "Edit",
                                        onClick: () =>
                                            router.push(
                                                `/instructor/contents/edit/${content.id}`
                                            ),
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () =>
                                            onDelete?.(
                                                content.id
                                            ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
            <span
                className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-medium
                ${
                    CONTENT_COLORS[
                        content.type
                        ] ||
                    "bg-orange-500/15 text-orange-400"
                }
              `}
            >
              {content.type}
            </span>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openContent();
                            }}
                            className="
                rounded-lg
                bg-orange-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-orange-700
              "
                        >
                            View Content
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}