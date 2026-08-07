import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, PageResponse, Employee, CreateEmployeeRequest, SalaryHistory, ChangeEmployeeStatusRequest, EmployeeDocumentList, EmployeeDocument, EmployeeDocumentType } from '@/types';
export interface EmployeeFilters { status?: string; search?: string; page?: number; size?: number; }
export const employeesApi = {
  getAll:         (p?: EmployeeFilters)                                                         => axiosInstance.get<ApiResponse<PageResponse<Employee>>>('/employees', { params: p }),
  getById:        (id: number)                                                                   => axiosInstance.get<ApiResponse<Employee>>(`/employees/${id}`),
  create:         (data: CreateEmployeeRequest)                                                  => axiosInstance.post<ApiResponse<Employee>>('/employees', data),
  update:         (id: number, data: Partial<CreateEmployeeRequest>)                            => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}`, data),
  updateSalary:   (id: number, data: { newSalary: number; effectiveFrom: string; remarks?: string }) => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}/salary`, data),
  getSalaryHistory:(id: number)                                                                  => axiosInstance.get<ApiResponse<SalaryHistory[]>>(`/employees/${id}/salary-history`),
  deactivate:     (id: number)                                                                   => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}/deactivate`),
  changeStatus:   (id: number, data: ChangeEmployeeStatusRequest)                                => axiosInstance.put<ApiResponse<Employee>>(`/employees/${id}/lifecycle`, data),
  getDocuments:   (id: number)                                                                   => axiosInstance.get<ApiResponse<EmployeeDocumentList>>(`/employees/${id}/documents`),
  uploadDocument: (id: number, documentType: EmployeeDocumentType, file: File, expiryDate?: string) => {
    const form = new FormData();
    form.append('documentType', documentType);
    if (expiryDate) form.append('expiryDate', expiryDate);
    form.append('file', file);
    return axiosInstance.post<ApiResponse<EmployeeDocument>>(`/employees/${id}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  archiveDocument:(employeeId: number, documentId: number)                                       => axiosInstance.delete<ApiResponse<void>>(`/employees/${employeeId}/documents/${documentId}`),
  getDocumentContent: (employeeId: number, documentId: number, download = false)                  => axiosInstance.get<Blob>(`/employees/${employeeId}/documents/${documentId}/content`, { params: { download }, responseType: 'blob' }),
  getProfilePhoto: (employeeId: number)                                                          => axiosInstance.get<Blob>(`/employees/${employeeId}/profile-photo`, { responseType: 'blob' }),
};
