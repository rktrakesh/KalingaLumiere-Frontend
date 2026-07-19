import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timer, CheckCircle, XCircle } from 'lucide-react';
import { overtimeApi } from '@/services/api/overtime.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { OvertimeRequest } from '@/types';
import { formatDate, minutesToHours } from '@/utils/format';

export default function OvertimePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [approveRec, setApproveRec] = useState<OvertimeRequest | null>(null);
  const [approvedMin, setApprovedMin] = useState(0);
  const [approveRem, setApproveRem] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['overtime', page, size, statusFilter],
    queryFn: () => overtimeApi.search({ page, size, status: statusFilter as any || undefined }),
  });
  const pageData = data?.data?.data;
  const records: OvertimeRequest[] = pageData?.content ?? [];

  const approveM = useMutation({ mutationFn: ({ id, data }: { id: number; data: { approvedMinutes: number; remarks?: string } }) => overtimeApi.approve(id, data), onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['overtime'] }); setApproveRec(null); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const rejectM  = useMutation({ mutationFn: ({ id, remarks }: { id: number; remarks: string }) => overtimeApi.reject(id, remarks), onSuccess: () => { toast.success('Rejected'); qc.invalidateQueries({ queryKey: ['overtime'] }); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });

  const columns: Column<OvertimeRequest>[] = [
    { key: 'emp',  header: 'Employee',  render: (r) => <div><p className="font-medium">{r.employeeName}</p><p className="text-xs text-gray-400">{r.employeeCode}</p></div> },
    { key: 'date', header: 'Date',      render: (r) => formatDate(r.overtimeDate) },
    { key: 'type', header: 'Type',      render: (r) => <Badge variant="info">{r.requestType.replace('_',' ')}</Badge> },
    { key: 'req',  header: 'Requested', render: (r) => minutesToHours(r.requestedMinutes) },
    { key: 'app',  header: 'Approved',  render: (r) => r.approvedMinutes ? minutesToHours(r.approvedMinutes) : '—' },
    { key: 'stat', header: 'Status',    render: (r) => <Badge variant={statusBadge(r.status)}>{r.status}</Badge> },
    { key: 'act',  header: 'Actions',   render: (r) => r.status === 'PENDING' ? (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<CheckCircle size={13}/>} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => { setApproveRec(r); setApprovedMin(r.requestedMinutes); setApproveRem(''); }}>Approve</Button>
        <Button size="sm" variant="ghost" icon={<XCircle size={13}/>} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" loading={rejectM.isPending} onClick={() => rejectM.mutate({ id: r.id, remarks: 'Rejected' })}>Reject</Button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <PageHeader title="Overtime" subtitle="Review and approve overtime requests" icon={<Timer size={20}/>} />
      <div className="flex gap-2 mb-4">
        {['','PENDING','APPROVED','REJECTED','MODIFIED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); goToPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===s ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{s||'All'}</button>
        ))}
      </div>
      <DataTable columns={columns} data={records} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={r => r.id} emptyMessage="No overtime requests" />
      <Modal isOpen={!!approveRec} onClose={() => setApproveRec(null)} title={`Approve OT — ${approveRec?.employeeName}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setApproveRec(null)}>Cancel</Button><Button loading={approveM.isPending} onClick={() => approveM.mutate({ id: approveRec!.id, data: { approvedMinutes: approvedMin, remarks: approveRem } })}>Approve</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm flex justify-between"><span className="text-gray-500">Requested</span><span className="font-semibold">{approveRec ? minutesToHours(approveRec.requestedMinutes) : ''}</span></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Approved Minutes *</label>
            <input type="number" value={approvedMin} onChange={e => setApprovedMin(Number(e.target.value))} min={1} max={approveRec?.requestedMinutes ?? 1440}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <p className="text-xs text-gray-400 mt-1">= {minutesToHours(approvedMin)}</p>
          </div>
          <Input label="Remarks" value={approveRem} onChange={e => setApproveRem(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
