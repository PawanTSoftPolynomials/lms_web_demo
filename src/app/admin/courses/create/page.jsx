"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createCourse,
} from "@/services/course.service";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";

export default function CreateCourse() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      level: "",
      thumbnailUrl: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        await createCourse(
          formData
        );

        router.push(
          "/admin/courses"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to create course"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Course"
        subtitle="Add a new course to the platform"
      />

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={
              handleChange
            }
            required
          />

          <div>
            <label className="block mb-2 text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              rows={4}
              className="
                w-full
                p-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            />
          </div>

          <Input
            label="Category"
            name="category"
            value={
              formData.category
            }
            onChange={
              handleChange
            }
          />

          <div>
            <label className="block mb-2 text-sm font-medium">
              Level
            </label>

            <select
              name="level"
              value={
                formData.level
              }
              onChange={
                handleChange
              }
              className="
                w-full
                p-3
                rounded-lg
                bg-slate-800
                border
                border-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500
              "
            >
              <option value="">
                Select Level
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>
          </div>

          <Input
            label="Thumbnail URL"
            name="thumbnailUrl"
            value={
              formData.thumbnailUrl
            }
            onChange={
              handleChange
            }
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Creating..."
              : "Create Course"}
          </Button>
        </form>
      </Card>
    </div>
  );
}