import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Play, RefreshCw, Eye, Lock, CheckCircle2, CreditCard, Banknote, AlertTriangle, FileText, Users, TrendingDown, IndianRupee, Printer, ChevronDown } from "lucide-react";
import { payrollApi, DisburseRequest } from "@/services/api/payroll.api";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { KPICard } from "@/components/common/KPICard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { PayrollRun, PayrollDetail } from "@/types";
import { formatCurrency, formatDate, formatDateTime, MONTHS, currentYear, currentMonth } from "@/utils/format";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

// ── Payslip PDF Generator (pure browser, no library needed) ──────────────────
function generatePayslipHTML(detail: PayrollDetail, run: PayrollRun, companyName = "KalingaLumière Agarbatti"): string {
  const month = MONTHS[run.month - 1];
  const year = run.year;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Payslip - ${detail.employeeName} - ${month} ${year}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; padding: 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #444ce7; padding-bottom: 14px; margin-bottom: 18px; }
  .company-name { font-size: 20px; font-weight: 800; color: #444ce7; }
  .company-sub  { font-size: 11px; color: #666; margin-top: 3px; }
  .slip-title   { text-align: right; }
  .slip-title h2 { font-size: 16px; font-weight: 700; color: #1a1a1a; }
  .slip-title p  { font-size: 11px; color: #666; margin-top: 2px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8f9ff; border: 1px solid #e0e4ff; border-radius: 8px; padding: 14px; margin-bottom: 18px; }
  .info-item label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
  .info-item span  { font-size: 13px; font-weight: 600; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  th { background: #444ce7; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.4px; }
  td { padding: 7px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  tr:nth-child(even) td { background: #fafafa; }
  .amount-row td { font-weight: 600; }
  .total-row { background: #f0f2ff !important; }
  .total-row td { font-weight: 700; font-size: 13px; color: #444ce7; border-top: 2px solid #444ce7; }
  .net-box { background: #444ce7; color: #fff; border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .net-box .label { font-size: 13px; opacity: 0.85; }
  .net-box .value { font-size: 22px; font-weight: 800; }
  .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 12px; }
  .sig-box { border-top: 1px solid #ccc; padding-top: 8px; text-align: center; font-size: 11px; color: #888; margin-top: 40px; }
  .status-pill { display: inline-block; background: ${detail.paymentStatus === "PAID" ? "#d1fae5" : "#fef3c7"}; color: ${detail.paymentStatus === "PAID" ? "#065f46" : "#92400e"}; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 700; }
  .capped-warn { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 8px 12px; font-size: 11px; color: #c2410c; margin-bottom: 14px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${companyName}</div>
    <div class="company-sub">Agarbatti Manufacturing</div>
  </div>
  <div class="slip-title">
    <h2>SALARY PAYSLIP</h2>
    <p>${month} ${year} &nbsp;|&nbsp; ${run.runReference}</p>
    <p style="margin-top:6px"><span class="status-pill">${detail.paymentStatus}</span></p>
  </div>
</div>

<div class="info-grid">
  <div class="info-item"><label>Employee Name</label><span>${detail.employeeName}</span></div>
  <div class="info-item"><label>Employee Code</label><span>${detail.employeeCode}</span></div>
  <div class="info-item"><label>Pay Period</label><span>${month} ${year} (${formatDate(run.periodStart)} – ${formatDate(run.periodEnd)})</span></div>
  <div class="info-item"><label>Working Days</label><span>${detail.standardWorkDays} days / ${detail.standardWorkHours} hrs per day</span></div>
  ${detail.paidDate ? `<div class="info-item"><label>Payment Date</label><span>${formatDate(detail.paidDate)}</span></div>` : ""}
  ${detail.paymentMode ? `<div class="info-item"><label>Payment Mode</label><span>${detail.paymentMode}</span></div>` : ""}
</div>

${detail.salaryCapped ? `<div class="capped-warn">⚠️ Salary was capped at ₹0 — deductions exceeded gross salary. Outstanding loan balance will carry forward.</div>` : ""}

<table>
  <thead><tr><th>Earnings</th><th style="text-align:right">Amount (₹)</th></tr></thead>
  <tbody>
    <tr><td>Base Salary</td><td style="text-align:right">${formatCurrency(detail.baseSalary)}</td></tr>
    <tr class="amount-row"><td>Attendance Pay (${Math.floor(detail.workedMinutes / 60)}h ${detail.workedMinutes % 60}m worked)</td><td style="text-align:right">${formatCurrency(detail.grossSalary - (detail.overtimeMinutes > 0 ? Number(((detail.hourlyRate * detail.overtimeMultiplier * detail.overtimeMinutes) / 60).toFixed(2)) : 0) - (detail.paidLeaveDays > 0 ? Number((detail.hourlyRate * detail.standardWorkHours * detail.paidLeaveDays).toFixed(2)) : 0))}</td></tr>
    ${detail.paidLeaveDays > 0 ? `<tr><td>Paid Leave Pay (${detail.paidLeaveDays} day${detail.paidLeaveDays > 1 ? "s" : ""})</td><td style="text-align:right">${formatCurrency(detail.hourlyRate * detail.standardWorkHours * detail.paidLeaveDays)}</td></tr>` : ""}
    ${detail.overtimeMinutes > 0 ? `<tr><td>Overtime Pay (${Math.floor(detail.overtimeMinutes / 60)}h ${detail.overtimeMinutes % 60}m × ${detail.overtimeMultiplier}x)</td><td style="text-align:right">${formatCurrency((detail.hourlyRate * detail.overtimeMultiplier * detail.overtimeMinutes) / 60)}</td></tr>` : ""}
    <tr class="total-row"><td>Gross Salary</td><td style="text-align:right">${formatCurrency(detail.grossSalary)}</td></tr>
  </tbody>
</table>

<table>
  <thead><tr><th>Deductions</th><th style="text-align:right">Amount (₹)</th></tr></thead>
  <tbody>
    ${detail.loanPrincipalDeduction > 0 ? `<tr><td>Loan Principal Deduction</td><td style="text-align:right">- ${formatCurrency(detail.loanPrincipalDeduction)}</td></tr>` : ""}
    ${detail.loanInterestDeduction > 0 ? `<tr><td>Loan Interest Deduction</td><td style="text-align:right">- ${formatCurrency(detail.loanInterestDeduction)}</td></tr>` : ""}
    ${detail.totalDeductions === 0 ? `<tr><td style="color:#888">No deductions</td><td style="text-align:right">—</td></tr>` : ""}
    <tr class="total-row"><td>Total Deductions</td><td style="text-align:right">- ${formatCurrency(detail.totalDeductions)}</td></tr>
  </tbody>
</table>

<div class="net-box">
  <span class="label">NET SALARY PAYABLE</span>
  <span class="value">${formatCurrency(detail.netSalary)}</span>
</div>

<div class="footer-grid">
  <div><div class="sig-box">Employee Signature</div></div>
  <div><div class="sig-box">Authorized Signatory</div></div>
</div>

<p style="text-align:center;font-size:10px;color:#aaa;margin-top:20px">
  Generated on ${new Date().toLocaleString("en-IN")} · ${companyName} · Confidential
</p>
</body></html>`;
}

function printPayslip(detail: PayrollDetail, run: PayrollRun) {
  const html = generatePayslipHTML(detail, run);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1500);
  }, 500);
}

// ── Disburse Modal ────────────────────────────────────────────────────────────
interface DisburseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (req: DisburseRequest) => void;
  loading: boolean;
  title: string;
  totalAmount?: number;
  employeeCount?: number;
}

function DisburseModal({ isOpen, onClose, onConfirm, loading, title, totalAmount, employeeCount }: DisburseModalProps) {
  const [mode, setMode] = useState<"CASH" | "BANK">("CASH");
  const [remarks, setRemarks] = useState("");

  const handleConfirm = () => {
    onConfirm({ paymentMode: mode, remarks });
    setMode("CASH");
    setRemarks("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} icon={<CheckCircle2 size={14} />} onClick={handleConfirm}>
            Confirm Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {totalAmount !== undefined && (
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800">
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">{employeeCount ? `${employeeCount} employees` : "Net Salary"}</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{formatCurrency(totalAmount)}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Mode *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("CASH")}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                mode === "CASH" ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              <Banknote size={18} /> Cash
            </button>
            <button
              onClick={() => setMode("BANK")}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                mode === "BANK" ? "border-brand-600 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              <CreditCard size={18} /> Bank Transfer
            </button>
          </div>
        </div>

        <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional payment remarks" />

        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex gap-2 items-start">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This action will mark the salary as <strong>PAID</strong> and automatically post a cashbook debit entry. This cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Main PayrollPage ──────────────────────────────────────────────────────────
export default function PayrollPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [genYear, setGenYear] = useState(currentYear());
  const [genMonth, setGenMonth] = useState(currentMonth() - 1 || 12);
  const [genRemarks, setGenRemarks] = useState("");

  // Disbursement state
  const [disburseOne, setDisburseOne] = useState<PayrollDetail | null>(null);
  const [disburseAll, setDisburseAll] = useState(false);
  const [lockConfirm, setLockConfirm] = useState(false);
  const [payslipView, setPayslipView] = useState<PayrollDetail | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ["payroll-runs"],
    queryFn: () => payrollApi.getAll(),
  });

  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ["payroll-details", selectedRun?.id],
    queryFn: () => payrollApi.getDetails(selectedRun!.id),
    enabled: !!selectedRun,
  });

  const runs: PayrollRun[] = runsData?.data?.data ?? [];
  const details: PayrollDetail[] = detailsData?.data?.data ?? [];
  const pendingCount = details.filter((d) => d.paymentStatus === "PENDING").length;
  const paidCount = details.filter((d) => d.paymentStatus === "PAID").length;
  const totalPending = details.filter((d) => d.paymentStatus === "PENDING").reduce((s, d) => s + d.netSalary, 0);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const generateM = useMutation({
    mutationFn: () => payrollApi.generate({ year: genYear, month: genMonth, remarks: genRemarks }),
    onSuccess: (res) => {
      toast.success(`Payroll ${res.data.data.runReference} generated`);
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      setShowGenerate(false);
      setGenRemarks("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Generation failed"),
  });

  const regenerateM = useMutation({
    mutationFn: (runId: number) => payrollApi.regenerate(runId),
    onSuccess: () => {
      toast.success("Payroll regenerated");
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      qc.invalidateQueries({ queryKey: ["payroll-details", selectedRun?.id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Regeneration failed"),
  });

  const disburseOneM = useMutation({
    mutationFn: ({ id, req }: { id: number; req: DisburseRequest }) => payrollApi.disburseOne(id, req),
    onSuccess: () => {
      toast.success("Salary disbursed and cashbook updated");
      qc.invalidateQueries({ queryKey: ["payroll-details", selectedRun?.id] });
      setDisburseOne(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Disbursement failed"),
  });

  const disburseAllM = useMutation({
    mutationFn: ({ runId, req }: { runId: number; req: DisburseRequest }) => payrollApi.disburseAll(runId, req),
    onSuccess: () => {
      toast.success(`All ${pendingCount} salaries disbursed`);
      qc.invalidateQueries({ queryKey: ["payroll-details", selectedRun?.id] });
      setDisburseAll(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Disbursement failed"),
  });

  const lockM = useMutation({
    mutationFn: (runId: number) => payrollApi.lockRun(runId),
    onSuccess: () => {
      toast.success("Payroll run locked");
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      qc.invalidateQueries({ queryKey: ["payroll-details", selectedRun?.id] });
      setLockConfirm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Lock failed"),
  });

  // ── Run list columns ───────────────────────────────────────────────────────
  const runColumns: Column<PayrollRun>[] = [
    {
      key: "ref",
      header: "Reference",
      render: (r) => (
        <button onClick={() => setSelectedRun(r)} className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
          {r.runReference}
        </button>
      ),
    },
    { key: "period", header: "Period", render: (r) => `${MONTHS[r.month - 1]} ${r.year}` },
    { key: "emps", header: "Employees", render: (r) => r.totalEmployees ?? "—", className: "text-center" },
    { key: "gross", header: "Total Gross", render: (r) => (r.totalGross ? formatCurrency(r.totalGross) : "—") },
    { key: "net", header: "Total Net", render: (r) => (r.totalNet ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.totalNet)}</span> : "—") },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={r.status === "LOCKED" ? "neutral" : r.status === "GENERATED" ? "info" : "warning"}>{r.status}</Badge>,
    },
    {
      key: "genBy",
      header: "Generated By",
      render: (r) => (
        <div>
          <p>{r.generatedBy}</p>
          <p className="text-xs text-gray-400">{formatDate(r.generatedDate)}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" icon={<Eye size={13} />} onClick={() => setSelectedRun(r)}>
            Details
          </Button>
          {r.status !== "LOCKED" && (
            <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={regenerateM.isPending} onClick={() => regenerateM.mutate(r.id)}>
              Regen
            </Button>
          )}
        </div>
      ),
    },
  ];

  // ── Detail (payslip) columns ───────────────────────────────────────────────
  const detailColumns: Column<PayrollDetail>[] = [
    {
      key: "emp",
      header: "Employee",
      render: (d) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{d.employeeName}</p>
          <p className="text-xs font-mono text-gray-400">{d.employeeCode}</p>
        </div>
      ),
    },
    { key: "base", header: "Base", render: (d) => formatCurrency(d.baseSalary) },
    { key: "gross", header: "Gross", render: (d) => formatCurrency(d.grossSalary) },
    {
      key: "ded",
      header: "Deductions",
      render: (d) => (d.totalDeductions > 0 ? <span className="text-red-500 font-medium">-{formatCurrency(d.totalDeductions)}</span> : <span className="text-gray-400">—</span>),
    },
    {
      key: "net",
      header: "Net Salary",
      render: (d) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.netSalary)}</span>,
    },
    {
      key: "capped",
      header: "Capped",
      render: (d) => (d.salaryCapped ? <Badge variant="warning">Yes</Badge> : <Badge variant="neutral">No</Badge>),
    },
    {
      key: "status",
      header: "Payment",
      render: (d) => (
        <div>
          <Badge variant={d.paymentStatus === "PAID" ? "success" : "warning"}>{d.paymentStatus}</Badge>
          {d.paidDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(d.paidDate)} · {d.paymentMode}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (d) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon={<Printer size={13} />}
            onClick={() => {
              setPayslipView(d);
            }}
          >
            Payslip
          </Button>
          {d.paymentStatus === "PENDING" && selectedRun?.status !== "LOCKED" && (
            <Button size="sm" variant="ghost" icon={<IndianRupee size={13} />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => setDisburseOne(d)}>
              Pay
            </Button>
          )}
        </div>
      ),
    },
  ];

  const yOpts = [currentYear() - 1, currentYear()].map((y) => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="Generate, disburse and lock monthly payroll"
        icon={<DollarSign size={20} />}
        actions={
          <Button icon={<Play size={15} />} onClick={() => setShowGenerate(true)}>
            Generate Payroll
          </Button>
        }
      />

      {/* Run list */}
      {!selectedRun && (
        <>
          {runs.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <KPICard title="Latest Employees" value={runs[0]?.totalEmployees ?? 0} icon={<Users size={18} />} color="blue" index={0} />
              <KPICard title="Latest Gross" value={formatCurrency(runs[0]?.totalGross ?? 0)} icon={<TrendingDown size={18} />} color="orange" index={1} />
              <KPICard title="Latest Net Payout" value={formatCurrency(runs[0]?.totalNet ?? 0)} icon={<DollarSign size={18} />} color="green" index={2} />
            </div>
          )}
          <DataTable columns={runColumns} data={runs} loading={runsLoading} rowKey={(r) => r.id} emptyMessage="No payroll runs yet. Click Generate Payroll to start." />
        </>
      )}

      {/* Detail view */}
      <AnimatePresence>
        {selectedRun && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Back + header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedRun(null)}>
                  ← All Runs
                </Button>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedRun.runReference} — {MONTHS[selectedRun.month - 1]} {selectedRun.year}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {formatDate(selectedRun.periodStart)} to {formatDate(selectedRun.periodEnd)}
                    &nbsp;·&nbsp;
                    <Badge variant={selectedRun.status === "LOCKED" ? "neutral" : "info"} className="ml-1">
                      {selectedRun.status}
                    </Badge>
                  </p>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex gap-2">
                {selectedRun.status !== "LOCKED" && pendingCount > 0 && (
                  <Button variant="primary" icon={<IndianRupee size={15} />} onClick={() => setDisburseAll(true)}>
                    Pay All ({pendingCount})
                  </Button>
                )}
                {selectedRun.status !== "LOCKED" && pendingCount === 0 && paidCount > 0 && (
                  <Button variant="secondary" icon={<Lock size={15} />} onClick={() => setLockConfirm(true)}>
                    Lock Run
                  </Button>
                )}
              </div>
            </div>

            {/* Payment stats */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              <KPICard title="Total Employees" value={details.length} icon={<Users size={18} />} color="blue" index={0} />
              <KPICard title="Paid" value={paidCount} icon={<CheckCircle2 size={18} />} color="green" index={1} />
              <KPICard title="Pending" value={pendingCount} icon={<AlertTriangle size={18} />} color="orange" index={2} />
              <KPICard title="Pending Amount" value={formatCurrency(totalPending)} icon={<IndianRupee size={18} />} color="red" index={3} />
            </div>

            {/* Progress bar */}
            {details.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Payment Progress</span>
                  <span>
                    {paidCount} / {details.length} paid
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${details.length > 0 ? (paidCount / details.length) * 100 : 0}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            )}

            <DataTable columns={detailColumns} data={details} loading={detailsLoading} rowKey={(d) => d.id} emptyMessage="No payslips found for this run" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generate Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        title="Generate Payroll"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>
              Cancel
            </Button>
            <Button loading={generateM.isPending} icon={<Play size={14} />} onClick={() => generateM.mutate()}>
              Generate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Payroll should be generated after the month ends. Existing payroll for this period will be deleted and recalculated.</div>
          <Select label="Year *" value={String(genYear)} onChange={(e) => setGenYear(Number(e.target.value))} options={yOpts} />
          <Select label="Month *" value={String(genMonth)} onChange={(e) => setGenMonth(Number(e.target.value))} options={mOpts} />
          <Input label="Remarks" value={genRemarks} onChange={(e) => setGenRemarks(e.target.value)} placeholder="Optional" />
        </div>
      </Modal>

      {/* ── Disburse Single ─────────────────────────────────────────────────── */}
      <DisburseModal isOpen={!!disburseOne} onClose={() => setDisburseOne(null)} onConfirm={(req) => disburseOneM.mutate({ id: disburseOne!.id, req })} loading={disburseOneM.isPending} title={`Pay Salary — ${disburseOne?.employeeName}`} totalAmount={disburseOne?.netSalary} />

      {/* ── Disburse All ────────────────────────────────────────────────────── */}
      <DisburseModal
        isOpen={disburseAll}
        onClose={() => setDisburseAll(false)}
        onConfirm={(req) => disburseAllM.mutate({ runId: selectedRun!.id, req })}
        loading={disburseAllM.isPending}
        title={`Pay All Salaries — ${MONTHS[selectedRun ? selectedRun.month - 1 : 0]} ${selectedRun?.year}`}
        totalAmount={totalPending}
        employeeCount={pendingCount}
      />

      {/* ── Lock Confirm ─────────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={lockConfirm}
        onClose={() => setLockConfirm(false)}
        onConfirm={() => lockM.mutate(selectedRun!.id)}
        title="Lock Payroll Run?"
        message="This will permanently lock the payroll run. No further changes, disbursements or regeneration will be possible."
        confirmLabel="Lock Run"
        loading={lockM.isPending}
      />

      {/* ── Payslip Preview + Print Modal ──────────────────────────────────── */}
      <Modal
        isOpen={!!payslipView}
        onClose={() => setPayslipView(null)}
        title={`Payslip — ${payslipView?.employeeName}`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setPayslipView(null)}>
              Close
            </Button>
            <Button icon={<Printer size={14} />} onClick={() => payslipView && selectedRun && printPayslip(payslipView, selectedRun)}>
              Print / Download
            </Button>
          </>
        }
      >
        {payslipView && selectedRun && (
          <div className="space-y-4 text-sm">
            {/* Header */}
            <div className="flex justify-between items-start p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800">
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{payslipView.employeeName}</p>
                <p className="text-xs text-gray-500 font-mono">{payslipView.employeeCode}</p>
              </div>
              <div className="text-right">
                <Badge variant={payslipView.paymentStatus === "PAID" ? "success" : "warning"}>{payslipView.paymentStatus}</Badge>
                <p className="text-xs text-gray-400 mt-1">
                  {MONTHS[selectedRun.month - 1]} {selectedRun.year}
                </p>
              </div>
            </div>

            {payslipView.salaryCapped && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex gap-2 items-start">
                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Salary was capped — deductions exceeded gross. Balance carries forward.</p>
              </div>
            )}

            {/* Earnings breakdown */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Earnings</div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-600 dark:text-gray-400">Base Salary</span>
                  <span className="font-medium">{formatCurrency(payslipView.baseSalary)}</span>
                </div>
                {payslipView.paidLeaveDays > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Paid Leave ({payslipView.paidLeaveDays} day{payslipView.paidLeaveDays > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-blue-600">included</span>
                  </div>
                )}
                {payslipView.overtimeMinutes > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Overtime ({Math.floor(payslipView.overtimeMinutes / 60)}h {payslipView.overtimeMinutes % 60}m × {payslipView.overtimeMultiplier}x)
                    </span>
                    <span className="font-medium text-brand-600">included</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60">
                  <span className="font-semibold">Gross Salary</span>
                  <span className="font-bold">{formatCurrency(payslipView.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            {payslipView.totalDeductions > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deductions</div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {payslipView.loanPrincipalDeduction > 0 && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-600 dark:text-gray-400">Loan Principal</span>
                      <span className="text-red-500">-{formatCurrency(payslipView.loanPrincipalDeduction)}</span>
                    </div>
                  )}
                  {payslipView.loanInterestDeduction > 0 && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-600 dark:text-gray-400">Loan Interest</span>
                      <span className="text-red-500">-{formatCurrency(payslipView.loanInterestDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60">
                    <span className="font-semibold">Total Deductions</span>
                    <span className="font-bold text-red-500">-{formatCurrency(payslipView.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Net salary */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-base text-emerald-800 dark:text-emerald-200">NET SALARY PAYABLE</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(payslipView.netSalary)}</span>
            </div>

            {/* Payment info */}
            {payslipView.paymentStatus === "PAID" && (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 mb-0.5">Paid On</p>
                  <p className="font-semibold">{payslipView.paidDate ? formatDate(payslipView.paidDate) : "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 mb-0.5">Mode</p>
                  <p className="font-semibold">{payslipView.paymentMode ?? "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-400 mb-0.5">Paid By</p>
                  <p className="font-semibold">{payslipView.paidBy ?? "—"}</p>
                </div>
              </div>
            )}

            {/* Worked hours */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 grid grid-cols-4 gap-2">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.floor(payslipView.workedMinutes / 60)}h {payslipView.workedMinutes % 60}m
                </p>
                <p>Hours Worked</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.paidLeaveDays}d</p>
                <p>Paid Leave</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {Math.floor(payslipView.overtimeMinutes / 60)}h {payslipView.overtimeMinutes % 60}m
                </p>
                <p>Overtime</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(payslipView.hourlyRate)}</p>
                <p>Hourly Rate</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
