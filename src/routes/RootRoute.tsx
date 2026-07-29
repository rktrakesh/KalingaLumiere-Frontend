import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LandingPage from "@/features/landing/LandingPage";

/**
 * The public "/" route. Kalinga Lumière's brand landing page is the default
 * entry point for signed-out visitors; anyone already authenticated is sent
 * straight to their dashboard instead of seeing the marketing page again.
 */
export const RootRoute = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
};
