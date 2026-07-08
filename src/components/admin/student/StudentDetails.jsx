"use client";

import Card from "@/components/ui/Card";
import UserAvatar from "@/components/admin/users/UserAvatar";
import InfoItem from "./InfoItem";
import {
    Mail,
    Phone,
    GraduationCap,
    User,
    Calendar,
    Shield,
} from "lucide-react";

export default function StudentDetails({
                                           student,
                                       }) {
    if (!student) return null;


    return (
        <Card className="space-y-8">
            <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-8 md:flex-row">
                <UserAvatar
                    name={student.user.name}
                    size="lg"
                />

                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {student.user.name}
                    </h2>

                    <p className="text-gray-400">
                        {student.user.email}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
            <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                    student.user.status ===
                    "ACTIVE"
                        ? "bg-green-500/20 text-green-400"
                        : student.user.status ===
                        "INACTIVE"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                }`}
            >
              {student.user.status}
            </span>

                        <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
              {student.user.role}
            </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <InfoItem
                    icon={<Mail size={18}/>}
                    label="Email"
                    value={student.user.email}
                />

                <InfoItem
                    icon={<Phone size={18}/>}
                    label="Phone"
                    value={student.phone}
                />

                <InfoItem
                    icon={<GraduationCap size={18}/>}
                    label="Education"
                    value={student.education}
                />

                <InfoItem
                    icon={<User size={18}/>}
                    label="Guardian"
                    value={student.guardianName}
                />

                <InfoItem
                    icon={<Calendar size={18}/>}
                    label="Date of Birth"
                    value={
                        student.dateOfBirth
                            ? new Date(
                                student.dateOfBirth
                            ).toLocaleDateString()
                            : "-"
                    }
                />

                <InfoItem
                    icon={<Shield size={18}/>}
                    label="Joined"
                    value={new Date(
                        student.createdAt
                    ).toLocaleDateString()}
                />
            </div>
        </Card>
    );
}