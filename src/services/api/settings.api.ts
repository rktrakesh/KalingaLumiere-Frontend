import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, AppSetting } from "@/types";
export const settingsApi = {
  getAll: (category?: string) => axiosInstance.get<ApiResponse<AppSetting[]>>("/settings", { params: { category } }),
  update: (key: string, value: string) => axiosInstance.put<ApiResponse<AppSetting>>(`/settings/${key}`, { value }),
  getHistory: (key: string) => axiosInstance.get<ApiResponse<unknown[]>>(`/settings/history/${key}`),
};
