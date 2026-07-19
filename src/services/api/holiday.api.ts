import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, Holiday } from '@/types';
export const holidayApi = {
  getByYear: (year?: number)                                                         => axiosInstance.get<ApiResponse<Holiday[]>>('/holidays', { params: { year } }),
  create:    (data: { holidayDate: string; name: string; holidayType: string })     => axiosInstance.post<ApiResponse<Holiday>>('/holidays', data),
  delete:    (id: number)                                                             => axiosInstance.delete<ApiResponse<void>>(`/holidays/${id}`),
};
