import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Customer } from '@/types';
export const customerApi = {
  getAll:        (p?: { status?: string; search?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Customer>>>('/customers', { params: p }),
  getById:       (id: number)                                                               => axiosInstance.get<ApiResponse<Customer>>(`/customers/${id}`),
  create:        (data: { name: string; phone?: string; address?: string; gstNumber?: string; creditDays?: number }) => axiosInstance.post<ApiResponse<Customer>>('/customers', data),
  update:        (id: number, data: Partial<{ name: string; phone?: string; address?: string; gstNumber?: string; creditDays?: number }>) => axiosInstance.put<ApiResponse<Customer>>(`/customers/${id}`, data),
  getLedger:     (id: number) => axiosInstance.get<ApiResponse<unknown[]>>(`/customers/${id}/ledger`),
  getOutstanding:()           => axiosInstance.get<ApiResponse<Customer[]>>('/customers/outstanding'),
};
