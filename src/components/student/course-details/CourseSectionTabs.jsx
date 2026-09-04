"use client";

import { useEffect, useRef, useState } from "react";

export const COURSE_SECTION_TABS = [
    { id: "course-overview", label: "Overview" },
    { id: "course-modules", label: "Modules" },
    { id: "course-quizzes", label: "Quizzes" },
    { id: "course-announcements", label: "Announcements" },
];

// Distance (px) from the viewport top a section's start must cross to count
// as "current" — just below the sticky mobile header (73px) + this bar (~48px).
const SCROLLSPY_OFFSET = 121;

// Mobile/tablet only (see CourseHeader's lg breakpoint) — a compact in-page
// nav so switching between Overview/Modules/Quizzes/Announcements doesn't
// require scrolling back up to the top of a long course page.
export default function CourseSectionTabs() {
    const [activeId, setActiveId] = useState(COURSE_SECTION_TABS[0].id);
    const suppressScrollSpy = useRef(false);
    const suppressTimeout = useRef(null);
    const rafId = useRef(null);

    useEffect(() => {
        const updateActiveFromScroll = () => {
            if (suppressScrollSpy.current) return;

            let current = COURSE_SECTION_TABS[0].id;
            for (const tab of COURSE_SECTION_TABS) {
                const el = document.getElementById(tab.id);
                if (el && el.getBoundingClientRect().top <= SCROLLSPY_OFFSET) {
                    current = tab.id;
                }
            }
            setActiveId(current);
        };

        const handleScroll = () => {
            if (rafId.current) return;
            rafId.current = requestAnimationFrame(() => {
                rafId.current = null;
                updateActiveFromScroll();
            });
        };

        updateActiveFromScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
            clearTimeout(suppressTimeout.current);
        };
    }, []);

    const handleTabClick = (id) => {
        const el = document.getElementById(id);
        if (!el) return;

        suppressScrollSpy.current = true;
        setActiveId(id);
        el.scrollIntoView({ behavior: "smooth", block: "start" });

        clearTimeout(suppressTimeout.current);
        suppressTimeout.current = setTimeout(() => {
            suppressScrollSpy.current = false;
        }, 700);
    };

    return (
        <div className="sticky top-[73px] z-30 rounded-2xl border border-card-border bg-card/90 backdrop-blur-md shadow-luxury-md lg:hidden">
            <div className="flex gap-1 overflow-x-auto scrollbar-none px-2 py-1.5">
                {COURSE_SECTION_TABS.map((tab) => {
                    const isActive = activeId === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabClick(tab.id)}
                            className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
