import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const ProtectedRoute = () => {
  const { isAuthenticated, mustChangePassword } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const forcedPasswordAllowed = ["/change-password", "/profile"].includes(location.pathname);
  if (mustChangePassword() && !forcedPasswordAllowed) {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
};
