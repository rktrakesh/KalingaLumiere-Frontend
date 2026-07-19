import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Purchase, PaymentStatus } from '@/types';
export const purchaseApi = {
  getAll:        (p?: { supplierId?: number; status?: PaymentStatus; from?: string; to?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Purchase>>>('/purchases', { params: p }),
  getById:       (id: number) => axiosInstance.get<ApiResponse<Purchase>>(`/purchases/${id}`),
  create:        (data: { supplierId: number; purchaseDate: string; items: { materialId: number; quantity: number; unitRate: number }[]; remarks?: string }) => axiosInstance.post<ApiResponse<Purchase>>('/purchases', data),
  recordPayment: (id: number, data: { paymentDate: string; amount: number; paymentMode: 'CASH'|'BANK'; remarks?: string }) => axiosInstance.post<ApiResponse<Purchase>>(`/purchases/${id}/payment`, data),
};
