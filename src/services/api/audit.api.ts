import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, AuditLog } from '@/types';
export const auditApi = {
  search:       (p?: { module?: string; username?: string; from?: string; to?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<AuditLog>>>('/audit', { params: p }),
  getForEntity: (entityType: string, entityId: number) => axiosInstance.get<ApiResponse<AuditLog[]>>(`/audit/${entityType}/${entityId}`),
};
