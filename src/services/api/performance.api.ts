import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, CreateSalesPolicyRequest, EmployeePerformanceDashboard, ManagementPerformanceDashboard, SalesPolicy } from "@/types";

export interface PerformancePeriodParams {
  year?: number;
  month?: number;
}

export const performanceApi = {
  getMyDashboard: (params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<EmployeePerformanceDashboard>>("/performance/me", { params }),

  getEmployeeDashboard: (employeeId: number, params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<EmployeePerformanceDashboard>>(`/performance/employee/${employeeId}`, { params }),

  getManagementDashboard: (params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<ManagementPerformanceDashboard>>("/performance/dashboard", { params }),

  createSalesPolicy: (data: CreateSalesPolicyRequest) => axiosInstance.post<ApiResponse<SalesPolicy>>("/performance/sales-policies", data),

  getSalesPolicyHistory: (employeeId: number) => axiosInstance.get<ApiResponse<SalesPolicy[]>>(`/performance/sales-policies/employee/${employeeId}/history`),
};
