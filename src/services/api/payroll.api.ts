import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, PayrollRun, PayrollDetail, PayrollCalculationLog, PayrollDashboard, PayrollException } from "@/types";

export interface GeneratePayrollRequest {
  year: number;
  month: number;
  remarks?: string;
}

export interface ActionRemarksRequest {
  remarks?: string;
}

export interface ReopenPayrollRequest {
  reason: string;
}

export interface DisburseRequest {
  paymentMode: "CASH" | "BANK";
  remarks?: string;
}

export const payrollApi = {
  // ── Lifecycle ──────────────────────────────────────────────────────────
  generate: (data: GeneratePayrollRequest) => axiosInstance.post<ApiResponse<PayrollRun>>("/payroll/generate", data),

  recalculate: (runId: number) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/recalculate`),

  verify: (runId: number, data?: ActionRemarksRequest) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/verify`, data ?? {}),

  approve: (runId: number, data?: ActionRemarksRequest) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/approve`, data ?? {}),

  reopen: (runId: number, data: ReopenPayrollRequest) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/reopen`, data),

  lockRun: (runId: number) => axiosInstance.post<ApiResponse<PayrollRun>>(`/payroll/${runId}/lock`),

  // ── Disbursement ───────────────────────────────────────────────────────
  disburseOne: (detailId: number, data: DisburseRequest) => axiosInstance.post<ApiResponse<PayrollDetail>>(`/payroll/details/${detailId}/disburse`, data),

  disburseAll: (runId: number, data: DisburseRequest) => axiosInstance.post<ApiResponse<void>>(`/payroll/${runId}/disburse-all`, data),

  // ── Reads ──────────────────────────────────────────────────────────────
  /** Current version of every period, newest first. */
  getAll: () => axiosInstance.get<ApiResponse<PayrollRun[]>>("/payroll"),

  getById: (runId: number) => axiosInstance.get<ApiResponse<PayrollRun>>(`/payroll/${runId}`),

  /** Every calculation version ever generated for a period, oldest first. */
  getVersionHistory: (year: number, month: number) => axiosInstance.get<ApiResponse<PayrollRun[]>>("/payroll/history", { params: { year, month } }),

  getDetails: (runId: number) => axiosInstance.get<ApiResponse<PayrollDetail[]>>(`/payroll/${runId}/details`),

  getPayslip: (empId: number, year: number, month: number) => axiosInstance.get<ApiResponse<PayrollDetail>>(`/payroll/employee/${empId}`, { params: { year, month } }),

  getCalculationLogs: (runId: number) => axiosInstance.get<ApiResponse<PayrollCalculationLog[]>>(`/payroll/${runId}/calculation-logs`),

  getEmployeeCalculationHistory: (empId: number) => axiosInstance.get<ApiResponse<PayrollCalculationLog[]>>(`/payroll/employee/${empId}/calculation-history`),

  getDashboard: (runId: number) => axiosInstance.get<ApiResponse<PayrollDashboard>>(`/payroll/${runId}/dashboard`),

  /** Pre-approval anomaly scan (missing checkout, pending OT, leave/holiday conflicts, etc). */
  getExceptionReport: (year: number, month: number) => axiosInstance.get<ApiResponse<PayrollException[]>>("/payroll/exceptions", { params: { year, month } }),
};
