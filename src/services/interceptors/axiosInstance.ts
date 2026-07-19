import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9090/api/v1";

// Separate instance for refresh calls — avoids interceptor loop
const refreshAxios = axios.create({ baseURL: BASE_URL, timeout: 15000 });

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach current access token ──────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Token refresh state ───────────────────────────────────────────────────
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const resolveQueue = (token: string) => {
  pendingRequests.forEach((p) => p.resolve(token));
  pendingRequests = [];
};

const rejectQueue = (err: unknown) => {
  pendingRequests.forEach((p) => p.reject(err));
  pendingRequests = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // Clear Zustand persisted auth store
  localStorage.removeItem("kalinga-auth");
  window.location.href = "/login";
};

// ── Response interceptor: handle 401 → refresh → retry ───────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch(() => Promise.reject(error));
    }

    // Start refresh
    isRefreshing = true;
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      isRefreshing = false;
      rejectQueue(error);
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const res = await refreshAxios.post("/auth/refresh", { refreshToken });
      const { accessToken, refreshToken: newRefresh } = res.data.data;

      // Store new tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefresh);

      // Update Zustand store without triggering re-renders
      const stored = localStorage.getItem("kalinga-auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.state.accessToken = accessToken;
          parsed.state.refreshToken = newRefresh;
          localStorage.setItem("kalinga-auth", JSON.stringify(parsed));
        } catch {
          /* ignore parse errors */
        }
      }

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Resolve all queued requests
      resolveQueue(accessToken);

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      rejectQueue(refreshError);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
