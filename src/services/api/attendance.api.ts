import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, AttendanceRecord, CheckInRequest, CheckOutRequest } from '@/types';
export interface AttendanceFilters { employeeId?: number; date?: string; status?: string; from?: string; to?: string; page?: number; size?: number; }
export const attendanceApi = {
  search:            (p?: AttendanceFilters)                                                  => axiosInstance.get<ApiResponse<PageResponse<AttendanceRecord>>>('/attendance', { params: p }),
  getMonthly:        (empId: number, year: number, month: number)                            => axiosInstance.get<ApiResponse<AttendanceRecord[]>>(`/attendance/${empId}/monthly`, { params: { year, month } }),
  checkIn:           (data: CheckInRequest)                                                    => axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendance/check-in', data),
  checkOut:          (id: number, data: CheckOutRequest)                                      => axiosInstance.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}/check-out`, data),
  correct:           (id: number, data: { checkIn?: string; checkOut?: string; status?: string; remarks: string }) => axiosInstance.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}/correct`, data),
  getPendingCheckouts: ()                                                                     => axiosInstance.get<ApiResponse<AttendanceRecord[]>>('/attendance/pending-checkout'),
};
