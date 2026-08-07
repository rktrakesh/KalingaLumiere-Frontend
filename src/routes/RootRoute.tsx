import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "@/features/landing/LandingPage";
import { resolveDashboardRoute } from "@/utils/routing";

export const RootRoute = () => {
  const { isAuthenticated, user, mustChangePassword } = useAuthStore();
  if (isAuthenticated) {
    if (mustChangePassword()) return <Navigate to="/change-password" replace />;
    return <Navigate to={user ? resolveDashboardRoute(user) : "/dashboard"} replace />;
  }
  return <LandingPage />;
};
