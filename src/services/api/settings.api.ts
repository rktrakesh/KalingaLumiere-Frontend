import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, SettingResponse, SettingUpdateResult } from "@/types";
export const settingsApi = {
  getAll: (category?: string) => axiosInstance.get<ApiResponse<SettingResponse[]>>("/settings", { params: { category } }),
  update: (key: string, value: string) => axiosInstance.put<ApiResponse<SettingUpdateResult>>(`/settings/${key}`, { value }),
  getHistory: (key: string) => axiosInstance.get<ApiResponse<unknown[]>>(`/settings/history/${key}`),
};
