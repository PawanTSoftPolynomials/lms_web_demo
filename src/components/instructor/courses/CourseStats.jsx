"use client";

import {
    HiOutlineBookOpen,
    HiOutlineAcademicCap,
    HiOutlineUsers,
} from "react-icons/hi";

import {FaLayerGroup} from "react-icons/fa";

const statsConfig = [
    {
        key: "modules",
        title: "Modules",
        icon: FaLayerGroup,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
    },
    {
        key: "lessons",
        title: "Lessons",
        icon: HiOutlineBookOpen,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        key: "quizzes",
        title: "Quizzes",
        icon: HiOutlineAcademicCap,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        key: "students",
        title: "Students",
        icon: HiOutlineUsers,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
];

export default function CourseStats({
                                        modules = 0,
                                        lessons = 0,
                                        quizzes = 0,
                                        students = 0,
                                    }) {
    const stats = {
        modules,
        lessons,
        quizzes,
        students,
    };

    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {statsConfig.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.key}
                        className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-6
              transition
              hover:border-orange-500
            "
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">
                                    {item.title}
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-white">
                                    {stats[item.key]}
                                </h3>
                            </div>

                            <div
                                className={`
                  ${item.bg}
                  rounded-xl
                  p-3
                `}
                            >
                                <Icon
                                    className={`text-2xl ${item.color}`}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}