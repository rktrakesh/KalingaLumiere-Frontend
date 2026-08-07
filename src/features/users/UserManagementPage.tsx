import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { Check, Clipboard, KeyRound, Link2, LockKeyhole, ShieldCheck, Unlink, UserCog, UserX } from "lucide-react";
import { usersApi } from "@/services/api/users.api";
import { employeesApi } from "@/services/api/employees.api";
import type { ApiResponse, Employee, TemporaryPasswordResetResponse, UserProfile } from "@/types";
import { ALL_ROLES, authoritativeRoles, roleLabel } from "@/utils/authorization";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/format";
import { useToast } from "@/hooks/useToast";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchFilter } from "@/components/common/SearchFilter";
import { DataTable, type Column } from "@/components/common/DataTable";
import { AccountStateBadges } from "@/components/auth/AccountStateBadges";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type MutationVariables = { action: () => Promise<AxiosResponse<ApiResponse<UserProfile>>>; success: string };

const optionalDate = (value?: string | null) => value ? formatDateTime(value) : "Never";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [unlinkUser, setUnlinkUser] = useState<UserProfile | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<TemporaryPasswordResetResponse | null>(null);
  const [temporaryPasswordUserId, setTemporaryPasswordUserId] = useState<number | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<UserProfile | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["iam-users"],
    queryFn: () => usersApi.getUsers(),
    refetchInterval: temporaryPassword ? 3_000 : false,
  });
  const employeesQuery = useQuery({ queryKey: ["employees", "iam-link"], queryFn: () => employeesApi.getAll({ page: 0, size: 200, status: "ACTIVE" }) });
  const users = usersQuery.data?.data.data ?? [];
  const employees = employeesQuery.data?.data.data.content ?? [];
  const employeeById = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees]);
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => [user.username, user.fullName, String(user.employeeId ?? ""), ...authoritativeRoles(user)].some((value) => value.toLowerCase().includes(term)));
  }, [search, users]);

  useEffect(() => {
    if (!temporaryPassword || temporaryPasswordUserId == null) return;
    const refreshedUser = users.find((user) => user.id === temporaryPasswordUserId);
    if (refreshedUser && !refreshedUser.mustChangePassword) {
      setTemporaryPassword(null);
      setTemporaryPasswordUserId(null);
    }
  }, [temporaryPassword, temporaryPasswordUserId, users]);

  useEffect(() => {
    if (!selected) return;
    const refreshedUser = users.find((user) => user.id === selected.id);
    if (refreshedUser && refreshedUser !== selected) setSelected(refreshedUser);
  }, [selected, users]);

  const clearTemporaryPassword = () => {
    setTemporaryPassword(null);
    setTemporaryPasswordUserId(null);
  };

  const refresh = (updated?: UserProfile) => {
    queryClient.invalidateQueries({ queryKey: ["iam-users"] });
    if (updated) setSelected(updated);
  };

  const lifecycleMutation = useMutation({
    mutationFn: ({ action }: MutationVariables) => action(),
    onSuccess: (response, variables) => {
      refresh(response.data.data);
      toast.success(variables.success);
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "The account could not be updated.")),
  });

  const run = (action: MutationVariables["action"], success: string) => lifecycleMutation.mutate({ action, success });
  const handleResetTemporaryPassword = async (userId: number) => {
    setResettingPassword(true);
    try {
      const response = await usersApi.resetTemporaryPassword(userId);
      setTemporaryPassword(response.data.data);
      setTemporaryPasswordUserId(userId);
      setPasswordResetUser(null);
      refresh();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "A temporary password could not be generated."));
    } finally {
      setResettingPassword(false);
    }
  };

  const columns: Column<UserProfile>[] = [
    { key: "user", header: "User", render: (user) => <div><p className="font-semibold text-gray-900 dark:text-white">{user.fullName}</p><p className="text-xs text-gray-500">{user.username}</p></div> },
    { key: "employee", header: "Employee link", render: (user) => user.employeeId ? <span>{employeeById.get(user.employeeId)?.name ?? `Employee #${user.employeeId}`}</span> : <span className="text-gray-400">Not linked</span> },
    { key: "compatibilityRole", header: "Compatibility role", render: (user) => <Badge variant="neutral">{roleLabel(user.role)}</Badge> },
    { key: "roles", header: "Authoritative roles", render: (user) => <div className="flex flex-wrap gap-1">{authoritativeRoles(user).map((role) => <Badge key={role} variant="info">{roleLabel(role)}</Badge>)}</div> },
    { key: "state", header: "Account state", render: (user) => <AccountStateBadges user={user} /> },
    { key: "failed", header: "Failed attempts", render: (user) => <span className="tabular-nums">{user.failedLoginAttempts}</span>, className: "text-right", headerClassName: "text-right" },
    { key: "lastLogin", header: "Last login", render: (user) => optionalDate(user.lastLoginAt) },
    { key: "temporaryExpiry", header: "Temporary expiry", render: (user) => optionalDate(user.temporaryPasswordExpiresAt) },
    { key: "actions", header: "Actions", render: (user) => <Button size="sm" variant="outline" icon={<UserCog size={14} />} onClick={() => { setSelected(user); setEmployeeId(user.employeeId ? String(user.employeeId) : ""); }}>Manage</Button> },
  ];

  const selectedRoles = selected ? authoritativeRoles(selected) : [];
  const availableEmployees = employees.filter((employee) => !users.some((user) => user.employeeId === employee.id && user.id !== selected?.id));

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users.length} system accounts`} icon={<ShieldCheck size={20} />} />
      <SearchFilter search={search} onSearchChange={setSearch} placeholder="Search users, employees or roles…" />
      <DataTable columns={columns} data={filteredUsers} loading={usersQuery.isLoading} rowKey={(user) => user.id} emptyMessage="No user accounts found." />

      <Modal isOpen={Boolean(selected)} onClose={() => { setSelected(null); setEmployeeId(""); }} title={selected ? `Manage ${selected.fullName}` : "Manage user"} size="2xl">
        {selected && (
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account state</h3>
              <div className="mt-3"><AccountStateBadges user={selected} /></div>
              <dl className="mt-4 grid gap-3 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 sm:grid-cols-2">
                <div><dt className="text-xs text-gray-500">Status</dt><dd className="mt-1 font-medium">{selected.status}</dd></div>
                <div><dt className="text-xs text-gray-500">Compatibility role (read-only)</dt><dd className="mt-1 font-medium">{roleLabel(selected.role)}</dd></div>
                <div><dt className="text-xs text-gray-500">Failed login attempts</dt><dd className="mt-1 font-medium tabular-nums">{selected.failedLoginAttempts}</dd></div>
                <div><dt className="text-xs text-gray-500">Last login</dt><dd className="mt-1 font-medium">{optionalDate(selected.lastLoginAt)}</dd></div>
                <div><dt className="text-xs text-gray-500">Temporary password issued</dt><dd className="mt-1 font-medium">{optionalDate(selected.temporaryPasswordIssuedAt)}</dd></div>
                <div><dt className="text-xs text-gray-500">Temporary password expiry</dt><dd className="mt-1 font-medium">{optionalDate(selected.temporaryPasswordExpiresAt)}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant={selected.enabled ? "danger" : "secondary"} icon={selected.enabled ? <UserX size={14} /> : <Check size={14} />} loading={lifecycleMutation.isPending} onClick={() => run(() => selected.enabled ? usersApi.deactivateUser(selected.id) : usersApi.enableUser(selected.id), selected.enabled ? "User deactivated" : "User enabled")}>{selected.enabled ? "Deactivate" : "Enable"}</Button>
                <Button size="sm" variant="outline" icon={<LockKeyhole size={14} />} loading={lifecycleMutation.isPending} onClick={() => run(() => selected.accountNonLocked ? usersApi.lockUser(selected.id) : usersApi.unlockUser(selected.id), selected.accountNonLocked ? "User locked" : "User unlocked")}>{selected.accountNonLocked ? "Lock" : "Unlock"}</Button>
                <Button size="sm" variant="outline" icon={<KeyRound size={14} />} loading={resettingPassword} onClick={() => setPasswordResetUser(selected)}>Reset temporary password</Button>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-5 dark:border-gray-700">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Authoritative roles</h3>
              <p className="mt-1 text-xs text-gray-500">Compatibility role precedence is determined by the backend.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ALL_ROLES.map((role) => {
                  const assigned = selectedRoles.includes(role);
                  return <div key={role} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"><span className="text-sm font-medium">{roleLabel(role)}</span><Button size="sm" variant={assigned ? "ghost" : "outline"} disabled={assigned && selectedRoles.length === 1} loading={lifecycleMutation.isPending} onClick={() => run(() => assigned ? usersApi.removeRole(selected.id, role) : usersApi.assignRole(selected.id, role), assigned ? "Role removed" : "Role assigned")}>{assigned ? "Remove" : "Assign"}</Button></div>;
                })}
              </div>
              {selectedRoles.length === 1 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">The final role cannot be removed.</p>}
            </section>

            <section className="border-t border-gray-200 pt-5 dark:border-gray-700">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Employee link</h3>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1"><Select label="Employee" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="Select an active employee" options={availableEmployees.map((employee: Employee) => ({ value: String(employee.id), label: `${employee.employeeCode} — ${employee.name}` }))} /></div>
                <Button icon={<Link2 size={14} />} disabled={!employeeId || Number(employeeId) === selected.employeeId} loading={lifecycleMutation.isPending} onClick={() => run(() => usersApi.linkEmployee(selected.id, Number(employeeId)), "Employee linked")}>Link</Button>
                {selected.employeeId && <Button variant="outline" icon={<Unlink size={14} />} onClick={() => setUnlinkUser(selected)}>Unlink</Button>}
              </div>
            </section>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={Boolean(unlinkUser)} onClose={() => setUnlinkUser(null)} onConfirm={() => { if (!unlinkUser) return; run(() => usersApi.unlinkEmployee(unlinkUser.id), "Employee unlinked"); setUnlinkUser(null); }} title="Unlink employee?" message="This removes the association only. Neither the user account nor employee record will be deleted." confirmLabel="Unlink" loading={lifecycleMutation.isPending} />

      <ConfirmModal
        isOpen={Boolean(passwordResetUser)}
        onClose={() => setPasswordResetUser(null)}
        onConfirm={() => passwordResetUser && handleResetTemporaryPassword(passwordResetUser.id)}
        title="Reset this user's password?"
        message="This immediately replaces the current password, signs the user out of existing sessions, and requires them to sign in with a new temporary password and change it again."
        confirmLabel="Reset password"
        loading={resettingPassword}
      />

      <Modal isOpen={Boolean(temporaryPassword)} onClose={clearTemporaryPassword} title="Temporary password generated" size="sm" footer={<Button onClick={clearTemporaryPassword}>I have recorded it</Button>}>
        {temporaryPassword && <div className="space-y-4"><p className="text-sm text-gray-600 dark:text-gray-300">This password is shown once and cannot be retrieved again. Share it securely.</p><div className="flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 p-3"><code className="min-w-0 flex-1 break-all text-base font-semibold text-gray-900 dark:text-white">{temporaryPassword.temporaryPassword}</code><Button size="sm" variant="outline" icon={<Clipboard size={14} />} onClick={async () => { await navigator.clipboard.writeText(temporaryPassword.temporaryPassword); toast.success("Temporary password copied"); }}>Copy</Button></div><dl className="space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-gray-500">Expires</dt><dd className="text-right font-medium">{formatDateTime(temporaryPassword.temporaryPasswordExpiresAt)}</dd></div><div className="flex justify-between gap-3"><dt className="text-gray-500">Password change required</dt><dd className="font-medium">{temporaryPassword.mustChangePassword ? "Yes" : "No"}</dd></div><div className="flex justify-between gap-3"><dt className="text-gray-500">Email delivery attempted</dt><dd className="font-medium">{temporaryPassword.emailDeliveryAttempted ? "Yes" : "No"}</dd></div></dl></div>}
      </Modal>
    </div>
  );
}
