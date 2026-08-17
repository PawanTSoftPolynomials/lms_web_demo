import { useMutation } from "@tanstack/react-query";

import { uploadContentFile } from "@/services/content.service";

/** Uploads a raw file via the existing POST /contents/upload-file endpoint and resolves its hosted URL. */
export function useUploadContentFile() {
    return useMutation({
        mutationFn: uploadContentFile,
    });
}
