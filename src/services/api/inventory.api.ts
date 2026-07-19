import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Material, InventoryLedgerEntry } from '@/types';
export const inventoryApi = {
  getMaterials:   ()                                                                     => axiosInstance.get<ApiResponse<Material[]>>('/materials'),
  createMaterial: (data: { name: string; unit: string; materialType: string; reorderLevel?: number }) => axiosInstance.post<ApiResponse<Material>>('/materials', data),
  adjust:         (data: { materialId: number; quantity: number; adjustmentDate: string; remarks: string; unitCost?: number }) => axiosInstance.post<ApiResponse<InventoryLedgerEntry>>('/inventory/adjustment', data),
  getLedger:      (materialId: number, p?: { page?: number; size?: number })           => axiosInstance.get<ApiResponse<PageResponse<InventoryLedgerEntry>>>(`/inventory/ledger/${materialId}`, { params: p }),
  getLowStock:    ()                                                                     => axiosInstance.get<ApiResponse<Material[]>>('/inventory/low-stock'),
};
