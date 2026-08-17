"use client";

import {
    School,
    Building2,
    Landmark,
    Layers,
    CalendarRange,
    Percent,
    Briefcase,
    Clock3,
    UserCheck,
    Target,
    MapPin,
} from "lucide-react";

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

const EMPLOYMENT_STATUS_LABEL = {
    STUDENT: "Student",
    EMPLOYED: "Employed",
    UNEMPLOYED: "Unemployed",
    FREELANCER: "Freelancer",
    ENTREPRENEUR: "Entrepreneur",
};

/**
 * Read-only view of the AI Student Entry Phase's academic/career profile
 * fields — same InfoItem pattern as StudentInformation.jsx, so the AI
 * personalization data driving entry-assessment generation is actually
 * visible somewhere, not just editable via EditProfileModal.
 */
export default function AcademicCareerInformation({ profile }) {
    if (!profile) return null;

    const student = profile.studentProfile || {};
    const location = [student.city, student.state, student.country].filter(Boolean).join(", ");

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Academic &amp; Career Details</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Used to personalize your AI entry assessments and learning path.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem icon={MapPin} label="Location" value={location} />
                <InfoItem icon={School} label="Highest Qualification" value={student.highestQualification} />
                <InfoItem icon={School} label="Current Qualification" value={student.currentQualification} />
                <InfoItem icon={Building2} label="College / University" value={student.collegeName} />
                <InfoItem icon={Layers} label="Branch / Stream" value={student.branchOrStream} />
                <InfoItem icon={CalendarRange} label="Graduation Year" value={student.graduationYear} />
                <InfoItem icon={Percent} label="CGPA / Percentage" value={student.cgpaOrPercentage} />
                <InfoItem icon={Briefcase} label="Employment Status" value={EMPLOYMENT_STATUS_LABEL[student.employmentStatus]} />
                <InfoItem icon={Clock3} label="Years of Experience" value={student.yearsOfExperience} />
                <InfoItem icon={UserCheck} label="Current Job Role" value={student.currentJobRole} />
                <InfoItem icon={Target} label="Career Goal" value={student.careerGoalText} />
                <InfoItem icon={Landmark} label="Semester" value={student.semester} />
            </div>
        </Card>
    );
}
