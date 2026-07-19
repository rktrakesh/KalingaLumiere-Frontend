import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Sale, PaymentStatus } from '@/types';
export const salesApi = {
  getAll:        (p?: { customerId?: number; status?: PaymentStatus; from?: string; to?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Sale>>>('/sales', { params: p }),
  getById:       (id: number) => axiosInstance.get<ApiResponse<Sale>>(`/sales/${id}`),
  create:        (data: { customerId: number; invoiceDate: string; items: { materialId: number; quantityKg: number; unitRate: number }[]; remarks?: string }) => axiosInstance.post<ApiResponse<Sale>>('/sales', data),
  recordPayment: (id: number, data: { paymentDate: string; amount: number; paymentMode: 'CASH'|'BANK'; remarks?: string }) => axiosInstance.post<ApiResponse<Sale>>(`/sales/${id}/payment`, data),
  processReturn: (id: number, data: { materialId: number; quantityReturned: number; returnAmount: number; returnDate: string; remarks?: string }) => axiosInstance.post<ApiResponse<Sale>>(`/sales/${id}/return`, data),
};
