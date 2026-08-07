import axiosInstance from "@/services/interceptors/axiosInstance";
import type { ApiResponse, DesignationMasterData, EmployeeMasterData } from "@/types";

export const employeeMastersApi = {
  getEmployeeCategories: () => axiosInstance.get<ApiResponse<EmployeeMasterData[]>>("/masters/employee-categories", { params: { activeOnly: true } }),
  getDesignations: (categoryId?: number) => axiosInstance.get<ApiResponse<DesignationMasterData[]>>("/masters/designations", { params: { categoryId, activeOnly: true } }),
  getDepartments: () => axiosInstance.get<ApiResponse<EmployeeMasterData[]>>("/masters/departments", { params: { activeOnly: true } }),
};
