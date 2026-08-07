import type { UserProfile, UserRole } from "@/types";

export const ALL_ROLES: UserRole[] = [
  "ROLE_ADMIN",
  "ROLE_MANAGER",
  "ROLE_SUPERVISOR",
  "ROLE_HR",
  "ROLE_FINANCE",
  "ROLE_SALES",
  "ROLE_EMPLOYEE",
];

export const roleLabel = (role: UserRole): string =>
  role.replace("ROLE_", "").replace(/_/g, " ");

export const authoritativeRoles = (
  user: Pick<UserProfile, "role" | "roles"> | null | undefined,
): UserRole[] => (user?.roles?.length ? user.roles : user?.role ? [user.role] : []);

export const hasRole = (
  user: Pick<UserProfile, "role" | "roles"> | null | undefined,
  role: UserRole,
): boolean => authoritativeRoles(user).includes(role);

export const hasAnyRole = (
  user: Pick<UserProfile, "role" | "roles"> | null | undefined,
  roles: readonly UserRole[],
): boolean => roles.some((role) => hasRole(user, role));

export const ROUTE_ROLES: Record<string, readonly UserRole[]> = {
  "/dashboard": ["ROLE_ADMIN"],
  "/performance-dashboard": ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SUPERVISOR", "ROLE_SALES", "ROLE_EMPLOYEE"],
  "/employees": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/attendance": ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SUPERVISOR", "ROLE_EMPLOYEE"],
  "/leave": ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  "/holidays": ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SUPERVISOR", "ROLE_EMPLOYEE"],
  "/overtime": ["ROLE_ADMIN"],
  "/payroll": ["ROLE_ADMIN"],
  "/loans": ["ROLE_ADMIN", "ROLE_EMPLOYEE"],
  "/expenses": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/cashbook": ["ROLE_ADMIN"],
  "/suppliers": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/customers": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/purchases": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/sales": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/inventory": ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SUPERVISOR"],
  "/production": ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_SUPERVISOR"],
  "/reports": ["ROLE_ADMIN", "ROLE_MANAGER"],
  "/settings": ["ROLE_ADMIN"],
  "/month-closing": ["ROLE_ADMIN"],
  "/notifications": ALL_ROLES,
  "/audit": ["ROLE_ADMIN"],
  "/user-management": ["ROLE_ADMIN"],
  "/profile": ALL_ROLES,
};

export const canAccessRoute = (
  user: Pick<UserProfile, "role" | "roles"> | null | undefined,
  path: string,
): boolean => {
  const route = Object.keys(ROUTE_ROLES)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => path === candidate || path.startsWith(`${candidate}/`));
  return route ? hasAnyRole(user, ROUTE_ROLES[route]) : false;
};

export const resolveHomeRoute = (
  user: Pick<UserProfile, "role" | "roles"> & Partial<Pick<UserProfile, "employeeCategory">>,
): string => {
  const preferred = hasRole(user, "ROLE_ADMIN")
    ? ["/dashboard"]
    : hasRole(user, "ROLE_SALES") || user.employeeCategory === "SALES"
      ? ["/performance-dashboard"]
      : hasRole(user, "ROLE_MANAGER")
        ? ["/employees", "/production"]
        : hasRole(user, "ROLE_SUPERVISOR")
          ? ["/attendance", "/production"]
          : hasRole(user, "ROLE_EMPLOYEE")
            ? ["/attendance", "/leave"]
            : ["/notifications"];
  return preferred.find((route) => canAccessRoute(user, route)) ?? "/access-denied";
};
