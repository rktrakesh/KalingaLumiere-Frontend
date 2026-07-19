import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, AdminDashboard } from '@/types';
export const dashboardApi = { getAdmin: () => axiosInstance.get<ApiResponse<AdminDashboard>>('/dashboard/admin') };
