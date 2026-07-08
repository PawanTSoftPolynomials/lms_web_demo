"use client";

import { useEffect, useState } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function UserForm({
  initialValues = {},
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "STUDENT",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!initialValues) return;

    setFormData({
      name: initialValues.name || "",
      email: initialValues.email || "",
      role: initialValues.role || "STUDENT",
      status: initialValues.status || "ACTIVE",
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
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
              <option value="ADMIN">Admin</option>

              <option value="INSTRUCTOR">Instructor</option>

              <option value="STUDENT">Student</option>
            </select>
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
              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>

              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
