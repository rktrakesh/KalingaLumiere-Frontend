import axiosInstance from '@/services/interceptors/axiosInstance';
import { ApiResponse, LoginRequest, TokenResponse, UserProfile } from '@/types';
interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export const authApi = {
  login:          (data: LoginRequest)            => axiosInstance.post<ApiResponse<TokenResponse>>('/auth/login', data),
  refresh:        (refreshToken: string)           => axiosInstance.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken }),
  logout:         ()                               => axiosInstance.post<ApiResponse<void>>('/auth/logout'),
  getProfile:     ()                               => axiosInstance.get<ApiResponse<UserProfile>>('/auth/me'),
  changePassword: (data: ChangePasswordRequest)   => axiosInstance.put<ApiResponse<void>>('/auth/change-password', data),
};
