"use client";

import Card from "@/components/ui/Card";

export default function ProgressEmpty() {
    return (
        <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-white">
                Keep Learning 🚀
            </h3>

            <p className="mt-3 text-slate-400">
                Complete lessons to track your learning
                progress.
            </p>
        </Card>
    );
}