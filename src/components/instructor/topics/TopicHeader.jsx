"use client";

import Link from "next/link";

import {
    FaBookOpen,
    FaEdit,
    FaFileAlt,
    FaRocket,
    FaUndo,
} from "react-icons/fa";

export default function TopicHeader({
                                         topic,
                                         onTogglePublish,
                                         isToggling = false,
                                     }) {
    return (
        <div
            className="
        rounded-2xl
        border
        border-border
        bg-gradient-to-br from-slate-900 to-slate-950
        p-5
        shadow-lg
      "
        >
            {/* Top */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                        <div
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-primary/15
                text-primary
                shrink-0
              "
                        >
                            <FaBookOpen size={18} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                    {topic.title}
                                </h1>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                        topic.isPublished
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}
                                >
                                    {topic.isPublished ? "Published" : "Draft"}
                                </span>
                            </div>

                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Topic Details
                            </p>
                        </div>
                    </div>

                    <p className="max-w-4xl text-sm text-muted-foreground leading-relaxed mt-1">
                        {topic.description}
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onTogglePublish}
                        disabled={isToggling}
                        className={`inline-flex items-center gap-2 rounded-xl font-extrabold text-xs px-5 py-2.5 transition active:scale-95 shadow-lg disabled:opacity-50 ${
                            topic.isPublished
                                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10"
                        }`}
                    >
                        {topic.isPublished ? <FaUndo size={12} /> : <FaRocket size={12} />}
                        {isToggling
                            ? "Updating..."
                            : topic.isPublished
                            ? "Unpublish"
                            : "Publish Topic"}
                    </button>

                    <Link
                        href={`/instructor/topics/edit/${topic.id}`}
                        className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-primary
            hover:bg-orange-600
            text-slate-950
            font-extrabold
            text-xs
            px-5
            py-2.5
            transition
            shadow-lg
            shadow-orange-500/10
            active:scale-95
            shrink-0
          "
                    >
                        <FaEdit size={12} />

                        Edit Topic
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid gap-3.5 md:grid-cols-2">
                <div
                    className="
            rounded-xl
            border
            border-border/80
            bg-background/40
            p-3
            px-4.5
          "
                >
                    <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                        Topic Order
                    </p>

                    <p className="mt-1 text-xl font-black text-foreground">
                        #{topic.order}
                    </p>
                </div>

                <div
                    className="
            rounded-xl
            border
            border-border/80
            bg-background/40
            p-3
            px-4.5
          "
                >
                    <div className="flex items-center gap-1.5">
                        <FaFileAlt className="text-primary" size={12} />

                        <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
                            Contents
                        </p>
                    </div>

                    <p className="mt-1 text-xl font-black text-foreground">
                        {topic.contents?.length ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
}
