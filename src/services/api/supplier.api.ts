import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Supplier } from '@/types';
export const supplierApi = {
  getAll:    (p?: { status?: string; search?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Supplier>>>('/suppliers', { params: p }),
  getById:   (id: number)                                                               => axiosInstance.get<ApiResponse<Supplier>>(`/suppliers/${id}`),
  create:    (data: { name: string; phone?: string; address?: string; materialsSupplied?: string }) => axiosInstance.post<ApiResponse<Supplier>>('/suppliers', data),
  update:    (id: number, data: Partial<{ name: string; phone?: string; address?: string; materialsSupplied?: string }>) => axiosInstance.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data),
  getLedger: (id: number) => axiosInstance.get<ApiResponse<unknown[]>>(`/suppliers/${id}/ledger`),
};
