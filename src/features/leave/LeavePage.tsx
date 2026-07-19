import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Plus, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leaveApi } from "@/services/api/leave.api";
import { employeesApi } from "@/services/api/employees.api";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import { usePagination } from "@/hooks/usePagination";
import { LeaveRequest } from "@/types";
import { formatDate } from "@/utils/format";

const schema = z.object({
  employeeId: z.coerce.number().positive("Select an employee"),
  leaveDate: z.string().min(1, "Leave date is required"),
  reason: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LeavePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [showCreate, setShowCreate] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // ── Fetch all active employees for dropdown ────────────────────────────
  const { data: empData } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => employeesApi.getAll({ status: "ACTIVE", size: 200 }),
  });
  const employeeOptions = (empData?.data?.data?.content ?? []).map((e: any) => ({
    value: String(e.id),
    label: `${e.employeeCode} — ${e.name}`,
  }));

  // ── Leave requests ─────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["leaves", page, size, statusFilter],
    queryFn: () => leaveApi.getAll({ page, size, status: statusFilter || undefined }),
  });
  const pageData = data?.data?.data;
  const leaves: LeaveRequest[] = pageData?.content ?? [];

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  // ── Mutations ──────────────────────────────────────────────────────────
  const createM = useMutation({
    mutationFn: (d: FormData) => leaveApi.request(d),
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setShowCreate(false);
      form.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to submit leave request"),
  });

  const approveM = useMutation({
    mutationFn: (id: number) => leaveApi.approve(id),
    onSuccess: () => {
      toast.success("Leave approved");
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Approval failed"),
  });

  const rejectM = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => leaveApi.reject(id, reason),
    onSuccess: () => {
      toast.success("Leave rejected");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setRejectId(null);
      setRejectReason("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Rejection failed"),
  });

  const columns: Column<LeaveRequest>[] = [
    {
      key: "emp",
      header: "Employee",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.employeeName}</p>
          <p className="text-xs text-gray-400">{r.employeeCode}</p>
        </div>
      ),
    },
    { key: "date", header: "Leave Date", render: (r) => formatDate(r.leaveDate) },
    { key: "reason", header: "Reason", render: (r) => <span className="text-sm text-gray-500 truncate max-w-xs block">{r.reason ?? "—"}</span> },
    { key: "stat", header: "Status", render: (r) => <Badge variant={statusBadge(r.status)}>{r.status}</Badge> },
    {
      key: "by",
      header: "Approved By",
      render: (r) =>
        r.approvedBy ? (
          <div>
            <p className="text-sm">{r.approvedBy}</p>
            <p className="text-xs text-gray-400">{r.approvedDate ? formatDate(r.approvedDate) : ""}</p>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "act",
      header: "Actions",
      render: (r) =>
        r.status === "PENDING" ? (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" icon={<CheckCircle size={13} />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" loading={approveM.isPending} onClick={() => approveM.mutate(r.id)}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<XCircle size={13} />}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                setRejectId(r.id);
                setRejectReason("");
              }}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave Management"
        subtitle="Review and manage employee leave requests"
        icon={<CalendarCheck size={20} />}
        actions={
          <Button
            icon={<Plus size={15} />}
            onClick={() => {
              setShowCreate(true);
              form.reset();
            }}
          >
            New Request
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              goToPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={leaves} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={(r) => r.id} emptyMessage="No leave requests found" />

      {/* ── New Leave Request Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          form.reset();
        }}
        title="New Leave Request"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button loading={createM.isPending} onClick={form.handleSubmit((d) => createM.mutate(d))}>
              Submit Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Employee dropdown */}
          <Select label="Employee *" options={employeeOptions} placeholder="Select employee" error={form.formState.errors.employeeId?.message} {...form.register("employeeId")} />
          <Input label="Leave Date *" type="date" error={form.formState.errors.leaveDate?.message} {...form.register("leaveDate")} />
          <Textarea label="Reason" placeholder="Reason for leave (optional)" {...form.register("reason")} />
        </div>
      </Modal>

      {/* ── Reject Leave Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={!!rejectId}
        onClose={() => {
          setRejectId(null);
          setRejectReason("");
        }}
        title="Reject Leave Request"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" loading={rejectM.isPending} disabled={!rejectReason.trim()} onClick={() => rejectM.mutate({ id: rejectId!, reason: rejectReason })}>
              Reject
            </Button>
          </>
        }
      >
        <Textarea label="Rejection Reason *" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Provide a reason for rejection…" />
      </Modal>
    </div>
  );
}
