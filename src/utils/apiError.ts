import axios from "axios";
import type { ApiError } from "@/types";

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError<ApiError>(error)) return fallback;
  const status = error.response?.status;
  if (status === 401) return "Your session is no longer valid. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  const message = error.response?.data?.message;
  if ([400, 404, 409].includes(status ?? 0) && typeof message === "string" && message.trim()) return message;
  return fallback;
};

export const isTemporaryPasswordExpiredError = (error: unknown): boolean => {
  if (!axios.isAxiosError<ApiError>(error)) return false;
  return error.response?.data?.message?.startsWith("TEMPORARY_PASSWORD_EXPIRED") === true;
};
