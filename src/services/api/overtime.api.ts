import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, OvertimeRequest } from '@/types';
export const overtimeApi = {
  search:      (p?: { employeeId?: number; status?: string; page?: number; size?: number })    => axiosInstance.get<ApiResponse<PageResponse<OvertimeRequest>>>('/overtime', { params: p }),
  approve:     (id: number, data: { approvedMinutes: number; remarks?: string })               => axiosInstance.put<ApiResponse<OvertimeRequest>>(`/overtime/${id}/approve`, data),
  reject:      (id: number, remarks?: string)                                                    => axiosInstance.put<ApiResponse<OvertimeRequest>>(`/overtime/${id}/reject`, null, { params: { remarks } }),
  convertLeave:(data: { employeeId: number; year: number; month: number; unusedLeaveDays: number; remarks?: string }) => axiosInstance.post<ApiResponse<OvertimeRequest[]>>('/overtime/convert-leave', data),
};
