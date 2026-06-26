"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { getContentById, updateContent } from "@/services/content.service";

import ContentForm from "@/components/contents/ContentForm";
import Loader from "@/components/common/Loader";

export default function EditContentPage() {
  const { contentId } = useParams();

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "VIDEO",
    videoUrl: "",
    fileUrl: "",
    htmlContent: "",
    externalUrl: "",
    duration: "",
    order: 1,
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getContentById(contentId);

        const data = content.data || content;

        setFormData({
          title: data.title || "",

          type: data.type || "VIDEO",

          videoUrl: data.videoUrl || "",

          fileUrl: data.fileUrl || "",

          htmlContent: data.htmlContent || "",

          externalUrl: data.externalUrl || "",

          duration: data.duration || "",

          order: data.order || 1,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      loadContent();
    }
  }, [contentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const data = {
        title: formData.title,

        type: formData.type,

        order: Number(formData.order),
      };

      if (formData.type === "VIDEO") {
        data.videoUrl = formData.videoUrl;

        data.duration = Number(formData.duration);
      }

      if (formData.type === "DOCUMENT") {
        data.fileUrl = formData.fileUrl;
      }

      if (formData.type === "TEXT") {
        data.htmlContent = formData.htmlContent;
      }

      if (formData.type === "LINK") {
        data.externalUrl = formData.externalUrl;
      }

      await updateContent(contentId, data);

      router.back();
    } catch (error) {
      console.error(error);
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
    <ContentForm
      title="Edit Content"
      buttonText="Update Content"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      loading={saving}
    />
  );
}
