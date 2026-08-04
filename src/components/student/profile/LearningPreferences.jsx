"use client";

import { Target, Brain, Clock3, Sun, Languages } from "lucide-react";

import Card from "@/components/ui/Card";

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-slate-400">{label}</p>
            </div>
            <p className="warp-break-word text-base font-medium text-white">{value || "Not Provided"}</p>
        </div>
    );
}

const LEARNING_STYLE_LABEL = {
    VISUAL: "Visual",
    AUDITORY: "Auditory",
    READING_WRITING: "Reading / Writing",
    KINESTHETIC: "Kinesthetic",
};

const STUDY_TIME_LABEL = {
    MORNING: "Morning",
    AFTERNOON: "Afternoon",
    EVENING: "Evening",
    NIGHT: "Night",
};

export default function LearningPreferences({ profile }) {
    if (!profile) return null;

    const student = profile.studentProfile || {};
    const skills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Learning Preferences</h2>
                <p className="mt-1 text-sm text-slate-400">
                    How you like to learn — this shapes your personalized study plan.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem icon={Target} label="Learning Goal" value={student.learningGoals} />
                <InfoItem icon={Brain} label="Preferred Learning Style" value={LEARNING_STYLE_LABEL[student.preferredLearningStyle]} />
                <InfoItem icon={Clock3} label="Weekly Study Hours" value={student.weeklyStudyHours ? `${student.weeklyStudyHours} hrs/week` : null} />
                <InfoItem icon={Sun} label="Preferred Study Time" value={STUDY_TIME_LABEL[student.preferredStudyTime]} />
                <InfoItem icon={Languages} label="Preferred Language" value={student.language} />
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="mb-3 text-sm font-medium text-slate-400">Technical Skills</p>
                {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-base font-medium text-white">Not Provided</p>
                )}
            </div>
        </Card>
    );
}
