import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, AppSetting } from '@/types';
export const settingsApi = {
  getAll:     ()                             => axiosInstance.get<ApiResponse<AppSetting[]>>('/settings'),
  update:     (key: string, value: string)  => axiosInstance.put<ApiResponse<AppSetting>>(`/settings/${key}`, { value }),
  getHistory: (key: string)                 => axiosInstance.get<ApiResponse<unknown[]>>(`/settings/history/${key}`),
};
