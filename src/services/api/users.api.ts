import axiosInstance from "@/services/interceptors/axiosInstance";
import type { ApiResponse, TemporaryPasswordResetResponse, UserProfile, UserRole } from "@/types";

export const usersApi = {
  getUsers: () => axiosInstance.get<ApiResponse<UserProfile[]>>("/users"),
  enableUser: (id: number) => axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/enable`),
  deactivateUser: (id: number) => axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/deactivate`),
  lockUser: (id: number) => axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/lock`),
  unlockUser: (id: number) => axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/unlock`),
  resetTemporaryPassword: (id: number) =>
    axiosInstance.post<ApiResponse<TemporaryPasswordResetResponse>>(`/users/${id}/reset-temporary-password`),
  assignRole: (id: number, role: UserRole) =>
    axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/roles/${role}`),
  removeRole: (id: number, role: UserRole) =>
    axiosInstance.delete<ApiResponse<UserProfile>>(`/users/${id}/roles/${role}`),
  linkEmployee: (id: number, employeeId: number) =>
    axiosInstance.put<ApiResponse<UserProfile>>(`/users/${id}/employee/${employeeId}`),
  unlinkEmployee: (id: number) =>
    axiosInstance.delete<ApiResponse<UserProfile>>(`/users/${id}/employee`),
};
