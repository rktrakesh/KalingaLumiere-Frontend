import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, AlertTriangle, History, SlidersHorizontal } from 'lucide-react';
import { inventoryApi } from '@/services/api/inventory.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { Material, InventoryLedgerEntry } from '@/types';
import { formatNumber, formatDate } from '@/utils/format';

const matSchema = z.object({ name: z.string().min(1), unit: z.enum(['KG','GRAM','LITRE','PIECE','PACKET','BOX']), materialType: z.enum(['RAW_MATERIAL','FINISHED_GOODS','PACKAGING']), reorderLevel: z.coerce.number().min(0).optional() });
const adjSchema = z.object({ quantity: z.coerce.number().refine(v => v !== 0, 'Cannot be zero'), adjustmentDate: z.string().min(1), remarks: z.string().min(1), unitCost: z.coerce.number().optional() });
type MatForm = z.infer<typeof matSchema>;
type AdjForm = z.infer<typeof adjSchema>;

export default function InventoryPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [showCreate, setShowCreate] = useState(false);
  const [adjMat, setAdjMat] = useState<Material | null>(null);
  const [ledgerMat, setLedgerMat] = useState<Material | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['materials'], queryFn: () => inventoryApi.getMaterials() });
  const { data: lowData } = useQuery({ queryKey: ['low-stock'], queryFn: () => inventoryApi.getLowStock() });
  const { data: ledData, isLoading: ledLoading } = useQuery({ queryKey: ['inv-ledger', ledgerMat?.id, page], queryFn: () => inventoryApi.getLedger(ledgerMat!.id, { page, size }), enabled: !!ledgerMat });

  const allMats: Material[] = data?.data?.data ?? [];
  const lowStock: Material[] = lowData?.data?.data ?? [];
  const ledPage = ledData?.data?.data;
  const ledEntries: InventoryLedgerEntry[] = ledPage?.content ?? [];
  const mats = typeFilter ? allMats.filter(m => m.materialType === typeFilter) : allMats;

  const matForm = useForm<MatForm>({ resolver: zodResolver(matSchema), defaultValues: { unit: 'KG', materialType: 'RAW_MATERIAL' } });
  const adjForm = useForm<AdjForm>({ resolver: zodResolver(adjSchema) });

  const createM = useMutation({ mutationFn: (d: MatForm) => inventoryApi.createMaterial(d), onSuccess: () => { toast.success('Material created'); qc.invalidateQueries({ queryKey: ['materials'] }); setShowCreate(false); matForm.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const adjM    = useMutation({ mutationFn: (d: AdjForm) => inventoryApi.adjust({ ...d, materialId: adjMat!.id }), onSuccess: () => { toast.success('Stock adjusted'); qc.invalidateQueries({ queryKey: ['materials'] }); setAdjMat(null); adjForm.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Adjustment failed') });

  const columns: Column<Material>[] = [
    { key: 'code',    header: 'Code',    render: (m) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{m.materialCode}</span> },
    { key: 'name',    header: 'Material', render: (m) => <div><p className="font-medium">{m.name}</p>{m.lowStock && <Badge variant="warning" className="mt-0.5">Low Stock</Badge>}</div> },
    { key: 'type',    header: 'Type',    render: (m) => <Badge variant={m.materialType==='RAW_MATERIAL'?'info':m.materialType==='FINISHED_GOODS'?'success':'neutral'}>{m.materialType.replace('_',' ')}</Badge> },
    { key: 'stock',   header: 'Current Stock', render: (m) => <span className={`font-bold ${m.lowStock?'text-amber-500':'text-gray-900 dark:text-white'}`}>{formatNumber(m.currentStock??0)} {m.unit}</span> },
    { key: 'reorder', header: 'Reorder', render: (m) => `${m.reorderLevel} ${m.unit}` },
    { key: 'act',     header: 'Actions', render: (m) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<SlidersHorizontal size={13}/>} onClick={() => { setAdjMat(m); adjForm.reset({ adjustmentDate: new Date().toISOString().split('T')[0] }); }}>Adjust</Button>
        <Button size="sm" variant="ghost" icon={<History size={13}/>} onClick={() => { setLedgerMat(m); goToPage(0); }}>Ledger</Button>
      </div>
    )},
  ];

  const ledCols: Column<InventoryLedgerEntry>[] = [
    { key: 'date', header: 'Date',    render: (l) => formatDate(l.transactionDate) },
    { key: 'type', header: 'Type',    render: (l) => <Badge variant="info">{l.transactionType.replace(/_/g,' ')}</Badge> },
    { key: 'qty',  header: 'Qty',     render: (l) => <span className={l.quantity < 0 ? 'text-red-500' : 'text-emerald-600'}>{l.quantity > 0 ? '+' : ''}{l.quantity}</span> },
    { key: 'bal',  header: 'Balance', render: (l) => <span className="font-semibold">{l.balanceAfter}</span> },
    { key: 'rem',  header: 'Remarks', render: (l) => <span className="text-xs text-gray-500">{l.remarks ?? '—'}</span> },
    { key: 'by',   header: 'By',      accessor: 'createdBy' },
  ];

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${allMats.length} materials · ${lowStock.length} low stock alerts`} icon={<Package size={20}/>}
        actions={<div className="flex gap-2">{lowStock.length > 0 && <Button variant="outline" icon={<AlertTriangle size={15}/>} className="text-amber-600 border-amber-300">{lowStock.length} Low Stock</Button>}<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>Add Material</Button></div>} />
      <div className="flex gap-2 mb-4">
        {['','RAW_MATERIAL','FINISHED_GOODS','PACKAGING'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter===t?'bg-brand-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{t?t.replace('_',' '):'All'}</button>
        ))}
      </div>
      <DataTable columns={columns} data={mats} loading={isLoading} rowKey={m => m.id} emptyMessage="No materials found" />
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Material" size="sm"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={createM.isPending} onClick={matForm.handleSubmit(d => createM.mutate(d))}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Name *" error={matForm.formState.errors.name?.message} {...matForm.register('name')} />
          <Select label="Unit *" options={['KG','GRAM','LITRE','PIECE','PACKET','BOX'].map(u => ({ value: u, label: u }))} {...matForm.register('unit')} />
          <Select label="Type *" options={[{value:'RAW_MATERIAL',label:'Raw Material'},{value:'FINISHED_GOODS',label:'Finished Goods'},{value:'PACKAGING',label:'Packaging'}]} {...matForm.register('materialType')} />
          <Input label="Reorder Level" type="number" {...matForm.register('reorderLevel')} />
        </div>
      </Modal>
      <Modal isOpen={!!adjMat} onClose={() => setAdjMat(null)} title={`Adjust Stock — ${adjMat?.name}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setAdjMat(null)}>Cancel</Button><Button loading={adjM.isPending} onClick={adjForm.handleSubmit(d => adjM.mutate(d))}>Save</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm flex justify-between"><span className="text-gray-500">Current Stock</span><span className="font-bold">{formatNumber(adjMat?.currentStock??0)} {adjMat?.unit}</span></div>
          <Input label="Quantity * (negative to reduce)" type="number" error={adjForm.formState.errors.quantity?.message} placeholder="e.g. 100 or -50" {...adjForm.register('quantity')} />
          <Input label="Unit Cost (optional)" type="number" step="0.01" {...adjForm.register('unitCost')} />
          <Input label="Date *" type="date" error={adjForm.formState.errors.adjustmentDate?.message} {...adjForm.register('adjustmentDate')} />
          <Input label="Remarks *" error={adjForm.formState.errors.remarks?.message} {...adjForm.register('remarks')} />
        </div>
      </Modal>
      <Modal isOpen={!!ledgerMat} onClose={() => setLedgerMat(null)} title={`Stock Ledger — ${ledgerMat?.name}`} size="2xl" footer={<Button variant="outline" onClick={() => setLedgerMat(null)}>Close</Button>}>
        <DataTable columns={ledCols} data={ledEntries} loading={ledLoading} totalPages={ledPage?.totalPages} currentPage={page} totalElements={ledPage?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={l => l.id} emptyMessage="No ledger entries" />
      </Modal>
    </div>
  );
}
