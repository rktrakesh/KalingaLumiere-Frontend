import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, Unlock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { monthClosingApi } from '@/services/api/monthclosing.api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/common/DataTable';
import { useToast } from '@/hooks/useToast';
import { MonthClosing } from '@/types';
import { MONTHS, currentYear, currentMonth, formatDateTime } from '@/utils/format';

export default function MonthClosingPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [year, setYear]   = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [showClose, setShowClose]   = useState(false);
  const [showReopen, setShowReopen] = useState(false);
  const [reopenRemarks, setReopenRemarks] = useState('');

  const { data: statusData } = useQuery({ queryKey: ['mc-status', year, month], queryFn: () => monthClosingApi.getStatus(year, month) });
  const { data: checkData,  isLoading: checkLoading } = useQuery({ queryKey: ['mc-check', year, month], queryFn: () => monthClosingApi.preCheck(year, month) });
  const { data: histData }  = useQuery({ queryKey: ['mc-history'], queryFn: () => monthClosingApi.getHistory() });

  const status = statusData?.data?.data;
  const check  = checkData?.data?.data;
  const history: MonthClosing[] = histData?.data?.data ?? [];
  const isClosed = status?.status === 'CLOSED';

  const closeM = useMutation({
    mutationFn: () => monthClosingApi.close({ year, month }),
    onSuccess: () => { toast.success(`${MONTHS[month-1]} ${year} closed`); qc.invalidateQueries({ queryKey: ['mc'] }); setShowClose(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Close failed'),
  });
  const reopenM = useMutation({
    mutationFn: () => monthClosingApi.reopen({ year, month, remarks: reopenRemarks }),
    onSuccess: () => { toast.success(`${MONTHS[month-1]} ${year} reopened`); qc.invalidateQueries({ queryKey: ['mc'] }); setShowReopen(false); setReopenRemarks(''); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Reopen failed'),
  });

  const yOpts = [currentYear()-1, currentYear()].map(y => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m,i) => ({ value: String(i+1), label: m }));

  const histCols: Column<MonthClosing>[] = [
    { key: 'period',  header: 'Period',    render: (h) => `${MONTHS[h.month-1]} ${h.year}` },
    { key: 'status',  header: 'Status',    render: (h) => <Badge variant={h.status==='CLOSED'?'neutral':'success'}>{h.status}</Badge> },
    { key: 'closedBy',header: 'Closed By', render: (h) => h.closedBy ?? '—' },
    { key: 'closedOn',header: 'Closed On', render: (h) => h.closedDate ? formatDateTime(h.closedDate) : '—' },
    { key: 'reopened',header: 'Reopened',  render: (h) => h.reopenedBy ? <div><p>{h.reopenedBy}</p><p className="text-xs text-gray-400">{h.reopenedDate ? formatDateTime(h.reopenedDate) : ''}</p></div> : '—' },
    { key: 'remarks', header: 'Remarks',   render: (h) => <span className="text-xs text-gray-500">{h.reopenRemarks ?? '—'}</span> },
  ];

  return (
    <div>
      <PageHeader title="Month Closing" subtitle="Lock or unlock monthly periods" icon={<Lock size={20}/>} />
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-gray-500">Select Period:</span>
        <div className="w-28"><Select label="" value={String(year)} onChange={e => setYear(Number(e.target.value))} options={yOpts} /></div>
        <div className="w-36"><Select label="" value={String(month)} onChange={e => setMonth(Number(e.target.value))} options={mOpts} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card padding="md">
          <CardHeader>
            <CardTitle>Period Status</CardTitle>
            <Badge variant={isClosed ? 'neutral' : 'success'}>{status?.status ?? 'OPEN'}</Badge>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Period</span><span className="font-semibold">{MONTHS[month-1]} {year}</span></div>
            {isClosed && <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Closed By</span><span className="font-medium">{status?.closedBy ?? '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Closed On</span><span className="font-medium">{status?.closedDate ? formatDateTime(status.closedDate) : '—'}</span></div>
            </>}
            <div className="pt-3 flex gap-2">
              {!isClosed
                ? <Button icon={<Lock size={14}/>} onClick={() => setShowClose(true)} disabled={!check?.canClose}>Close Month</Button>
                : <Button variant="outline" icon={<Unlock size={14}/>} onClick={() => setShowReopen(true)}>Reopen Month</Button>}
            </div>
          </div>
        </Card>

        <Card padding="md">
          <CardHeader><CardTitle>Pre-Close Validation</CardTitle></CardHeader>
          {checkLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div>
          ) : check ? (
            <div className="space-y-2.5">
              {[
                { label: 'Payroll Generated',    ok: check.payrollGenerated },
                { label: 'No Pending Checkouts', ok: check.pendingCheckouts === 0, detail: check.pendingCheckouts > 0 ? `${check.pendingCheckouts} pending` : undefined },
                { label: 'No Pending Overtime',  ok: check.pendingOvertime === 0,  detail: check.pendingOvertime > 0  ? `${check.pendingOvertime} pending`  : undefined },
                { label: 'All Clear to Close',   ok: check.canClose },
              ].map(({ label, ok, detail }) => (
                <div key={label} className={`flex items-center justify-between p-2.5 rounded-lg ${ok ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                  <div className="flex items-center gap-2">
                    {ok ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" /> : <XCircle size={15} className="text-red-500 flex-shrink-0" />}
                    <span className={`text-sm font-medium ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>{label}</span>
                  </div>
                  {detail && <span className="text-xs text-red-500">{detail}</span>}
                </div>
              ))}
              {check.blockers.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> Blockers:</p>
                  {check.blockers.map((b,i) => <p key={i} className="text-xs text-amber-600 dark:text-amber-400 ml-4">• {b}</p>)}
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>

      <Card padding="md">
        <CardHeader><CardTitle>Closing History</CardTitle></CardHeader>
        <DataTable columns={histCols} data={history} rowKey={h => `${h.year}-${h.month}`} emptyMessage="No closing history" />
      </Card>

      <Modal isOpen={showClose} onClose={() => setShowClose(false)} title={`Close ${MONTHS[month-1]} ${year}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setShowClose(false)}>Cancel</Button><Button variant="danger" loading={closeM.isPending} icon={<Lock size={14}/>} onClick={() => closeM.mutate()}>Confirm Close</Button></>}>
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0"><Lock size={18} className="text-amber-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Close {MONTHS[month-1]} {year}?</p><p className="text-sm text-gray-500 mt-1">This will lock attendance, payroll, expenses and inventory for this period. Only Admin can reopen.</p></div>
        </div>
      </Modal>

      <Modal isOpen={showReopen} onClose={() => setShowReopen(false)} title={`Reopen ${MONTHS[month-1]} ${year}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setShowReopen(false)}>Cancel</Button><Button loading={reopenM.isPending} icon={<Unlock size={14}/>} disabled={!reopenRemarks.trim()} onClick={() => reopenM.mutate()}>Reopen Month</Button></>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Provide a reason for reopening this closed month.</p>
          <Input label="Remarks *" value={reopenRemarks} onChange={e => setReopenRemarks(e.target.value)} placeholder="e.g. Attendance correction required" />
        </div>
      </Modal>
    </div>
  );
}
