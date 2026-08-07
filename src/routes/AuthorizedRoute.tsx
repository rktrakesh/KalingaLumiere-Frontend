import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute } from "@/utils/authorization";

export const AuthorizedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user || !canAccessRoute(user, location.pathname)) {
    return <Navigate to="/access-denied" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};
