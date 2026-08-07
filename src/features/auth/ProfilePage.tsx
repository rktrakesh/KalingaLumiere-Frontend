import { ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { authoritativeRoles, roleLabel } from "@/utils/authorization";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your authenticated account details" icon={<UserRound size={20} />} />
      <Card className="max-w-2xl p-5 sm:p-6">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div><dt className="text-xs text-gray-500">Full name</dt><dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</dd></div>
          <div><dt className="text-xs text-gray-500">Username</dt><dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{user.username}</dd></div>
          <div><dt className="text-xs text-gray-500">Account status</dt><dd className="mt-1"><Badge variant={user.enabled && user.accountNonLocked ? "success" : "danger"}>{user.status}</Badge></dd></div>
          <div><dt className="text-xs text-gray-500">Roles</dt><dd className="mt-1 flex flex-wrap gap-1">{authoritativeRoles(user).map((role) => <Badge key={role} variant="info">{roleLabel(role)}</Badge>)}</dd></div>
          {user.mustChangePassword && <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"><ShieldCheck size={16} /> A permanent password must be set before using the ERP.</div>}
        </dl>
      </Card>
    </div>
  );
}
