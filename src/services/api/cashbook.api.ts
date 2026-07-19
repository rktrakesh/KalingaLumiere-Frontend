import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, CashbookSummary, CashbookTransaction } from '@/types';
export const cashbookApi = {
  getSummary:     (year?: number, month?: number)  => axiosInstance.get<ApiResponse<CashbookSummary>>('/cashbook', { params: { year, month } }),
  getTransactions:(p?: { accountId?: number; from?: string; to?: string; type?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<CashbookTransaction>>>('/cashbook/transactions', { params: p }),
  manualEntry:    (data: { accountId: number; transactionDate: string; transactionType: string; flowType: string; amount: number; description?: string }) => axiosInstance.post<ApiResponse<CashbookTransaction>>('/cashbook/manual-entry', data),
};
