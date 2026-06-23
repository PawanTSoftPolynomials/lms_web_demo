"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getCourseById,
  updateCourse,
} from "@/services/course.service";

import Loader from "@/components/common/Loader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/layouts/PageHeader";

export default function EditCourse() {
  const { courseId } =
    useParams();

  const router =
    useRouter();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      level: "",
      thumbnailUrl: "",
    });

  useEffect(() => {
    const loadCourse =
      async () => {
        try {
          const response =
            await getCourseById(
              courseId
            );

          setFormData({
            title:
              response.title || "",
            description:
              response.description ||
              "",
            category:
              response.category || "",
            level:
              response.level || "",
            thumbnailUrl:
              response.thumbnailUrl ||
              "",
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleChange = (
    e
  ) => {
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
        setSaving(true);

        await updateCourse(
          courseId,
          formData
        );

        router.push(
          "/admin/courses"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to update course"
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Course"
        subtitle="Update course information"
      />

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Title"
            name="title"
            value={
              formData.title
            }
            onChange={
              handleChange
            }
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
                text-white
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
                text-white
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
            disabled={saving}
            className="w-full"
          >
            {saving
              ? "Updating..."
              : "Update Course"}
          </Button>
        </form>
      </Card>
    </div>
  );
}