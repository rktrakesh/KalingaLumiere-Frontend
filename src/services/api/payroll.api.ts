import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, PayrollRun, PayrollDetail } from "@/types";

export interface DisburseRequest {
  paymentMode: "CASH" | "BANK";
  remarks?: string;
}

export const payrollApi = {
  getAll: () => axiosInstance.get<ApiResponse<PayrollRun[]>>("/payroll"),

  getById: (runId: number) => axiosInstance.get<ApiResponse<PayrollRun>>(`/payroll/${runId}`),

  getDetails: (runId: number) => axiosInstance.get<ApiResponse<PayrollDetail[]>>(`/payroll/${runId}/details`),

  generate: (data: { year: number; month: number; remarks?: string }) => axiosInstance.post<ApiResponse<PayrollRun>>("/payroll/generate", data),

  regenerate: (runId: number) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/regenerate/${runId}`),

  getPayslip: (empId: number, year: number, month: number) => axiosInstance.get<ApiResponse<PayrollDetail>>(`/payroll/employee/${empId}`, { params: { year, month } }),

  // ── NEW: Disbursement endpoints ──
  disburseOne: (detailId: number, data: DisburseRequest) => axiosInstance.post<ApiResponse<PayrollDetail>>(`/payroll/details/${detailId}/disburse`, data),

  disburseAll: (runId: number, data: DisburseRequest) => axiosInstance.post<ApiResponse<void>>(`/payroll/${runId}/disburse-all`, data),

  lockRun: (runId: number) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/lock`),
};
