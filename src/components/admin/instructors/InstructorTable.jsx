"use client";

import UserAvatar from "@/components/admin/users/UserAvatar";
import ActionMenu from "@/components/menus/ActionMenu";

import InstructorRow from "./InstructorRow";

export default function InstructorTable({
                                            instructors = [], onView, onDelete, onChangeRole,
                                        }) {
    if (!instructors.length) {
        return (<div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                    No Instructors Found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                    There are no instructors available.
                </p>
            </div>);
    }

    return (<>
            {/* Desktop & Tablet */}
            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-border text-[9px] uppercase tracking-widest text-muted-foreground font-black text-left">
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
                    <tbody className="divide-y divide-border">
                    {instructors.map((instructor) => (<InstructorRow
                            key={instructor.id}
                            instructor={instructor}
                            onView={onView}
                            onDelete={onDelete}
                            onChangeRole={onChangeRole}
                        />))}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
                {instructors.map((instructor) => (<div
                        key={instructor.id}
                        className="rounded-xl border border-border bg-card p-4 hover:bg-foreground/5 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                                <UserAvatar
                                    name={instructor.user.name}
                                />

                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {instructor.user.name}
                                    </h3>

                                    <p className="break-all text-xs text-muted-foreground">
                                        {instructor.user.email}
                                    </p>
                                </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    items={[{
                                        label: "Change Role", onClick: () => onChangeRole?.(instructor),
                                    }, {
                                        label: "Delete", danger: true, onClick: () => onDelete?.(instructor),
                                    },]}
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Specialization
                                </p>

                                <span className="font-medium text-foreground">
                  {instructor.specialization || "-"}
                </span>
                            </div>

                            <div>
                                <p className="text-muted-foreground">
                                    Experience
                                </p>

                                <span className="font-medium text-foreground">
                  {instructor.experience != null ? `${instructor.experience} Years` : "-"}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground">
                                    Qualification
                                </p>

                                <span className="text-foreground">
                  {instructor.qualification || "-"}
                </span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-muted-foreground">
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