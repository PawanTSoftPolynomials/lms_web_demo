"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

import InstructorRow from "./InstructorRow";

export default function InstructorTable({
                                            instructors = [], onView, onEdit, onDelete,
                                        }) {
    if (!instructors.length) {
        return (<div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-white">
                    No Instructors Found
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                    There are no instructors available.
                </p>
            </div>);
    }

    return (<>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-white/10 md:block">
                <table className="min-w-full">
                    <thead className="bg-white/5">
                    <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-4 font-medium">
                            Instructor
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Specialization
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Qualification
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Experience
                        </th>

                        <th className="px-6 py-4 font-medium">
                            Status
                        </th>

                        <th className="px-6 py-4 text-right font-medium">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                    {instructors.map((instructor) => (<InstructorRow
                            key={instructor.id}
                            instructor={instructor}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
                {instructors.map((instructor) => (<div
                        key={instructor.id}
                        onClick={() => onView?.(instructor)}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <UserAvatar
                                    name={instructor.user.name}
                                />

                                <div>
                                    <h3 className="font-semibold text-white">
                                        {instructor.user.name}
                                    </h3>

                                    <p className="break-all text-xs text-gray-400">
                                        {instructor.user.email}
                                    </p>
                                </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    items={[{
                                        label: "View", onClick: () => onView?.(instructor),
                                    }, {
                                        label: "Edit", onClick: () => onEdit?.(instructor),
                                    }, {
                                        label: "Delete", danger: true, onClick: () => onDelete?.(instructor),
                                    },]}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400">
                                    Specialization
                                </p>

                                <span className="font-medium text-white">
                  {instructor.specialization || "-"}
                </span>
                            </div>

                            <div>
                                <p className="text-gray-400">
                                    Experience
                                </p>

                                <span className="font-medium text-white">
                  {instructor.experience != null ? `${instructor.experience} Years` : "-"}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-gray-400">
                                    Qualification
                                </p>

                                <span className="text-white">
                  {instructor.qualification || "-"}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-gray-400">
                                    Status
                                </p>

                                <span
                                    className={`font-medium ${instructor.user.status === "ACTIVE" ? "text-green-400" : instructor.user.status === "BLOCKED" ? "text-red-400" : "text-yellow-400"}`}
                                >
                  {instructor.user.status}
                </span>
                            </div>
                        </div>
                    </div>))}
            </div>
        </>);
}