"use client";

import { useState, useEffect } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ModuleForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      order: 1,
    });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title:
          initialData.title || "",
        description:
          initialData.description || "",
        order:
          initialData.order || 1,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "order"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      {/* Header */}

      <div>

        <h3 className="text-2xl font-bold text-white">
          {initialData
            ? "Edit Module"
            : "Create New Module"}
        </h3>

        <p className="mt-2 text-slate-400">
          Organize your course by creating
          modules that contain lessons and
          learning materials.
        </p>

      </div>

      {/* Module Title */}

      <Input
        label="Module Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      {/* Description */}

      <div>

        <label className="mb-3 block text-sm font-semibold text-slate-300">
          Description
        </label>

        <textarea
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a short description for this module..."
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            py-3
            text-white
            placeholder:text-slate-500
            outline-none
            transition-all
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500/20
          "
        />

      </div>

      {/* Order */}

      <div className="max-w-xs">

        <Input
          type="number"
          label="Display Order"
          name="order"
          value={formData.order}
          onChange={handleChange}
          min={1}
        />

      </div>

      {/* Footer */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-slate-800
          pt-6
        "
      >

        <p className="text-sm text-slate-500">
          Module order determines the
          sequence shown to students.
        </p>

        <div className="flex gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : initialData
              ? "Update Module"
              : "Create Module"}
          </Button>

        </div>

      </div>

    </form>
  );
}