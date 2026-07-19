import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Play, RefreshCw, Eye } from 'lucide-react';
import { payrollApi } from '@/services/api/payroll.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { PayrollRun, PayrollDetail } from '@/types';
import { formatCurrency, formatDate, MONTHS, currentYear, currentMonth } from '@/utils/format';

export default function PayrollPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [showGen, setShowGen] = useState(false);
  const [detailRun, setDetailRun] = useState<PayrollRun | null>(null);
  const [genYear, setGenYear] = useState(currentYear());
  const [genMonth, setGenMonth] = useState(currentMonth() - 1 || 12);
  const [genRemarks, setGenRemarks] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['payroll-runs'], queryFn: () => payrollApi.getAll() });
  const { data: detData, isLoading: detLoading } = useQuery({ queryKey: ['payroll-details', detailRun?.id], queryFn: () => payrollApi.getDetails(detailRun!.id), enabled: !!detailRun });
  const runs: PayrollRun[] = data?.data?.data ?? [];
  const details: PayrollDetail[] = detData?.data?.data ?? [];

  const genM = useMutation({
    mutationFn: () => payrollApi.generate({ year: genYear, month: genMonth, remarks: genRemarks }),
    onSuccess: (r) => { toast.success(`Payroll ${r.data.data.runReference} generated`); qc.invalidateQueries({ queryKey: ['payroll-runs'] }); setShowGen(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const regenM = useMutation({
    mutationFn: (id: number) => payrollApi.regenerate(id),
    onSuccess: () => { toast.success('Regenerated'); qc.invalidateQueries({ queryKey: ['payroll-runs'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const runCols: Column<PayrollRun>[] = [
    { key: 'ref',    header: 'Reference',   render: (r) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{r.runReference}</span> },
    { key: 'period', header: 'Period',       render: (r) => `${MONTHS[r.month-1]} ${r.year}` },
    { key: 'emps',   header: 'Employees',    render: (r) => r.totalEmployees ?? '—', className: 'text-center' },
    { key: 'gross',  header: 'Total Gross',  render: (r) => r.totalGross ? formatCurrency(r.totalGross) : '—' },
    { key: 'net',    header: 'Total Net',    render: (r) => r.totalNet ? <span className="font-bold text-emerald-600">{formatCurrency(r.totalNet)}</span> : '—' },
    { key: 'stat',   header: 'Status',       render: (r) => <Badge variant={statusBadge(r.status)}>{r.status}</Badge> },
    { key: 'genBy',  header: 'By',           render: (r) => <div><p>{r.generatedBy}</p><p className="text-xs text-gray-400">{formatDate(r.generatedDate)}</p></div> },
    { key: 'act',    header: 'Actions',      render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<Eye size={13}/>} onClick={() => setDetailRun(r)}>Details</Button>
        {r.status !== 'LOCKED' && <Button size="sm" variant="ghost" icon={<RefreshCw size={13}/>} loading={regenM.isPending} onClick={() => regenM.mutate(r.id)}>Regen</Button>}
      </div>
    )},
  ];

  const detCols: Column<PayrollDetail>[] = [
    { key: 'emp',    header: 'Employee', render: (d) => <div><p className="font-medium">{d.employeeName}</p><p className="text-xs font-mono text-gray-400">{d.employeeCode}</p></div> },
    { key: 'base',   header: 'Base',     render: (d) => formatCurrency(d.baseSalary) },
    { key: 'gross',  header: 'Gross',    render: (d) => formatCurrency(d.grossSalary) },
    { key: 'ded',    header: 'Deductions', render: (d) => d.totalDeductions > 0 ? <span className="text-red-500">-{formatCurrency(d.totalDeductions)}</span> : '—' },
    { key: 'net',    header: 'Net',      render: (d) => <span className="font-bold text-emerald-600">{formatCurrency(d.netSalary)}</span> },
    { key: 'capped', header: 'Capped',   render: (d) => d.salaryCapped ? <Badge variant="warning">Yes</Badge> : <Badge variant="neutral">No</Badge> },
    { key: 'ot',     header: 'OT',       render: (d) => d.overtimeMinutes > 0 ? `${d.overtimeMinutes}m` : '—', className: 'text-center' },
    { key: 'pay',    header: 'Payment',  render: (d) => <Badge variant={d.paymentStatus==='PAID'?'success':'warning'}>{d.paymentStatus}</Badge> },
  ];

  const yOpts = [currentYear()-1, currentYear()].map(y => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m, i) => ({ value: String(i+1), label: m }));

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Generate and manage monthly payroll runs" icon={<DollarSign size={20}/>}
        actions={<Button icon={<Play size={15}/>} onClick={() => setShowGen(true)}>Generate Payroll</Button>} />
      {runs.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[{label:'Total Employees',value:String(runs[0]?.totalEmployees??0)},{label:'Total Gross',value:formatCurrency(runs[0]?.totalGross??0)},{label:'Total Net Payout',value:formatCurrency(runs[0]?.totalNet??0)}].map((s,i) => (
            <Card key={i} padding="md"><p className="text-xs text-gray-400 mb-1">{s.label} (Latest)</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></Card>
          ))}
        </div>
      )}
      <DataTable columns={runCols} data={runs} loading={isLoading} rowKey={r => r.id} emptyMessage="No payroll runs yet" />
      <Modal isOpen={showGen} onClose={() => setShowGen(false)} title="Generate Payroll" size="sm"
        footer={<><Button variant="outline" onClick={() => setShowGen(false)}>Cancel</Button><Button loading={genM.isPending} icon={<Play size={14}/>} onClick={() => genM.mutate()}>Generate</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Payroll should be generated after the month ends.</div>
          <Select label="Year *" value={String(genYear)} onChange={e => setGenYear(Number(e.target.value))} options={yOpts} />
          <Select label="Month *" value={String(genMonth)} onChange={e => setGenMonth(Number(e.target.value))} options={mOpts} />
          <Input label="Remarks" value={genRemarks} onChange={e => setGenRemarks(e.target.value)} />
        </div>
      </Modal>
      <Modal isOpen={!!detailRun} onClose={() => setDetailRun(null)} title={`Payroll Details — ${detailRun?.runReference}`} size="2xl"
        footer={<Button variant="outline" onClick={() => setDetailRun(null)}>Close</Button>}>
        <DataTable columns={detCols} data={details} loading={detLoading} rowKey={d => d.id} emptyMessage="No details" />
      </Modal>
    </div>
  );
}
