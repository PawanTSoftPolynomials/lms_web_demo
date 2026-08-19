import { upload } from "@vercel/blob/client";

/**
 * Uploads a file straight from the browser to the private Vercel Blob store
 * (via the token-exchange route at /api/blob/upload) and returns a same-origin
 * URL that streams it back through /api/blob/file. Shared by every Composer
 * field that offers "paste a URL or upload a file" — images, video, audio,
 * and documents alike — so there's a single upload code path to maintain.
 */
export const uploadFileToBlob = async (file) => {
  const pathname = `course-composer/${Date.now()}-${file.name}`;

  const blob = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/blob/upload",
  });

  return {
    url: `/api/blob/file?pathname=${encodeURIComponent(blob.pathname)}`,
    pathname: blob.pathname,
    contentType: blob.contentType,
  };
};
