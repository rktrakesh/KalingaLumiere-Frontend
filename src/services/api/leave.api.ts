import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, PageResponse, LeaveRequest, LeaveBalance } from "@/types";
export const leaveApi = {
  getAll: (p?: { employeeId?: number; status?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<LeaveRequest>>>("/leaves", { params: p }),
  request: (data: { employeeId: number; leaveDate: string; reason?: string }) => axiosInstance.post<ApiResponse<LeaveRequest>>("/leaves/request", data),
  approve: (id: number) => axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`),
  reject: (id: number, rejectionReason?: string) => axiosInstance.put(`/leaves/${id}/reject`, { rejectionReason }),
  getBalance: (empId: number, year: number, month: number) => axiosInstance.get<ApiResponse<LeaveBalance>>(`/leaves/balance/${empId}`, { params: { year, month } }),
};
