import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Expense, ExpenseCategory, ExpenseStatus } from '@/types';
export const expenseApi = {
  getAll:  (p?: { status?: ExpenseStatus; category?: ExpenseCategory; from?: string; to?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Expense>>>('/expenses', { params: p }),
  getById: (id: number)                                                              => axiosInstance.get<ApiResponse<Expense>>(`/expenses/${id}`),
  create:  (data: { expenseDate: string; amount: number; category: ExpenseCategory; remarks?: string }) => axiosInstance.post<ApiResponse<Expense>>('/expenses', data),
  update:  (id: number, data: Partial<{ expenseDate: string; amount: number; category: ExpenseCategory; remarks?: string }>) => axiosInstance.put<ApiResponse<Expense>>(`/expenses/${id}`, data),
  approve: (id: number)                        => axiosInstance.put<ApiResponse<Expense>>(`/expenses/${id}/approve`),
  cancel:  (id: number, remarks?: string)      => axiosInstance.put<ApiResponse<Expense>>(`/expenses/${id}/cancel`, null, { params: { remarks } }),
};
