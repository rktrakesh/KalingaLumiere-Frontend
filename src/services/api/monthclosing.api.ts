import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, MonthClosing, PreCloseCheck } from '@/types';
export const monthClosingApi = {
  getStatus: (year: number, month: number)                       => axiosInstance.get<ApiResponse<MonthClosing>>('/month-closing/status', { params: { year, month } }),
  preCheck:  (year: number, month: number)                       => axiosInstance.get<ApiResponse<PreCloseCheck>>('/month-closing/pre-check', { params: { year, month } }),
  close:     (data: { year: number; month: number })             => axiosInstance.post<ApiResponse<MonthClosing>>('/month-closing/close', data),
  reopen:    (data: { year: number; month: number; remarks: string }) => axiosInstance.post<ApiResponse<MonthClosing>>('/month-closing/reopen', data),
  getHistory:()                                                   => axiosInstance.get<ApiResponse<MonthClosing[]>>('/month-closing/history'),
};
