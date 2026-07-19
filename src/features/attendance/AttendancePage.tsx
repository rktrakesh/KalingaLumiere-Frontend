import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Plus, AlertCircle } from "lucide-react";
import { attendanceApi } from "@/services/api/attendance.api";
import { employeesApi } from "@/services/api/employees.api";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import { usePagination } from "@/hooks/usePagination";
import { AttendanceRecord } from "@/types";
import { formatDate, minutesToHours } from "@/utils/format";

const checkInSchema = z.object({
  employeeId: z.coerce.number().positive("Select an employee"),
  attendanceDate: z.string().min(1, "Date required"),
  checkIn: z.string().min(1, "Check-in time required"),
  remarks: z.string().optional(),
});

const correctSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.string().optional(),
  remarks: z.string().min(1, "Remarks required for correction"),
});

type CheckInForm = z.infer<typeof checkInSchema>;
type CorrectForm = z.infer<typeof correctSchema>;

export default function AttendancePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination(0, 20);

  const today = new Date().toISOString().split("T")[0];
  const [dateFilter, setDateFilter] = useState(today);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [correctRecord, setCorrectRecord] = useState<AttendanceRecord | null>(null);

  // ── Fetch all active employees for the dropdown ──────────────────────────
  const { data: empData } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => employeesApi.getAll({ status: "ACTIVE", size: 200 }),
  });
  const employees = empData?.data?.data?.content ?? [];
  const employeeOptions = employees.map((e: any) => ({
    value: String(e.id),
    label: `${e.employeeCode} — ${e.name}`,
  }));

  // ── Attendance records ────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", page, size, dateFilter, statusFilter],
    queryFn: () =>
      attendanceApi.search({
        page,
        size,
        date: dateFilter || undefined,
        status: (statusFilter as any) || undefined,
      }),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["attendance-pending"],
    queryFn: () => attendanceApi.getPendingCheckouts(),
  });

  const pageData = data?.data?.data;
  const records = pageData?.content ?? [];
  const pendingCount = pendingData?.data?.data?.length ?? 0;

  // ── Forms ─────────────────────────────────────────────────────────────────
  const ciForm = useForm<CheckInForm>({ resolver: zodResolver(checkInSchema) });
  const corrForm = useForm<CorrectForm>({ resolver: zodResolver(correctSchema) });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const checkInM = useMutation({
    mutationFn: (d: CheckInForm) => attendanceApi.checkIn(d),
    onSuccess: (_, vars) => {
      toast.success("Check-in recorded successfully");
      // Refresh attendance list and pending count
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-pending"] });
      // Switch date filter to the date that was just checked in
      setDateFilter(vars.attendanceDate);
      setStatusFilter("");
      setShowCheckIn(false);
      ciForm.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Check-in failed"),
  });

  const checkOutM = useMutation({
    mutationFn: ({ id, checkOut }: { id: number; checkOut: string }) => attendanceApi.checkOut(id, { checkOut }),
    onSuccess: () => {
      toast.success("Check-out recorded");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-pending"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Check-out failed"),
  });

  const correctM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CorrectForm }) => attendanceApi.correct(id, data),
    onSuccess: () => {
      toast.success("Attendance corrected");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      setCorrectRecord(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Correction failed"),
  });

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns: Column<AttendanceRecord>[] = [
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
    { key: "date", header: "Date", render: (r) => formatDate(r.attendanceDate) },
    { key: "in", header: "Check In", render: (r) => r.checkIn ?? "—" },
    { key: "out", header: "Check Out", render: (r) => r.checkOut ?? "—" },
    { key: "hrs", header: "Worked", render: (r) => (r.workedMinutes > 0 ? minutesToHours(r.workedMinutes) : "—") },
    {
      key: "stat",
      header: "Status",
      render: (r) => <Badge variant={statusBadge(r.status)}>{r.status.replace(/_/g, " ")}</Badge>,
    },
    { key: "rem", header: "Remarks", render: (r) => <span className="text-xs text-gray-500 truncate max-w-36 block">{r.remarks ?? "—"}</span> },
    {
      key: "act",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          {/* Quick check-out button for PENDING_CHECKOUT or PRESENT with no checkout */}
          {(r.status === "PENDING_CHECKOUT" || (r.status === "PRESENT" && !r.checkOut)) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              loading={checkOutM.isPending}
              onClick={() => {
                const now = new Date().toTimeString().slice(0, 5);
                checkOutM.mutate({ id: r.id, checkOut: now });
              }}
            >
              Check Out
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCorrectRecord(r);
              corrForm.reset({
                checkIn: r.checkIn ?? "",
                checkOut: r.checkOut ?? "",
                status: r.status,
              });
            }}
          >
            Correct
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Daily attendance tracking"
        icon={<Clock size={20} />}
        actions={
          <Button
            icon={<Plus size={15} />}
            onClick={() => {
              setShowCheckIn(true);
              ciForm.reset({ attendanceDate: today });
            }}
          >
            Check In
          </Button>
        }
      />

      {/* Pending checkout alert */}
      {pendingCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">{pendingCount} employee(s) have pending checkout — resolve before month closing.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              goToPage(0);
            }}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="w-44">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              goToPage(0);
            }}
            placeholder="All Status"
            options={[
              { value: "PRESENT", label: "Present" },
              { value: "ABSENT", label: "Absent" },
              { value: "PAID_LEAVE", label: "Paid Leave" },
              { value: "HOLIDAY", label: "Holiday" },
              { value: "PENDING_CHECKOUT", label: "Pending Checkout" },
            ]}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDateFilter(today);
            setStatusFilter("");
            goToPage(0);
          }}
        >
          Reset
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={isLoading}
        totalPages={pageData?.totalPages}
        currentPage={page}
        totalElements={pageData?.totalElements}
        pageSize={size}
        onPageChange={goToPage}
        rowKey={(r) => r.id}
        emptyMessage={dateFilter ? `No attendance records for ${formatDate(dateFilter)}` : "No records found"}
      />

      {/* ── Check-In Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={showCheckIn}
        onClose={() => {
          setShowCheckIn(false);
          ciForm.reset();
        }}
        title="Record Check-In"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowCheckIn(false);
                ciForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button loading={checkInM.isPending} onClick={ciForm.handleSubmit((d) => checkInM.mutate(d))}>
              Record Check-In
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Employee dropdown instead of manual ID entry */}
          <Select label="Employee *" options={employeeOptions} placeholder="Select employee" error={ciForm.formState.errors.employeeId?.message} {...ciForm.register("employeeId")} />
          <Input label="Date *" type="date" error={ciForm.formState.errors.attendanceDate?.message} {...ciForm.register("attendanceDate")} />
          <Input label="Check-In Time *" type="time" error={ciForm.formState.errors.checkIn?.message} {...ciForm.register("checkIn")} />
          <Input label="Remarks" placeholder="Optional notes" {...ciForm.register("remarks")} />
        </div>
      </Modal>

      {/* ── Correct Attendance Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={!!correctRecord}
        onClose={() => setCorrectRecord(null)}
        title={`Correct Attendance — ${correctRecord?.employeeName}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCorrectRecord(null)}>
              Cancel
            </Button>
            <Button loading={correctM.isPending} onClick={corrForm.handleSubmit((d) => correctM.mutate({ id: correctRecord!.id, data: d }))}>
              Save Correction
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Corrections are only allowed within 7 days and when the month is open.</div>
          <Input label="Check-In Time" type="time" {...corrForm.register("checkIn")} />
          <Input label="Check-Out Time" type="time" {...corrForm.register("checkOut")} />
          <Select
            label="Status"
            options={[
              { value: "PRESENT", label: "Present" },
              { value: "ABSENT", label: "Absent" },
              { value: "PAID_LEAVE", label: "Paid Leave" },
              { value: "HOLIDAY", label: "Holiday" },
            ]}
            {...corrForm.register("status")}
          />
          <Input label="Remarks *" error={corrForm.formState.errors.remarks?.message} placeholder="Reason for correction (required)" {...corrForm.register("remarks")} />
        </div>
      </Modal>
    </div>
  );
}
