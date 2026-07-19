import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Factory, Plus, CheckCircle, Eye } from 'lucide-react';
import { productionApi } from '@/services/api/production.api';
import { inventoryApi } from '@/services/api/inventory.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { ProductionBatch } from '@/types';
import { formatDate, formatNumber } from '@/utils/format';

export default function ProductionPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [completeBatch, setCompleteBatch] = useState<ProductionBatch | null>(null);
  const [viewBatch, setViewBatch] = useState<ProductionBatch | null>(null);
  const [inputs, setInputs] = useState([{ materialId: '', quantityUsed: '' }]);
  const [outputs, setOutputs] = useState([{ materialId: '', finishedQuantity: '', wasteQuantity: '' }]);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [cRemarks, setCRemarks] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['production', page, size, statusFilter], queryFn: () => productionApi.getAll({ page, size, status: statusFilter || undefined }) });
  const { data: matData } = useQuery({ queryKey: ['materials'], queryFn: () => inventoryApi.getMaterials() });
  const pageData = data?.data?.data;
  const batches: ProductionBatch[] = pageData?.content ?? [];
  const allMats = matData?.data?.data ?? [];
  const rawMats = allMats.filter((m: any) => m.materialType === 'RAW_MATERIAL');
  const fgMats  = allMats.filter((m: any) => m.materialType === 'FINISHED_GOODS');

  const createM = useMutation({
    mutationFn: () => productionApi.create({ batchDate, remarks, inputs: inputs.filter(i => i.materialId && i.quantityUsed).map(i => ({ materialId: Number(i.materialId), quantityUsed: Number(i.quantityUsed) })) }),
    onSuccess: () => { toast.success('Batch created'); qc.invalidateQueries({ queryKey: ['production'] }); setShowCreate(false); setInputs([{ materialId: '', quantityUsed: '' }]); setRemarks(''); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const completeM = useMutation({
    mutationFn: () => productionApi.complete(completeBatch!.id, { remarks: cRemarks, outputs: outputs.filter(o => o.materialId && o.finishedQuantity).map(o => ({ materialId: Number(o.materialId), finishedQuantity: Number(o.finishedQuantity), wasteQuantity: Number(o.wasteQuantity || 0) })) }),
    onSuccess: () => { toast.success('Batch completed'); qc.invalidateQueries({ queryKey: ['production'] }); setCompleteBatch(null); setOutputs([{ materialId: '', finishedQuantity: '', wasteQuantity: '' }]); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const upInp = (i: number, f: string, v: string) => setInputs(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const upOut = (i: number, f: string, v: string) => setOutputs(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const columns: Column<ProductionBatch>[] = [
    { key: 'batch', header: 'Batch No.',  render: (b) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{b.batchNumber}</span> },
    { key: 'date',  header: 'Date',       render: (b) => formatDate(b.batchDate) },
    { key: 'mgr',   header: 'Manager',    render: (b) => b.managerName ?? '—' },
    { key: 'inp',   header: 'Inputs',     render: (b) => `${b.inputs.length} material(s)` },
    { key: 'out',   header: 'Output',     render: (b) => b.status === 'COMPLETED' && b.outputs[0] ? <span className="font-semibold text-emerald-600">{formatNumber(b.outputs[0].finishedQuantity)} KG</span> : '—' },
    { key: 'eff',   header: 'Efficiency', render: (b) => b.outputs[0]?.efficiencyPercent ? `${b.outputs[0].efficiencyPercent}%` : '—' },
    { key: 'stat',  header: 'Status',     render: (b) => <Badge variant={statusBadge(b.status)}>{b.status.replace('_',' ')}</Badge> },
    { key: 'act',   header: 'Actions',    render: (b) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<Eye size={13}/>} onClick={() => setViewBatch(b)}>View</Button>
        {b.status === 'IN_PROGRESS' && <Button size="sm" variant="ghost" icon={<CheckCircle size={13}/>} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => { setCompleteBatch(b); setOutputs([{ materialId: '', finishedQuantity: '', wasteQuantity: '' }]); }}>Complete</Button>}
      </div>
    )},
  ];

  const rawOpts = rawMats.map((m: any) => ({ value: String(m.id), label: `${m.name} (${formatNumber(m.currentStock??0)} ${m.unit})` }));
  const fgOpts  = fgMats.map((m: any) => ({ value: String(m.id), label: m.name }));

  return (
    <div>
      <PageHeader title="Production" subtitle="Manage production batches" icon={<Factory size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>New Batch</Button>} />
      <div className="flex gap-2 mb-4">
        {['','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <button key={s} onClick={() => { setStatusFilter(s); goToPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===s?'bg-brand-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{s?s.replace('_',' '):'All'}</button>)}
      </div>
      <DataTable columns={columns} data={batches} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={b => b.id} emptyMessage="No production batches found" />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Production Batch" size="lg"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={createM.isPending} onClick={() => createM.mutate()}>Create Batch</Button></>}>
        <div className="space-y-4">
          <Input label="Batch Date *" type="date" value={batchDate} onChange={e => setBatchDate(e.target.value)} />
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Materials *</label><Button size="sm" variant="outline" icon={<Plus size={13}/>} onClick={() => setInputs(p => [...p, { materialId: '', quantityUsed: '' }])}>Add</Button></div>
            {inputs.map((inp, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-7"><Select label="" value={inp.materialId} onChange={e => upInp(i, 'materialId', e.target.value)} options={rawOpts} placeholder="Select raw material" /></div>
                <div className="col-span-4"><Input label="" type="number" step="0.001" value={inp.quantityUsed} onChange={e => upInp(i, 'quantityUsed', e.target.value)} placeholder="Quantity" /></div>
                <div className="col-span-1">{inputs.length > 1 && <Button size="sm" variant="danger" onClick={() => setInputs(p => p.filter((_,idx) => idx !== i))}>✕</Button>}</div>
              </div>
            ))}
          </div>
          <Input label="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
        </div>
      </Modal>

      <Modal isOpen={!!completeBatch} onClose={() => setCompleteBatch(null)} title={`Complete Batch — ${completeBatch?.batchNumber}`} size="lg"
        footer={<><Button variant="outline" onClick={() => setCompleteBatch(null)}>Cancel</Button><Button loading={completeM.isPending} icon={<CheckCircle size={14}/>} onClick={() => completeM.mutate()}>Mark Complete</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Input Summary</p>
            {completeBatch?.inputs.map((inp, i) => <p key={i} className="text-blue-600 dark:text-blue-400">{inp.materialName}: {inp.quantityUsed}</p>)}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output (Finished Goods) *</label><Button size="sm" variant="outline" icon={<Plus size={13}/>} onClick={() => setOutputs(p => [...p, { materialId: '', finishedQuantity: '', wasteQuantity: '' }])}>Add</Button></div>
            {outputs.map((out, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5"><Select label="" value={out.materialId} onChange={e => upOut(i, 'materialId', e.target.value)} options={fgOpts} placeholder="Finished good" /></div>
                <div className="col-span-3"><Input label="" type="number" step="0.001" value={out.finishedQuantity} onChange={e => upOut(i, 'finishedQuantity', e.target.value)} placeholder="Finished Qty" /></div>
                <div className="col-span-3"><Input label="" type="number" step="0.001" value={out.wasteQuantity} onChange={e => upOut(i, 'wasteQuantity', e.target.value)} placeholder="Waste Qty" /></div>
                <div className="col-span-1">{outputs.length > 1 && <Button size="sm" variant="danger" onClick={() => setOutputs(p => p.filter((_,idx) => idx !== i))}>✕</Button>}</div>
              </div>
            ))}
          </div>
          <Input label="Remarks" value={cRemarks} onChange={e => setCRemarks(e.target.value)} />
        </div>
      </Modal>

      <Modal isOpen={!!viewBatch} onClose={() => setViewBatch(null)} title={`Batch — ${viewBatch?.batchNumber}`} size="lg" footer={<Button variant="outline" onClick={() => setViewBatch(null)}>Close</Button>}>
        {viewBatch && <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-gray-400">Date</p><p className="font-medium">{formatDate(viewBatch.batchDate)}</p></div>
            <div><p className="text-gray-400">Manager</p><p className="font-medium">{viewBatch.managerName ?? '—'}</p></div>
            <div><p className="text-gray-400">Status</p><Badge variant={statusBadge(viewBatch.status)}>{viewBatch.status.replace('_',' ')}</Badge></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm font-semibold mb-2">Inputs</p>{viewBatch.inputs.map((inp, i) => <div key={i} className="flex justify-between text-sm py-1 border-b dark:border-gray-700"><span>{inp.materialName}</span><span className="font-medium">{inp.quantityUsed}</span></div>)}</div>
            {viewBatch.status === 'COMPLETED' && <div><p className="text-sm font-semibold mb-2">Outputs</p>{viewBatch.outputs.map((out, i) => <div key={i} className="text-sm py-1 border-b dark:border-gray-700 space-y-0.5"><div className="flex justify-between"><span>{out.materialName}</span><span className="font-medium text-emerald-600">{formatNumber(out.finishedQuantity)} KG</span></div><div className="flex justify-between text-xs text-gray-400"><span>Waste</span><span>{out.wasteQuantity} KG</span></div><div className="flex justify-between text-xs text-gray-400"><span>Efficiency</span><span className="font-semibold text-brand-600">{out.efficiencyPercent}%</span></div></div>)}</div>}
          </div>
        </div>}
      </Modal>
    </div>
  );
}
