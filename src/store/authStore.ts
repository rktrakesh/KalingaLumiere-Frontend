import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile, UserRole } from "@/types";
import { hasAnyRole, hasRole } from "@/utils/authorization";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setTokens: (a: string, r: string) => void;
  setUser: (u: UserProfile) => void;
  logout: () => void;
  hasRole: (r: UserRole) => boolean;
  hasAnyRole: (roles: readonly UserRole[]) => boolean;
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
      hasRole: (role) => hasRole(get().user, role),
      hasAnyRole: (roles) => hasAnyRole(get().user, roles),
      isAdmin: () => hasRole(get().user, "ROLE_ADMIN"),
      isManager: () => hasAnyRole(get().user, ["ROLE_ADMIN", "ROLE_MANAGER"]),
      mustChangePassword: () => get().user?.mustChangePassword === true,
      isSalesEmployee: () => hasRole(get().user, "ROLE_SALES") || get().user?.employeeCategory === "SALES",
    }),
    { name: "kalinga-auth", partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
