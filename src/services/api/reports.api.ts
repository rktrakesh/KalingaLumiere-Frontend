import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, ProfitLossReport, AttendanceReport } from '@/types';
export const reportsApi = {
  getProfitLoss: (year: number, month: number) => axiosInstance.get<ApiResponse<ProfitLossReport>>('/reports/pl', { params: { year, month } }),
  getYearlyPL:   (year: number)                => axiosInstance.get<ApiResponse<ProfitLossReport>>('/reports/pl/yearly', { params: { year } }),
  getAttendance: (year: number, month: number) => axiosInstance.get<ApiResponse<AttendanceReport>>('/reports/attendance', { params: { year, month } }),
  getPayroll:    (year: number, month: number) => axiosInstance.get<ApiResponse<unknown>>('/reports/payroll', { params: { year, month } }),
};
