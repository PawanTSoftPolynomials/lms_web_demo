import Cookies from "js-cookie";

/**
 * Uploads a file to Vercel Blob storage via Next.js API route (/api/upload).
 * The server calls @vercel/blob's put() with public access, bypassing browser CORS restrictions.
 */
export const uploadFileToBlob = async (file, options = {}) => {
  const token =
    Cookies.get("accessToken") ||
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : "");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    url: data.url || data.fileUrl,
    fileUrl: data.url || data.fileUrl,
    pathname: data.pathname,
    contentType: data.contentType,
    originalName: file.name,
    size: file.size,
  };
};
