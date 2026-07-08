"use client";

import { useState} from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function StudentForm({
                                        initialValues = {},
                                        onSubmit,
                                        isSubmitting = false,
                                    }) {

    const getInitialFormData = (values = {}) => ({
        name: values.user?.name || "",
        email: values.user?.email || "",
        phone: values.phone || "",
        education: values.education || "",
        guardianName: values.guardianName || "",
        dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.slice(0, 10)
            : "",
        status: values.user?.status || "ACTIVE",
    });

    const [formData, setFormData] = useState(() =>
        getInitialFormData(initialValues)
    );
    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit?.(formData);
    };

    return (
        <Card>
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    <Input
                        label="Education"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Input
                        label="Guardian Name"
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                        Status
                    </label>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="
              w-full
              rounded-lg
              border
              border-white/10
              bg-slate-900
              px-4
              py-2.5
              text-white
              outline-none
              focus:border-orange-500
            "
                    >
                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                        <option value="BLOCKED">
                            Blocked
                        </option>
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}