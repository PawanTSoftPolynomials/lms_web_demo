import { isAxiosError } from "axios";

/** Extracts a backend-provided error message from a failed API call, falling back otherwise. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  if (isAxiosError(error) && typeof error.response?.data?.error === "string") {
    return error.response.data.error;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
