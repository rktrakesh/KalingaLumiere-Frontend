import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangeEmployeeStatusRequest, Employee, EmployeeStatus } from "@/types";
import { employeesApi } from "@/services/api/employees.api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";

interface EmployeeLifecycleModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const labels: Record<EmployeeStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ON_NOTICE: "On Notice",
  RESIGNED: "Resigned",
  INACTIVE: "Inactive",
};

export function EmployeeLifecycleModal({ employee, isOpen, onClose }: EmployeeLifecycleModalProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [targetStatus, setTargetStatus] = useState<EmployeeStatus | "">("");
  const [reason, setReason] = useState("");
  const [noticeStartDate, setNoticeStartDate] = useState("");
  const [lastWorkingDate, setLastWorkingDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTargetStatus(employee.allowedNextStatuses?.[0] ?? "");
      setReason("");
      setNoticeStartDate(employee.noticeStartDate ?? "");
      setLastWorkingDate(employee.lastWorkingDate ?? "");
    }
  }, [employee, isOpen]);

  const mutation = useMutation({
    mutationFn: (request: ChangeEmployeeStatusRequest) => employeesApi.changeStatus(employee.id, request),
    onSuccess: (response) => {
      toast.success(response.data.message ?? "Employee status updated");
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Unable to change employee status")),
  });

  const requiresReason = targetStatus === "ON_NOTICE" || targetStatus === "RESIGNED" || targetStatus === "INACTIVE";
  const requiresNoticeDates = targetStatus === "ON_NOTICE";
  const requiresLastWorkingDate = targetStatus === "RESIGNED";
  const canSubmit = !!targetStatus
    && (!requiresReason || reason.trim().length > 0)
    && (!requiresNoticeDates || (!!noticeStartDate && !!lastWorkingDate))
    && (!requiresLastWorkingDate || !!lastWorkingDate);

  const submit = () => {
    if (!targetStatus || !canSubmit) return;
    mutation.mutate({
      targetStatus,
      reason: reason.trim() || undefined,
      noticeStartDate: noticeStartDate || undefined,
      lastWorkingDate: lastWorkingDate || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change employee status" size="md" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!canSubmit} loading={mutation.isPending} onClick={submit}>Confirm status change</Button></>}>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/60">
          <span className="text-gray-500">Current status</span>
          <p className="mt-1 font-semibold text-gray-900 dark:text-white">{labels[employee.status]}</p>
        </div>
        <Select label="Next status" value={targetStatus} onChange={(event) => setTargetStatus(event.target.value as EmployeeStatus)} placeholder="Select an allowed status" options={(employee.allowedNextStatuses ?? []).map((status) => ({ value: status, label: labels[status] }))} />
        {requiresReason && <div className="space-y-1.5"><label htmlFor="lifecycle-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason *</label><textarea id="lifecycle-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white" /></div>}
        {(requiresNoticeDates || (targetStatus === "RESIGNED" && employee.status === "ON_NOTICE")) && <Input label="Notice start date" type="date" value={noticeStartDate} onChange={(event) => setNoticeStartDate(event.target.value)} required={requiresNoticeDates} />}
        {(requiresNoticeDates || requiresLastWorkingDate) && <Input label="Last working date *" type="date" value={lastWorkingDate} onChange={(event) => setLastWorkingDate(event.target.value)} />}
        {employee.status === "DRAFT" && targetStatus === "ACTIVE" && <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Profile Photo and Identity Proof must both be uploaded before activation.</p>}
        {employee.status === "ACTIVE" && targetStatus === "RESIGNED" && <p className="text-xs text-gray-500">Direct resignation is treated as zero-notice separation. The notice date will equal the final working date.</p>}
      </div>
    </Modal>
  );
}
