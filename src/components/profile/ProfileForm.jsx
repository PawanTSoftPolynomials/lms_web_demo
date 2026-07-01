"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const getInitialValues = (
    profile = {}
) => ({
    name: profile.name || "",
    phoneNumber:
        profile.phoneNumber || "",
    address:
        profile.address || "",
});

export default function ProfileForm({
                                        profile = {},
                                        onSubmit,
                                        isSubmitting = false,
                                    }) {
    const [formData, setFormData] =
        useState(() =>
            getInitialValues(profile)
        );


    const handleChange = (e) => {
        const { name, value } =
            e.target;

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
            <h2 className="mb-6 text-2xl font-semibold text-white">
                Edit Profile
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Phone Number"
                    name="phoneNumber"
                    value={
                        formData.phoneNumber
                    }
                    onChange={handleChange}
                />

                <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                />

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : "Update Profile"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}