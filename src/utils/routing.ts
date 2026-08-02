import type { UserProfile } from "@/types";

export function resolveDashboardRoute(profile: Pick<UserProfile, "role" | "employeeCategory">): string {
  if (profile.role === "ROLE_ADMIN" || profile.role === "ROLE_MANAGER") {
    return "/dashboard";
  }
  if (profile.employeeCategory === "SALES") {
    return "/performance-dashboard";
  }
  return "/dashboard";
}
