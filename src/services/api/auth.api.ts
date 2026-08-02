import axiosInstance from "@/services/interceptors/axiosInstance";
import { ApiResponse, LoginRequest, TokenResponse, UserProfile } from "@/types";
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  login: (data: LoginRequest) => axiosInstance.post<ApiResponse<TokenResponse>>("/auth/login", data),
  refresh: (refreshToken: string) => axiosInstance.post<ApiResponse<TokenResponse>>("/auth/refresh", { refreshToken }),
  logout: () => axiosInstance.post<ApiResponse<void>>("/auth/logout"),
  getProfile: () => axiosInstance.get<ApiResponse<UserProfile>>("/auth/me"),
  changePassword: (data: ChangePasswordRequest) => axiosInstance.put<ApiResponse<void>>("/auth/change-password", data),
  forgotPassword: (data: ForgotPasswordRequest) => axiosInstance.post<ApiResponse<void>>("/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordRequest) => axiosInstance.post<ApiResponse<void>>("/auth/reset-password", data),
};
