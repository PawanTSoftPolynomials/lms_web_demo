"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

import StudentRow from "./StudentRow";

export default function StudentTable({
                                         students = [],
                                         onView,
                                         onDelete,
                                         onChangeRole,
                                     }) {
    if (!students.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                    No Students Found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    There are no students available.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black text-left">
                        <th className="px-6 py-4 font-medium">
                            Student
                        </th>
                        <th className="px-6 py-4 font-medium">
                            Course
                        </th>
                        <th className="px-6 py-4 font-medium">
                            Progress
                        </th>
                        <th className="px-6 py-4 font-medium">
                            Status
                        </th>
                        <th className="px-6 py-4 font-medium">
                            Joined
                        </th>
                        <th className="px-6 py-4 text-right font-medium">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                    {students.map((student) => (
                        <StudentRow
                            key={student.id}
                            student={student}
                            onView={onView}
                            onDelete={onDelete}
                            onChangeRole={onChangeRole}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
                {students.map((student) => (
                    <div
                        key={student.id}
                        onClick={() => onView?.(student)}
                        className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-foreground/5 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <UserAvatar
                                    name={student.name}
                                />

                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {student.name}
                                    </h3>

                                    <p className="break-all text-xs text-muted-foreground">
                                        {student.email}
                                    </p>
                                </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    items={[
                                        {
                                            label: "View",
                                            onClick: () =>
                                                onView?.(student),
                                        },
                                        {
                                            label: "Change Role",
                                            onClick: () =>
                                                onChangeRole?.(student),
                                        },
                                        {
                                            label: "Delete",
                                            danger: true,
                                            onClick: () =>
                                                onDelete?.(student),
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Course
                                </p>

                                <span className="font-medium text-foreground">
                  {student.course || "-"}
                </span>
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Progress
                                </p>

                                <span className="font-medium text-foreground">
                  {student.progress ?? 0}%
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Status
                                </p>

                                <span className="text-foreground">
                  {student.status}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Joined
                                </p>

                                <span className="text-foreground">
                  {student.joinedDate || "-"}
                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}