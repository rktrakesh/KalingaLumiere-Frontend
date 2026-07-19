import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, Notification } from '@/types';
export const notificationsApi = {
  getAll:      () => axiosInstance.get<ApiResponse<Notification[]>>('/notifications'),
  getCount:    () => axiosInstance.get<ApiResponse<{ unread: number }>>('/notifications/count'),
  markRead:    (id: number) => axiosInstance.put<ApiResponse<void>>(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.put<ApiResponse<void>>('/notifications/read-all'),
};
