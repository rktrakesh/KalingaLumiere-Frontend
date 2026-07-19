import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, ProductionBatch } from '@/types';
export const productionApi = {
  getAll:    (p?: { status?: string; from?: string; to?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<ProductionBatch>>>('/production/batches', { params: p }),
  getById:   (id: number) => axiosInstance.get<ApiResponse<ProductionBatch>>(`/production/batches/${id}`),
  create:    (data: { batchDate: string; inputs: { materialId: number; quantityUsed: number }[]; remarks?: string }) => axiosInstance.post<ApiResponse<ProductionBatch>>('/production/batches', data),
  complete:  (id: number, data: { outputs: { materialId: number; finishedQuantity: number; wasteQuantity?: number }[]; remarks?: string }) => axiosInstance.put<ApiResponse<ProductionBatch>>(`/production/batches/${id}/complete`, data),
  cancel:    (id: number, remarks?: string) => axiosInstance.put<ApiResponse<ProductionBatch>>(`/production/batches/${id}/cancel`, null, { params: { remarks } }),
};
