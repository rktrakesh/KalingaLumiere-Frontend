import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Plus, Eye, UserX, DollarSign, CalendarDays } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { employeesApi } from "@/services/api/employees.api";
import { Employee } from "@/types";
import { DataTable, Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchFilter } from "@/components/common/SearchFilter";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { formatCurrency, formatDate } from "@/utils/format";
import { EmployeeCalendarModal } from "./EmployeeCalendarModal";

const createSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Must be 10 digits")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date required"),
  designation: z.string().optional(),
  currentSalary: z.coerce.number().positive("Salary must be positive"),
  salaryRemarks: z.string().optional(),
});

const salarySchema = z.object({
  newSalary: z.coerce.number().positive("Salary must be positive"),
  effectiveFrom: z.string().min(1, "Effective date required"),
  remarks: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type SalaryForm = z.infer<typeof salarySchema>;

export default function EmployeesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSalary, setShowSalary] = useState<Employee | null>(null);
  const [calEmployee, setCalEmployee] = useState<Employee | null>(null); // calendar
  const dSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", page, size, dSearch, statusFilter],
    queryFn: () => employeesApi.getAll({ page, size, search: dSearch || undefined, status: statusFilter || undefined }),
  });

  const pageData = data?.data?.data;
  const employees = pageData?.content ?? [];

  const cForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const sForm = useForm<SalaryForm>({ resolver: zodResolver(salarySchema) });

  const createM = useMutation({
    mutationFn: (d: CreateForm) => employeesApi.create(d),
    onSuccess: () => {
      toast.success("Employee created successfully");
      qc.invalidateQueries({ queryKey: ["employees"] });
      setShowCreate(false);
      cForm.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to create employee"),
  });

  const deactivateM = useMutation({
    mutationFn: (id: number) => employeesApi.deactivate(id),
    onSuccess: () => {
      toast.success("Employee deactivated");
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to deactivate"),
  });

  const salaryM = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SalaryForm }) => employeesApi.updateSalary(id, data),
    onSuccess: () => {
      toast.success("Salary updated successfully");
      qc.invalidateQueries({ queryKey: ["employees"] });
      setShowSalary(null);
      sForm.reset();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update salary"),
  });

  const columns: Column<Employee>[] = [
    {
      key: "code",
      header: "Code",
      render: (e) => (
        // Clickable employee code → opens calendar
        <button onClick={() => setCalEmployee(e)} className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 hover:underline underline-offset-2 transition-colors flex items-center gap-1" title="Click to view attendance calendar">
          <CalendarDays size={11} />
          {e.employeeCode}
        </button>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (e) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{e.name}</p>
          {e.designation && <p className="text-xs text-gray-400">{e.designation}</p>}
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (e) => e.phone ?? "—" },
    { key: "join", header: "Joined", render: (e) => formatDate(e.joiningDate) },
    { key: "salary", header: "Salary", render: (e) => <span className="font-semibold">{formatCurrency(e.currentSalary)}</span>, className: "text-right" },
    { key: "status", header: "Status", render: (e) => <Badge variant={statusBadge(e.status)}>{e.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (e) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" icon={<Eye size={13} />} onClick={() => navigate(`/employees/${e.id}`)}>
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<DollarSign size={13} />}
            onClick={() => {
              setShowSalary(e);
              sForm.reset();
            }}
          >
            Salary
          </Button>
          <Button size="sm" variant="ghost" icon={<CalendarDays size={13} />} onClick={() => setCalEmployee(e)}>
            Calendar
          </Button>
          {e.status === "ACTIVE" && (
            <Button size="sm" variant="ghost" icon={<UserX size={13} />} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" loading={deactivateM.isPending} onClick={() => deactivateM.mutate(e.id)}>
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${pageData?.totalElements ?? 0} total employees`}
        icon={<Users size={20} />}
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setShowCreate(true)}>
            Add Employee
          </Button>
        }
      />

      <SearchFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          goToPage(0);
        }}
        placeholder="Search by name, code or designation…"
        filters={[
          {
            key: "status",
            label: "All Status",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              goToPage(0);
            },
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ],
          },
        ]}
      />

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
        <CalendarDays size={11} /> Click the employee code to view attendance calendar
      </p>

      <DataTable columns={columns} data={employees} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={(e) => e.id} emptyMessage="No employees found. Add your first employee!" />

      {/* ── Create Employee Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          cForm.reset();
        }}
        title="Add New Employee"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                cForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button loading={createM.isPending} onClick={cForm.handleSubmit((d) => createM.mutate(d))}>
              Create Employee
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name *" error={cForm.formState.errors.name?.message} placeholder="e.g. Ravi Kumar" {...cForm.register("name")} className="col-span-2" />
          <Input label="Phone" error={cForm.formState.errors.phone?.message} placeholder="10-digit mobile number" {...cForm.register("phone")} />
          <Input label="Designation" placeholder="e.g. Floor Supervisor" {...cForm.register("designation")} />
          <Input label="Joining Date *" type="date" error={cForm.formState.errors.joiningDate?.message} {...cForm.register("joiningDate")} />
          <Input label="Monthly Salary (₹) *" type="number" error={cForm.formState.errors.currentSalary?.message} placeholder="e.g. 15000" {...cForm.register("currentSalary")} />
          <Input label="Address" placeholder="Full address" {...cForm.register("address")} className="col-span-2" />
          <Input label="Salary Remarks" placeholder="Reason for initial salary (optional)" {...cForm.register("salaryRemarks")} className="col-span-2" />
        </div>
      </Modal>

      {/* ── Update Salary Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!showSalary}
        onClose={() => {
          setShowSalary(null);
          sForm.reset();
        }}
        title={`Update Salary — ${showSalary?.name}`}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowSalary(null);
                sForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button loading={salaryM.isPending} onClick={sForm.handleSubmit((d) => salaryM.mutate({ id: showSalary!.id, data: d }))}>
              Update Salary
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm flex justify-between">
            <span className="text-gray-500">Current Salary</span>
            <span className="font-bold text-gray-900 dark:text-white">{showSalary ? formatCurrency(showSalary.currentSalary) : ""}</span>
          </div>
          <Input label="New Salary (₹) *" type="number" error={sForm.formState.errors.newSalary?.message} placeholder="e.g. 18000" {...sForm.register("newSalary")} />
          <Input label="Effective From *" type="date" error={sForm.formState.errors.effectiveFrom?.message} {...sForm.register("effectiveFrom")} />
          <Input label="Remarks" placeholder="Reason for salary change" {...sForm.register("remarks")} />
        </div>
      </Modal>

      {/* ── Employee Attendance Calendar ──────────────────────────────────── */}
      <AnimatePresence>{calEmployee && <EmployeeCalendarModal employee={calEmployee} onClose={() => setCalEmployee(null)} />}</AnimatePresence>
    </div>
  );
}
