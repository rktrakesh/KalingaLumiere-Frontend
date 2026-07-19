import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Loan, LoanLedger } from '@/types';
export const loanApi = {
  getAll:       (p?: { employeeId?: number; status?: string; page?: number; size?: number }) => axiosInstance.get<ApiResponse<PageResponse<Loan>>>('/loans', { params: p }),
  create:       (data: { employeeId: number; principalAmount: number; interestRate: number; monthlyPrincipalPayment: number; remarks?: string }) => axiosInstance.post<ApiResponse<Loan>>('/loans', data),
  approve:      (id: number)                   => axiosInstance.put<ApiResponse<Loan>>(`/loans/${id}/approve`),
  reject:       (id: number, remarks?: string) => axiosInstance.put<ApiResponse<Loan>>(`/loans/${id}/reject`, null, { params: { remarks } }),
  getLedger:    (id: number)                   => axiosInstance.get<ApiResponse<LoanLedger[]>>(`/loans/${id}/ledger`),
  getActiveLoan:(empId: number)                => axiosInstance.get<ApiResponse<Loan>>(`/loans/employee/${empId}/active`),
};
