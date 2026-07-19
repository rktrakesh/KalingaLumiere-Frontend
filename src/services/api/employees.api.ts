import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Employee, CreateEmployeeRequest, SalaryHistory } from '@/types';
export interface EmployeeFilters { status?: string; search?: string; page?: number; size?: number; }
export const employeesApi = {
  getAll:         (p?: EmployeeFilters)                                                         => axiosInstance.get<ApiResponse<PageResponse<Employee>>>('/employees', { params: p }),
  getById:        (id: number)                                                                   => axiosInstance.get<ApiResponse<Employee>>(`/employees/${id}`),
  create:         (data: CreateEmployeeRequest)                                                  => axiosInstance.post<ApiResponse<Employee>>('/employees', data),
  update:         (id: number, data: Partial<CreateEmployeeRequest>)                            => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  updateSalary:   (id: number, data: { newSalary: number; effectiveFrom: string; remarks?: string }) => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}/salary`, data),
  getSalaryHistory:(id: number)                                                                  => axiosInstance.get<ApiResponse<SalaryHistory[]>>(`/employees/${id}/salary-history`),
  deactivate:     (id: number)                                                                   => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}/deactivate`),
};
