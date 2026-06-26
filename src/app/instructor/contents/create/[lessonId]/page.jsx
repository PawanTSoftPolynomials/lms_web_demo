"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { createContent } from "@/services/content.service";

import ContentForm from "@/components/contents/ContentForm";

export default function CreateContent() {
  const { lessonId } = useParams();

  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = {
        title: formData.title,
        type: formData.type,
        order: Number(formData.order),
        lessonId,
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

      await createContent(data);

      router.push(`/instructor/contents/${lessonId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentForm
      title="Create Content"
      buttonText="Create Content"
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
}
