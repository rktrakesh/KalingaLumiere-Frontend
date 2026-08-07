import type { UserProfile } from "@/types";
import { resolveHomeRoute } from "@/utils/authorization";

export function resolveDashboardRoute(profile: Pick<UserProfile, "role" | "roles" | "employeeCategory">): string {
  return resolveHomeRoute(profile);
}
