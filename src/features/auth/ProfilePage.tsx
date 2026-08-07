import { ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { authoritativeRoles, hasAnyRole, roleLabel } from "@/utils/authorization";
import { EmployeeDocumentsPanel } from "@/features/employees/EmployeeDocumentsPanel";
import { EmployeeProfilePhoto } from "@/features/employees/EmployeeProfilePhoto";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  const canViewOwnDocuments = !!user.employeeId && hasAnyRole(user, ["ROLE_ADMIN", "ROLE_HR", "ROLE_EMPLOYEE", "ROLE_SALES"]);
  const canViewProfilePhoto = !!user.employeeId && hasAnyRole(user, ["ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER", "ROLE_EMPLOYEE", "ROLE_SALES"]);
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your authenticated account details" icon={<UserRound size={20} />} />
      <Card className="max-w-2xl p-5 sm:p-6">
        {canViewProfilePhoto && <div className="mb-5 flex items-center gap-3 border-b border-gray-200 pb-5 dark:border-gray-700"><EmployeeProfilePhoto employeeId={user.employeeId!} employeeName={user.fullName} /><div><p className="font-semibold text-gray-900 dark:text-white">{user.fullName}</p><p className="text-xs text-gray-500">Employee profile</p></div></div>}
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-xs text-gray-500">Full name</dt><dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</dd></div>
          <div><dt className="text-xs text-gray-500">Username</dt><dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{user.username}</dd></div>
          <div><dt className="text-xs text-gray-500">Account status</dt><dd className="mt-1"><Badge variant={user.enabled && user.accountNonLocked ? "success" : "danger"}>{user.status}</Badge></dd></div>
          <div><dt className="text-xs text-gray-500">Roles</dt><dd className="mt-1 flex flex-wrap gap-1">{authoritativeRoles(user).map((role) => <Badge key={role} variant="info">{roleLabel(role)}</Badge>)}</dd></div>
          {user.mustChangePassword && <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"><ShieldCheck size={16} /> A permanent password must be set before using the ERP.</div>}
        </dl>
      </Card>
      {canViewOwnDocuments && <section className="mt-6"><div className="mb-3"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Documents</h2><p className="text-sm text-gray-500">View and securely download your current employee documents.</p></div><EmployeeDocumentsPanel employeeId={user.employeeId!} /></section>}
    </div>
  );
}
