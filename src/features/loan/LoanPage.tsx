import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Plus, CheckCircle, XCircle, FileText } from "lucide-react";
import { loanApi } from "@/services/api/loan.api";
import { employeesApi } from "@/services/api/employees.api";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import { usePagination } from "@/hooks/usePagination";
import { Loan, LoanLedger } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

const schema = z.object({
  employeeId: z.coerce.number().positive("Select an employee"),
  principalAmount: z.coerce.number().positive("Principal amount required"),
  interestRate: z.coerce.number().min(0, "Interest rate required"),
  monthlyPrincipalPayment: z.coerce.number().positive("Monthly payment required"),
  remarks: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoanPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [ledgerLoan, setLedgerLoan] = useState<Loan | null>(null);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  // ── Fetch active employees for dropdown ────────────────────────────────
  const { data: empData } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => employeesApi.getAll({ status: "ACTIVE", size: 200 }),
    enabled: showCreate, // only load when modal is open
  });
  const employeeOptions = (empData?.data?.data?.content ?? []).map((e: any) => ({
    value: String(e.id),
    label: `${e.employeeCode} — ${e.name}`,
  }));

  // ── Loans ──────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["loans", page, size, statusFilter],
    queryFn: () => loanApi.getAll({ page, size, status: statusFilter || undefined }),
  });

  const { data: ledgerData } = useQuery({
    queryKey: ["loan-ledger", ledgerLoan?.id],
    queryFn: () => loanApi.getLedger(ledgerLoan!.id),
    enabled: !!ledgerLoan,
  });

  const pageData = data?.data?.data;
  const loans: Loan[] = pageData?.content ?? [];
  const ledger: LoanLedger[] = ledgerData?.data?.data ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────
  const createM = useMutation({
    mutationFn: (d: FormData) => loanApi.create(d),
    onSuccess: () => {
      toast.success("Loan request created");
      qc.invalidateQueries({ queryKey: ["loans"] });
      setShowCreate(false);
      form.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to create loan"),
  });

  const approveM = useMutation({
    mutationFn: (id: number) => loanApi.approve(id),
    onSuccess: () => {
      toast.success("Loan approved and disbursed");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Approval failed"),
  });

  const rejectM = useMutation({
    mutationFn: (id: number) => loanApi.reject(id),
    onSuccess: () => {
      toast.success("Loan rejected");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Rejection failed"),
  });

  const columns: Column<Loan>[] = [
    {
      key: "ref",
      header: "Reference",
      render: (l) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{l.loanReference}</span>,
    },
    {
      key: "emp",
      header: "Employee",
      render: (l) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{l.employeeName}</p>
          <p className="text-xs text-gray-400">{l.employeeCode}</p>
        </div>
      ),
    },
    { key: "amt", header: "Principal", render: (l) => <span className="font-semibold">{formatCurrency(l.principalAmount)}</span> },
    { key: "rate", header: "Rate", render: (l) => `${l.interestRate}% / month` },
    { key: "emi", header: "Monthly EMI", render: (l) => formatCurrency(l.monthlyPrincipalPayment) },
    { key: "bal", header: "Balance", render: (l) => (l.currentBalance != null ? formatCurrency(l.currentBalance) : "—") },
    { key: "stat", header: "Status", render: (l) => <Badge variant={statusBadge(l.status)}>{l.status.replace(/_/g, " ")}</Badge> },
    {
      key: "act",
      header: "Actions",
      render: (l) => (
        <div className="flex gap-1">
          {l.status === "PENDING_APPROVAL" && (
            <>
              <Button size="sm" variant="ghost" icon={<CheckCircle size={13} />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" loading={approveM.isPending} onClick={() => approveM.mutate(l.id)}>
                Approve
              </Button>
              <Button size="sm" variant="ghost" icon={<XCircle size={13} />} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" loading={rejectM.isPending} onClick={() => rejectM.mutate(l.id)}>
                Reject
              </Button>
            </>
          )}
          {(l.status === "ACTIVE" || l.status === "CLOSED") && (
            <Button size="sm" variant="ghost" icon={<FileText size={13} />} onClick={() => setLedgerLoan(l)}>
              Ledger
            </Button>
          )}
        </div>
      ),
    },
  ];

  const ledgerCols: Column<LoanLedger>[] = [
    { key: "date", header: "Date", render: (l) => formatDate(l.transactionDate) },
    { key: "type", header: "Type", render: (l) => <Badge variant="info">{l.transactionType.replace(/_/g, " ")}</Badge> },
    { key: "amt", header: "Amount", render: (l) => <span className={l.amount < 0 ? "text-red-600" : "text-emerald-600"}>{formatCurrency(Math.abs(l.amount))}</span> },
    { key: "bal", header: "Balance", render: (l) => <span className="font-semibold">{formatCurrency(l.balanceAfter)}</span> },
    { key: "rem", header: "Remarks", render: (l) => <span className="text-xs text-gray-400">{l.remarks ?? "—"}</span> },
    { key: "by", header: "Posted By", accessor: "createdBy" },
  ];

  return (
    <div>
      <PageHeader
        title="Employee Loans"
        subtitle="Loan approvals and repayment tracking"
        icon={<CreditCard size={20} />}
        actions={
          <Button
            icon={<Plus size={15} />}
            onClick={() => {
              setShowCreate(true);
              form.reset();
            }}
          >
            New Loan
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "PENDING_APPROVAL", "ACTIVE", "CLOSED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              goToPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={loans} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={(l) => l.id} emptyMessage="No loans found" />

      {/* ── Create Loan Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          form.reset();
        }}
        title="Create Loan Request"
        size="md"
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
              Create Loan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Employee dropdown */}
          <Select label="Employee *" options={employeeOptions} placeholder={empData ? "Select employee" : "Loading employees…"} error={form.formState.errors.employeeId?.message} {...form.register("employeeId")} />

          <Input label="Principal Amount (₹) *" type="number" placeholder="e.g. 50000" error={form.formState.errors.principalAmount?.message} {...form.register("principalAmount")} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Interest Rate (% / month) *" type="number" step="0.01" placeholder="e.g. 1.5" error={form.formState.errors.interestRate?.message} hint="Simple interest per month" {...form.register("interestRate")} />
            <Input label="Monthly Principal Payment (₹) *" type="number" placeholder="e.g. 5000" error={form.formState.errors.monthlyPrincipalPayment?.message} hint="Deducted from salary each month" {...form.register("monthlyPrincipalPayment")} />
          </div>

          <Textarea label="Remarks" placeholder="Reason for loan (optional)" {...form.register("remarks")} />

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Only one active loan is allowed per employee. This loan will be created in <strong>PENDING_APPROVAL</strong> status. Once approved, the principal will be disbursed and interest will be calculated using simple interest.
          </div>
        </div>
      </Modal>

      {/* ── Loan Ledger Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!ledgerLoan}
        onClose={() => setLedgerLoan(null)}
        title={`Loan Ledger — ${ledgerLoan?.loanReference} (${ledgerLoan?.employeeName})`}
        size="2xl"
        footer={
          <Button variant="outline" onClick={() => setLedgerLoan(null)}>
            Close
          </Button>
        }
      >
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
            <p className="text-gray-400 text-xs mb-0.5">Principal</p>
            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(ledgerLoan?.principalAmount ?? 0)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
            <p className="text-gray-400 text-xs mb-0.5">Interest Rate</p>
            <p className="font-bold text-gray-900 dark:text-white">{ledgerLoan?.interestRate}% / month</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
            <p className="text-gray-400 text-xs mb-0.5">Current Balance</p>
            <p className="font-bold text-amber-500">{formatCurrency(ledgerLoan?.currentBalance ?? 0)}</p>
          </div>
        </div>
        <DataTable columns={ledgerCols} data={ledger} rowKey={(l) => l.id} emptyMessage="No ledger entries found" />
      </Modal>
    </div>
  );
}
