import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";

import Card from "@/components/ui/Card";

// No student-facing "announcements for this course" read endpoint exists yet
// (the backend only has an instructor/admin POST) — so this links out to the
// real News & Updates feed instead of embedding a broken or fabricated one.
export default function CourseAnnouncementsSection() {
    return (
        <div className="space-y-3">
            <div className="px-1">
                <h2 className="text-lg font-semibold text-foreground">Announcements</h2>
            </div>

            <Card className="flex flex-col items-center gap-3 p-8 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="h-5 w-5" />
                </span>

                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Announcements live in News &amp; Updates
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Check News &amp; Updates for the latest announcements across your courses.
                    </p>
                </div>

                <Link
                    href="/student/news"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-orange-300"
                >
                    View News &amp; Updates
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </Card>
        </div>
    );
}
