import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, RefreshCw, Eye, Lock, Unlock, CheckCircle2, ShieldCheck, CreditCard, Banknote, AlertTriangle, Users, TrendingDown, IndianRupee, Printer, History, ListChecks, Search, FileText, ChevronRight } from "lucide-react";
import { payrollApi, DisburseRequest, ReopenPayrollRequest, ActionRemarksRequest } from "@/services/api/payroll.api";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { KPICard } from "@/components/common/KPICard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { PayrollRun, PayrollDetail, PayrollCalculationLog, PayrollStatus } from "@/types";
import { formatCurrency, formatDate, formatDateTime, MONTHS, currentYear, currentMonth } from "@/utils/format";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

// ── Status → badge variant (payroll lifecycle) ────────────────────────────────
function payrollStatusVariant(status: PayrollStatus) {
  switch (status) {
    case "DRAFT":
      return "neutral" as const;
    case "CALCULATED":
      return "info" as const;
    case "VERIFIED":
      return "purple" as const;
    case "APPROVED":
      return "warning" as const;
    case "PROCESSED":
      return "warning" as const;
    case "PAID":
      return "success" as const;
    case "LOCKED":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

// ── Payslip PDF Generator (pure browser, no library needed) ──────────────────
function generatePayslipHTML(detail: PayrollDetail, run: PayrollRun, companyName = "KalingaLumière Agarbatti"): string {
  const month = MONTHS[run.month - 1];
  const year = run.year;
  const earningsRows = [
    `<tr><td>Base Salary</td><td style="text-align:right">${formatCurrency(detail.baseSalary)}</td></tr>`,
    detail.overtimePay > 0 ? `<tr><td>Overtime (${(detail.overtimeMinutes / 60).toFixed(1)}h × ${detail.overtimeMultiplier}x)</td><td style="text-align:right">${formatCurrency(detail.overtimePay)}</td></tr>` : "",
    detail.weeklyOffPay > 0 ? `<tr><td>Weekly Off Pay (${detail.weeklyOffWorkedDays} day${detail.weeklyOffWorkedDays > 1 ? "s" : ""} worked × ${detail.weeklyOffMultiplier}x)</td><td style="text-align:right">${formatCurrency(detail.weeklyOffPay)}</td></tr>` : "",
    detail.holidayOtPay > 0 ? `<tr><td>Holiday OT (${detail.holidayWorkedDays} day${detail.holidayWorkedDays > 1 ? "s" : ""} worked × ${detail.holidayOtMultiplier}x)</td><td style="text-align:right">${formatCurrency(detail.holidayOtPay)}</td></tr>` : "",
    detail.leaveEncashmentAmount > 0 ? `<tr><td>Leave Encashment (${detail.leaveEncashmentDays} day${detail.leaveEncashmentDays > 1 ? "s" : ""})</td><td style="text-align:right">${formatCurrency(detail.leaveEncashmentAmount)}</td></tr>` : "",
    `<tr class="total-row"><td>Gross Salary</td><td style="text-align:right">${formatCurrency(detail.grossSalary)}</td></tr>`,
  ].join("");

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
  .total-row td { font-weight: 700; font-size: 13px; color: #444ce7; border-top: 2px solid #444ce7; background: #f0f2ff !important; }
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
    <p>${month} ${year} &nbsp;|&nbsp; ${run.runReference} (v${detail.calculationVersion})</p>
    <p style="margin-top:6px"><span class="status-pill">${detail.paymentStatus}</span></p>
  </div>
</div>

<div class="info-grid">
  <div class="info-item"><label>Employee Name</label><span>${detail.employeeName}</span></div>
  <div class="info-item"><label>Employee Code</label><span>${detail.employeeCode}</span></div>
  <div class="info-item"><label>Pay Period</label><span>${month} ${year} (${formatDate(run.periodStart)} – ${formatDate(run.periodEnd)})</span></div>
  <div class="info-item"><label>Working Days</label><span>${detail.standardWorkDays} days / ${detail.standardWorkHours} hrs per day</span></div>
  <div class="info-item"><label>Present / Weekly-Off / Holiday</label><span>${detail.presentDays}d / ${detail.weeklyOffDays}d / ${detail.holidayDays}d</span></div>
  <div class="info-item"><label>Paid Leave / Absent</label><span>${detail.paidLeaveDays}d / ${detail.absentDays}d</span></div>
  ${detail.paidDate ? `<div class="info-item"><label>Payment Date</label><span>${formatDate(detail.paidDate)}</span></div>` : ""}
  ${detail.paymentMode ? `<div class="info-item"><label>Payment Mode</label><span>${detail.paymentMode}</span></div>` : ""}
</div>

${detail.salaryCapped ? `<div class="capped-warn">⚠️ Salary was capped at ₹0 — deductions exceeded net salary. Outstanding loan balance will carry forward.</div>` : ""}

<table>
  <thead><tr><th>Earnings</th><th style="text-align:right">Amount (₹)</th></tr></thead>
  <tbody>${earningsRows}</tbody>
</table>

<table>
  <thead><tr><th>Deductions</th><th style="text-align:right">Amount (₹)</th></tr></thead>
  <tbody>
    ${detail.lossOfPayAmount > 0 ? `<tr><td>Loss of Pay (${detail.absentDays} day${detail.absentDays > 1 ? "s" : ""})</td><td style="text-align:right">- ${formatCurrency(detail.lossOfPayAmount)}</td></tr>` : ""}
    ${detail.loanPrincipalDeduction > 0 ? `<tr><td>Loan Principal Deduction</td><td style="text-align:right">- ${formatCurrency(detail.loanPrincipalDeduction)}</td></tr>` : ""}
    ${detail.loanInterestDeduction > 0 ? `<tr><td>Loan Interest Deduction</td><td style="text-align:right">- ${formatCurrency(detail.loanInterestDeduction)}</td></tr>` : ""}
    ${detail.totalDeductions === 0 && detail.lossOfPayAmount === 0 ? `<tr><td style="color:#888">No deductions</td><td style="text-align:right">—</td></tr>` : ""}
    <tr class="total-row"><td>Total Deductions</td><td style="text-align:right">- ${formatCurrency(detail.totalDeductions + detail.lossOfPayAmount)}</td></tr>
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
            This action will mark the salary as <strong>PAID</strong> and automatically post a cashbook debit entry.
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Reopen Modal (reason required) ────────────────────────────────────────────
function ReopenModal({ isOpen, onClose, onConfirm, loading }: { isOpen: boolean; onClose: () => void; onConfirm: (req: ReopenPayrollRequest) => void; loading: boolean }) {
  const [reason, setReason] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Payroll Run"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} disabled={!reason.trim()} icon={<Unlock size={14} />} onClick={() => onConfirm({ reason })}>
            Reopen
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex gap-2 items-start">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Reopening unlocks attendance for this period and creates a <strong>new calculation version</strong>. The current version is preserved for audit.
          </p>
        </div>
        <Textarea label="Reason for reopening *" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Attendance correction needed for 3 employees" rows={3} />
      </div>
    </Modal>
  );
}

// ── Calculation Breakdown Modal ────────────────────────────────────────────────
function BreakdownModal({ isOpen, onClose, log, loading }: { isOpen: boolean; onClose: () => void; log: PayrollCalculationLog | null; loading: boolean }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={log ? `Calculation Breakdown — ${log.employeeName}` : "Calculation Breakdown"}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
      ) : !log ? (
        <div className="py-8 text-center text-sm text-gray-400">No calculation log found.</div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Version {log.calculationVersion} · Calculated by {log.calculatedBy} on {formatDateTime(log.calculatedDate)}
          </p>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
            {log.breakdown.map((line, i) => (
              <div key={i} className={cn("px-4 py-2.5 text-sm font-mono", i === log.breakdown.length - 1 ? "bg-emerald-50 dark:bg-emerald-950/30 font-bold text-emerald-700 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300")}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Version History Modal ──────────────────────────────────────────────────────
function VersionHistoryModal({ isOpen, onClose, versions, loading, currentRunId, onSelect }: { isOpen: boolean; onClose: () => void; versions: PayrollRun[]; loading: boolean; currentRunId?: number; onSelect: (r: PayrollRun) => void }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payroll Version History"
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
      ) : versions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">No history found.</div>
      ) : (
        <div className="space-y-2">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                onSelect(v);
                onClose();
              }}
              className={cn("w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors", v.id === currentRunId ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60")}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-gray-500">v{v.calculationVersion}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{v.runReference}</p>
                  <p className="text-xs text-gray-400">
                    {v.generatedBy} · {formatDateTime(v.generatedDate)}
                    {v.reopenReason && <> · Reopened: {v.reopenReason}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.isCurrentVersion && <Badge variant="success">Current</Badge>}
                <Badge variant={payrollStatusVariant(v.status)}>{v.status}</Badge>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── Exception Report Modal (pre-approval scan) ─────────────────────────────────
function ExceptionReportModal({
  isOpen,
  onClose,
  year,
  month,
  setYear,
  setMonth,
  exceptions,
  loading,
  onScan,
}: {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
  exceptions: import("@/types").PayrollException[];
  loading: boolean;
  onScan: () => void;
}) {
  const yOpts = [currentYear() - 1, currentYear()].map((y) => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payroll Exception Report"
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="w-32">
            <Select label="Year" value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={yOpts} />
          </div>
          <div className="flex-1">
            <Select label="Month" value={String(month)} onChange={(e) => setMonth(Number(e.target.value))} options={mOpts} />
          </div>
          <Button icon={<Search size={14} />} loading={loading} onClick={onScan}>
            Scan
          </Button>
        </div>

        {exceptions.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="mx-auto mb-2 text-emerald-600" size={24} />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">No exceptions found for this period — clear to approve.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {exceptions.map((ex) => (
              <div key={ex.employeeId} className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ex.employeeName}</p>
                    <p className="text-xs font-mono text-gray-400">{ex.employeeCode}</p>
                  </div>
                  <span className="text-xs text-gray-400">{ex.affectedDates.length} date(s)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.issues.map((issue) => (
                    <Badge key={issue} variant="warning">
                      {issue.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Metrics + Generation-exception banner (shown right after generate/recalculate/reopen) ──
function RunActionSummary({ run }: { run: PayrollRun }) {
  if (!run.metrics && (!run.generationExceptions || run.generationExceptions.length === 0)) return null;
  return (
    <div className="mb-5 space-y-3">
      {run.metrics && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">Last Computation Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Processed</p>
              <p className="font-bold">{run.metrics.employeesProcessed}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Skipped</p>
              <p className={cn("font-bold", run.metrics.employeesSkipped > 0 ? "text-amber-600" : "")}>{run.metrics.employeesSkipped}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Duration</p>
              <p className="font-bold">{run.metrics.executionDurationMillis}ms</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Payroll</p>
              <p className="font-bold">{formatCurrency(run.metrics.totalPayroll)}</p>
            </div>
          </div>
        </div>
      )}
      {run.generationExceptions && run.generationExceptions.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle size={13} /> {run.generationExceptions.length} employee(s) skipped
          </p>
          <div className="space-y-1.5">
            {run.generationExceptions.map((ge) => (
              <div key={ge.employeeId} className="text-xs text-red-700 dark:text-red-300 flex gap-2">
                <span className="font-semibold">{ge.employeeName}</span>
                <Badge variant="danger">{ge.reason}</Badge>
                <span className="text-red-500">{ge.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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

  const [disburseOneTarget, setDisburseOneTarget] = useState<PayrollDetail | null>(null);
  const [disburseAllOpen, setDisburseAllOpen] = useState(false);
  const [lockConfirm, setLockConfirm] = useState(false);
  const [verifyConfirm, setVerifyConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [payslipView, setPayslipView] = useState<PayrollDetail | null>(null);
  const [breakdownEmployeeId, setBreakdownEmployeeId] = useState<number | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);

  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [excYear, setExcYear] = useState(currentYear());
  const [excMonth, setExcMonth] = useState(currentMonth() - 1 || 12);
  const [exceptions, setExceptions] = useState<import("@/types").PayrollException[]>([]);

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

  const { data: dashboardData } = useQuery({
    queryKey: ["payroll-dashboard", selectedRun?.id],
    queryFn: () => payrollApi.getDashboard(selectedRun!.id),
    enabled: !!selectedRun,
  });

  const { data: versionsData, isLoading: versionsLoading } = useQuery({
    queryKey: ["payroll-versions", selectedRun?.year, selectedRun?.month],
    queryFn: () => payrollApi.getVersionHistory(selectedRun!.year, selectedRun!.month),
    enabled: versionHistoryOpen && !!selectedRun,
  });

  const { data: calcLogsData, isLoading: calcLogsLoading } = useQuery({
    queryKey: ["payroll-calc-logs", selectedRun?.id],
    queryFn: () => payrollApi.getCalculationLogs(selectedRun!.id),
    enabled: !!selectedRun && breakdownEmployeeId !== null,
  });

  const runs: PayrollRun[] = runsData?.data?.data ?? [];
  const details: PayrollDetail[] = detailsData?.data?.data ?? [];
  const dashboard = dashboardData?.data?.data;
  const versions: PayrollRun[] = versionsData?.data?.data ?? [];
  const activeBreakdownLog = (calcLogsData?.data?.data ?? []).find((l) => l.employeeId === breakdownEmployeeId) ?? null;

  const pendingCount = details.filter((d) => d.paymentStatus === "PENDING").length;
  const paidCount = details.filter((d) => d.paymentStatus === "PAID").length;
  const totalPending = details.filter((d) => d.paymentStatus === "PENDING").reduce((s, d) => s + d.netSalary, 0);

  const refreshRun = () => {
    qc.invalidateQueries({ queryKey: ["payroll-runs"] });
    qc.invalidateQueries({ queryKey: ["payroll-details", selectedRun?.id] });
    qc.invalidateQueries({ queryKey: ["payroll-dashboard", selectedRun?.id] });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────
  const generateM = useMutation({
    mutationFn: () => payrollApi.generate({ year: genYear, month: genMonth, remarks: genRemarks }),
    onSuccess: (res) => {
      toast.success(`Payroll ${res.data.data.runReference} generated`);
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      setSelectedRun(res.data.data);
      setShowGenerate(false);
      setGenRemarks("");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Generation failed"),
  });

  const recalculateM = useMutation({
    mutationFn: (runId: number) => payrollApi.recalculate(runId),
    onSuccess: (res) => {
      toast.success(`Recalculated as version ${res.data.data.calculationVersion}`);
      setSelectedRun(res.data.data);
      refreshRun();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Recalculation failed"),
  });

  const verifyM = useMutation({
    mutationFn: (req: ActionRemarksRequest) => payrollApi.verify(selectedRun!.id, req),
    onSuccess: (res) => {
      toast.success("Payroll verified");
      setSelectedRun(res.data.data);
      refreshRun();
      setVerifyConfirm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Verify failed"),
  });

  const approveM = useMutation({
    mutationFn: (req: ActionRemarksRequest) => payrollApi.approve(selectedRun!.id, req),
    onSuccess: (res) => {
      toast.success("Payroll approved — attendance for this period is now locked");
      setSelectedRun(res.data.data);
      refreshRun();
      setApproveConfirm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Approve failed"),
  });

  const reopenM = useMutation({
    mutationFn: (req: ReopenPayrollRequest) => payrollApi.reopen(selectedRun!.id, req),
    onSuccess: (res) => {
      toast.success(`Reopened as version ${res.data.data.calculationVersion} — attendance unlocked`);
      setSelectedRun(res.data.data);
      refreshRun();
      setReopenOpen(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Reopen failed"),
  });

  const disburseOneM = useMutation({
    mutationFn: ({ id, req }: { id: number; req: DisburseRequest }) => payrollApi.disburseOne(id, req),
    onSuccess: () => {
      toast.success("Salary disbursed and cashbook updated");
      refreshRun();
      setDisburseOneTarget(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Disbursement failed"),
  });

  const disburseAllM = useMutation({
    mutationFn: ({ runId, req }: { runId: number; req: DisburseRequest }) => payrollApi.disburseAll(runId, req),
    onSuccess: () => {
      toast.success(`All ${pendingCount} salaries disbursed`);
      refreshRun();
      setDisburseAllOpen(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Disbursement failed"),
  });

  const lockM = useMutation({
    mutationFn: (runId: number) => payrollApi.lockRun(runId),
    onSuccess: (res) => {
      toast.success("Payroll run locked");
      setSelectedRun(res.data.data);
      refreshRun();
      setLockConfirm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Lock failed"),
  });

  const scanExceptions = async () => {
    try {
      const res = await payrollApi.getExceptionReport(excYear, excMonth);
      setExceptions(res.data.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Scan failed");
    }
  };

  // ── Run list columns ───────────────────────────────────────────────────────
  const runColumns: Column<PayrollRun>[] = [
    {
      key: "ref",
      header: "Reference",
      render: (r) => (
        <button onClick={() => setSelectedRun(r)} className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5">
          {r.runReference}
          <span className="text-gray-400 font-normal">v{r.calculationVersion}</span>
        </button>
      ),
    },
    { key: "period", header: "Period", render: (r) => `${MONTHS[r.month - 1]} ${r.year}` },
    { key: "emps", header: "Employees", render: (r) => r.totalEmployees ?? "—", className: "text-center" },
    { key: "gross", header: "Total Gross", render: (r) => (r.totalGross ? formatCurrency(r.totalGross) : "—") },
    { key: "net", header: "Total Net", render: (r) => (r.totalNet ? <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.totalNet)}</span> : "—") },
    { key: "status", header: "Status", render: (r) => <Badge variant={payrollStatusVariant(r.status)}>{r.status}</Badge> },
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
          {r.status === "CALCULATED" && (
            <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={recalculateM.isPending} onClick={() => recalculateM.mutate(r.id)}>
              Recalc
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
    {
      key: "days",
      header: "P / WO / H / L / A",
      render: (d) => (
        <span className="text-xs font-mono text-gray-500">
          {d.presentDays}/{d.weeklyOffDays}/{d.holidayDays}/{d.paidLeaveDays}/{d.absentDays}
        </span>
      ),
    },
    { key: "gross", header: "Gross", render: (d) => formatCurrency(d.grossSalary) },
    {
      key: "ded",
      header: "Deductions",
      render: (d) => (d.totalDeductions + d.lossOfPayAmount > 0 ? <span className="text-red-500 font-medium">-{formatCurrency(d.totalDeductions + d.lossOfPayAmount)}</span> : <span className="text-gray-400">—</span>),
    },
    { key: "net", header: "Net Salary", render: (d) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.netSalary)}</span> },
    { key: "capped", header: "Capped", render: (d) => (d.salaryCapped ? <Badge variant="warning">Yes</Badge> : <Badge variant="neutral">No</Badge>) },
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
          <Button size="sm" variant="ghost" icon={<FileText size={13} />} onClick={() => setBreakdownEmployeeId(d.employeeId)}>
            Breakdown
          </Button>
          <Button size="sm" variant="ghost" icon={<Printer size={13} />} onClick={() => setPayslipView(d)}>
            Payslip
          </Button>
          {d.paymentStatus === "PENDING" && (selectedRun?.status === "APPROVED" || selectedRun?.status === "PROCESSED") && (
            <Button size="sm" variant="ghost" icon={<IndianRupee size={13} />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => setDisburseOneTarget(d)}>
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
        subtitle="Generate, verify, approve and disburse monthly payroll"
        icon={<IndianRupee size={20} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" icon={<ListChecks size={15} />} onClick={() => setExceptionModalOpen(true)}>
              Check Exceptions
            </Button>
            <Button icon={<Play size={15} />} onClick={() => setShowGenerate(true)}>
              Generate Payroll
            </Button>
          </div>
        }
      />

      {/* Run list */}
      {!selectedRun && (
        <>
          {runs.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <KPICard title="Latest Employees" value={runs[0]?.totalEmployees ?? 0} icon={<Users size={18} />} color="blue" index={0} />
              <KPICard title="Latest Gross" value={formatCurrency(runs[0]?.totalGross ?? 0)} icon={<TrendingDown size={18} />} color="orange" index={1} />
              <KPICard title="Latest Net Payout" value={formatCurrency(runs[0]?.totalNet ?? 0)} icon={<IndianRupee size={18} />} color="green" index={2} />
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
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedRun(null)}>
                  ← All Runs
                </Button>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedRun.runReference} — {MONTHS[selectedRun.month - 1]} {selectedRun.year}
                    <span className="text-xs font-normal text-gray-400">v{selectedRun.calculationVersion}</span>
                    {!selectedRun.isCurrentVersion && <Badge variant="neutral">Historical</Badge>}
                  </h2>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    {formatDate(selectedRun.periodStart)} to {formatDate(selectedRun.periodEnd)}
                    <Badge variant={payrollStatusVariant(selectedRun.status)}>{selectedRun.status}</Badge>
                    <button onClick={() => setVersionHistoryOpen(true)} className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline">
                      <History size={12} /> Version history
                    </button>
                  </p>
                </div>
              </div>

              {/* Lifecycle action bar */}
              <div className="flex gap-2 flex-wrap">
                {selectedRun.status === "CALCULATED" && (
                  <>
                    <Button variant="outline" icon={<RefreshCw size={15} />} loading={recalculateM.isPending} onClick={() => recalculateM.mutate(selectedRun.id)}>
                      Recalculate
                    </Button>
                    <Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={() => setVerifyConfirm(true)}>
                      Verify
                    </Button>
                  </>
                )}
                {selectedRun.status === "VERIFIED" && (
                  <>
                    <Button variant="outline" icon={<Unlock size={15} />} onClick={() => setReopenOpen(true)}>
                      Reopen
                    </Button>
                    <Button variant="primary" icon={<ShieldCheck size={15} />} onClick={() => setApproveConfirm(true)}>
                      Approve
                    </Button>
                  </>
                )}
                {selectedRun.status === "APPROVED" && (
                  <>
                    <Button variant="outline" icon={<Unlock size={15} />} onClick={() => setReopenOpen(true)}>
                      Reopen
                    </Button>
                    {pendingCount > 0 && (
                      <Button variant="primary" icon={<IndianRupee size={15} />} onClick={() => setDisburseAllOpen(true)}>
                        Pay All ({pendingCount})
                      </Button>
                    )}
                  </>
                )}
                {selectedRun.status === "PROCESSED" && (
                  <>
                    <Button variant="outline" icon={<Unlock size={15} />} onClick={() => setReopenOpen(true)}>
                      Reopen
                    </Button>
                    {pendingCount > 0 && (
                      <Button variant="primary" icon={<IndianRupee size={15} />} onClick={() => setDisburseAllOpen(true)}>
                        Pay All ({pendingCount})
                      </Button>
                    )}
                  </>
                )}
                {selectedRun.status === "PAID" && (
                  <Button variant="secondary" icon={<Lock size={15} />} onClick={() => setLockConfirm(true)}>
                    Lock Run
                  </Button>
                )}
                {selectedRun.status === "LOCKED" && <Badge variant="neutral">Permanently Locked</Badge>}
              </div>
            </div>

            <RunActionSummary run={selectedRun} />

            {/* Dashboard KPIs */}
            {dashboard && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <KPICard title="Total Employees" value={dashboard.totalEmployees} icon={<Users size={18} />} color="blue" index={0} />
                <KPICard title="Paid" value={dashboard.paidCount} icon={<CheckCircle2 size={18} />} color="green" index={1} />
                <KPICard title="Pending" value={dashboard.pendingCount} icon={<AlertTriangle size={18} />} color="orange" index={2} />
                <KPICard title="Pending Amount" value={formatCurrency(totalPending)} icon={<IndianRupee size={18} />} color="red" index={3} />
                <KPICard title="Basic Salary" value={formatCurrency(dashboard.totalBasicSalary)} color="blue" index={4} />
                <KPICard title="Overtime + Weekly-Off + Holiday" value={formatCurrency(dashboard.totalOvertime + dashboard.totalWeeklyOffAmount + dashboard.totalHolidayPay)} color="purple" index={5} />
                <KPICard title="Leave Encashment" value={formatCurrency(dashboard.totalLeaveEncashment)} color="teal" index={6} />
                <KPICard title="Loss of Pay" value={formatCurrency(dashboard.totalLossOfPay)} color="red" index={7} />
              </div>
            )}

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
          <Select label="Year *" value={String(genYear)} onChange={(e) => setGenYear(Number(e.target.value))} options={yOpts} />
          <Select label="Month *" value={String(genMonth)} onChange={(e) => setGenMonth(Number(e.target.value))} options={mOpts} />

          {/*
            Read-only hint only — the backend's PayrollGenerationPolicyValidator is the sole
            source of truth. This never blocks the Generate button; it just tells the user
            what to expect, per the "generation policy" that governs when payroll is allowed.
          */}
          {(() => {
            const periodEnd = new Date(genYear, genMonth, 0); // day 0 of next month = last day of genMonth
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            periodEnd.setHours(0, 0, 0, 0);
            const hasEnded = today > periodEnd;
            const periodEndLabel = periodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            return hasEnded ? (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {MONTHS[genMonth - 1]} {genYear} ended on {periodEndLabel} — this period is ready to generate.
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {MONTHS[genMonth - 1]} {genYear} doesn't end until {periodEndLabel}. Under the current Payroll Generation Policy, the backend may reject this request until then — a settings snapshot is captured and reused for every future recalculation of this month regardless.
              </div>
            );
          })()}

          <Input label="Remarks" value={genRemarks} onChange={(e) => setGenRemarks(e.target.value)} placeholder="Optional" />
        </div>
      </Modal>

      {/* ── Disburse Single / All ────────────────────────────────────────────── */}
      <DisburseModal
        isOpen={!!disburseOneTarget}
        onClose={() => setDisburseOneTarget(null)}
        onConfirm={(req) => disburseOneM.mutate({ id: disburseOneTarget!.id, req })}
        loading={disburseOneM.isPending}
        title={`Pay Salary — ${disburseOneTarget?.employeeName}`}
        totalAmount={disburseOneTarget?.netSalary}
      />
      <DisburseModal
        isOpen={disburseAllOpen}
        onClose={() => setDisburseAllOpen(false)}
        onConfirm={(req) => disburseAllM.mutate({ runId: selectedRun!.id, req })}
        loading={disburseAllM.isPending}
        title={`Pay All Salaries — ${MONTHS[selectedRun ? selectedRun.month - 1 : 0]} ${selectedRun?.year}`}
        totalAmount={totalPending}
        employeeCount={pendingCount}
      />

      {/* ── Lifecycle confirm modals ─────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={verifyConfirm}
        onClose={() => setVerifyConfirm(false)}
        onConfirm={() => verifyM.mutate({})}
        title="Verify Payroll?"
        message="Confirms the calculated numbers are correct. The run moves to VERIFIED and can then be approved."
        confirmLabel="Verify"
        variant="primary"
        loading={verifyM.isPending}
      />
      <ConfirmModal
        isOpen={approveConfirm}
        onClose={() => setApproveConfirm(false)}
        onConfirm={() => approveM.mutate({})}
        title="Approve Payroll?"
        message="Approves for disbursement and LOCKS attendance for this entire period. Attendance can only be edited again by reopening this run."
        confirmLabel="Approve"
        variant="primary"
        loading={approveM.isPending}
      />
      <ConfirmModal
        isOpen={lockConfirm}
        onClose={() => setLockConfirm(false)}
        onConfirm={() => lockM.mutate(selectedRun!.id)}
        title="Lock Payroll Run?"
        message="This will permanently lock the payroll run. No further changes, disbursements or reopening will be possible."
        confirmLabel="Lock Run"
        loading={lockM.isPending}
      />
      <ReopenModal isOpen={reopenOpen} onClose={() => setReopenOpen(false)} onConfirm={(req) => reopenM.mutate(req)} loading={reopenM.isPending} />

      {/* ── Version History ──────────────────────────────────────────────────── */}
      <VersionHistoryModal isOpen={versionHistoryOpen} onClose={() => setVersionHistoryOpen(false)} versions={versions} loading={versionsLoading} currentRunId={selectedRun?.id} onSelect={(v) => setSelectedRun(v)} />

      {/* ── Calculation Breakdown ────────────────────────────────────────────── */}
      <BreakdownModal isOpen={breakdownEmployeeId !== null} onClose={() => setBreakdownEmployeeId(null)} log={activeBreakdownLog} loading={calcLogsLoading} />

      {/* ── Exception Report ─────────────────────────────────────────────────── */}
      <ExceptionReportModal isOpen={exceptionModalOpen} onClose={() => setExceptionModalOpen(false)} year={excYear} month={excMonth} setYear={setExcYear} setMonth={setExcMonth} exceptions={exceptions} loading={false} onScan={scanExceptions} />

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
            <div className="flex justify-between items-start p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800">
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{payslipView.employeeName}</p>
                <p className="text-xs text-gray-500 font-mono">{payslipView.employeeCode}</p>
              </div>
              <div className="text-right">
                <Badge variant={payslipView.paymentStatus === "PAID" ? "success" : "warning"}>{payslipView.paymentStatus}</Badge>
                <p className="text-xs text-gray-400 mt-1">
                  {MONTHS[selectedRun.month - 1]} {selectedRun.year} · v{payslipView.calculationVersion}
                </p>
              </div>
            </div>

            {payslipView.salaryCapped && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex gap-2 items-start">
                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">Salary was capped — deductions exceeded net. Balance carries forward.</p>
              </div>
            )}

            {/* Earnings breakdown */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Earnings</div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-600 dark:text-gray-400">Base Salary ({payslipView.presentDays} present days)</span>
                  <span className="font-medium">{formatCurrency(payslipView.baseSalary)}</span>
                </div>
                {payslipView.overtimePay > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Overtime ({(payslipView.overtimeMinutes / 60).toFixed(1)}h × {payslipView.overtimeMultiplier}x)
                    </span>
                    <span className="font-medium text-brand-600">{formatCurrency(payslipView.overtimePay)}</span>
                  </div>
                )}
                {payslipView.weeklyOffPay > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Weekly Off Pay ({payslipView.weeklyOffWorkedDays} day(s) worked × {payslipView.weeklyOffMultiplier}x)
                    </span>
                    <span className="font-medium text-blue-600">{formatCurrency(payslipView.weeklyOffPay)}</span>
                  </div>
                )}
                {payslipView.holidayOtPay > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      Holiday OT ({payslipView.holidayWorkedDays} day(s) worked × {payslipView.holidayOtMultiplier}x)
                    </span>
                    <span className="font-medium text-purple-600">{formatCurrency(payslipView.holidayOtPay)}</span>
                  </div>
                )}
                {payslipView.leaveEncashmentAmount > 0 && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-600 dark:text-gray-400">Leave Encashment ({payslipView.leaveEncashmentDays} day(s))</span>
                    <span className="font-medium text-teal-600">{formatCurrency(payslipView.leaveEncashmentAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60">
                  <span className="font-semibold">Gross Salary</span>
                  <span className="font-bold">{formatCurrency(payslipView.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            {(payslipView.totalDeductions > 0 || payslipView.lossOfPayAmount > 0) && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deductions</div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {payslipView.lossOfPayAmount > 0 && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-gray-600 dark:text-gray-400">Loss of Pay ({payslipView.absentDays} day(s))</span>
                      <span className="text-red-500">-{formatCurrency(payslipView.lossOfPayAmount)}</span>
                    </div>
                  )}
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
                    <span className="font-bold text-red-500">-{formatCurrency(payslipView.totalDeductions + payslipView.lossOfPayAmount)}</span>
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

            {/* Day breakdown */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 grid grid-cols-5 gap-2">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.presentDays}d</p>
                <p>Present</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.weeklyOffDays}d</p>
                <p>Weekly Off</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.holidayDays}d</p>
                <p>Holiday</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.paidLeaveDays}d</p>
                <p>Paid Leave</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">{payslipView.absentDays}d</p>
                <p>Absent</p>
              </div>
            </div>

            <button
              onClick={() => {
                setBreakdownEmployeeId(payslipView.employeeId);
              }}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <FileText size={12} /> View full calculation breakdown
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
