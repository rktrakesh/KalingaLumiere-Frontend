import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, EmployeePerformanceDashboard, ManagementPerformanceDashboard } from "@/types";

export interface PerformancePeriodParams {
  year?: number;
  month?: number;
}

export const performanceApi = {
  getMyDashboard: (params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<EmployeePerformanceDashboard>>("/performance/me", { params }),

  getEmployeeDashboard: (employeeId: number, params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<EmployeePerformanceDashboard>>(`/performance/employee/${employeeId}`, { params }),

  getManagementDashboard: (params?: PerformancePeriodParams) => axiosInstance.get<ApiResponse<ManagementPerformanceDashboard>>("/performance/dashboard", { params }),
};
