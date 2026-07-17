"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

import StudentRow from "./StudentRow";

export default function StudentTable({
                                         students = [],
                                         onView,
                                         onEdit,
                                         onDelete,
                                     }) {
    if (!students.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No Students Found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                    There are no students available.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-white/10 md:block">
                <table className="min-w-full">
                    <thead className="bg-white/5">
                    <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-4 font-medium">
                            Student
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Phone
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Education
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

                    <tbody className="divide-y divide-white/5">
                    {students.map((student) => (
                        <StudentRow
                            key={student.id}
                            student={student}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
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
                        className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <UserAvatar
                                    name={student.user.name}
                                />

                                <div>
                                    <h3 className="font-semibold text-white">
                                        {student.user.name}
                                    </h3>

                                    <p className="break-all text-xs text-gray-400">
                                        {student.user.email}
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
                                            label: "Edit",
                                            onClick: () =>
                                                onEdit?.(student),
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

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400">
                                    Phone
                                </p>

                                <span className="font-medium text-white">
                  {student.phone || "-"}
                </span>
                            </div>

                            <div>
                                <p className="text-gray-400">
                                    Status
                                </p>

                                <span
                                    className={`font-medium ${
                                        student.user.status ===
                                        "ACTIVE"
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }`}
                                >
                  {student.user.status}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-gray-400">
                                    Education
                                </p>

                                <span className="text-white">
                  {student.education || "-"}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-gray-400">
                                    Joined
                                </p>

                                <span className="text-white">
                  {new Date(
                      student.createdAt
                  ).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}