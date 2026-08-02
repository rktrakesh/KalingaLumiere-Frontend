import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserRole } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setTokens: (a: string, r: string) => void;
  setUser: (u: UserProfile) => void;
  logout: () => void;
  hasRole: (r: UserRole) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  /** True immediately after onboarding or an admin-triggered reset — the app must route
   *  to Change Password and block everything else (mirrors the backend's JwtAuthFilter
   *  enforcement; this is the UX-level version of the same rule). */
  mustChangePassword: () => boolean;
  isSalesEmployee: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      hasRole: (role) => get().user?.role === role,
      isAdmin: () => get().user?.role === "ROLE_ADMIN",
      isManager: () => ["ROLE_ADMIN", "ROLE_MANAGER"].includes(get().user?.role ?? ""),
      mustChangePassword: () => get().user?.mustChangePassword === true,
      isSalesEmployee: () => get().user?.employeeCategory === "SALES",
    }),
    { name: "kalinga-auth", partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
