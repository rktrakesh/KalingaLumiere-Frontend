import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, CreditCard, Eye } from 'lucide-react';
import { purchaseApi } from '@/services/api/purchase.api';
import { inventoryApi } from '@/services/api/inventory.api';
import { supplierApi } from '@/services/api/supplier.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { Purchase } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function PurchasePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [showCreate, setShowCreate] = useState(false);
  const [payPur, setPayPur] = useState<Purchase | null>(null);
  const [viewPur, setViewPur] = useState<Purchase | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState([{ materialId: '', quantity: '', unitRate: '' }]);
  const [form, setForm] = useState({ supplierId: '', purchaseDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [payForm, setPayForm] = useState({ paymentDate: new Date().toISOString().split('T')[0], amount: '', paymentMode: 'CASH', remarks: '' });

  const { data, isLoading } = useQuery({ queryKey: ['purchases', page, size, statusFilter], queryFn: () => purchaseApi.getAll({ page, size, status: statusFilter as any || undefined }) });
  const { data: matData } = useQuery({ queryKey: ['materials'], queryFn: () => inventoryApi.getMaterials() });
  const { data: supData } = useQuery({ queryKey: ['suppliers-all'], queryFn: () => supplierApi.getAll({ size: 100 }) });

  const pageData = data?.data?.data;
  const purchases: Purchase[] = pageData?.content ?? [];
  const materials = matData?.data?.data ?? [];
  const suppliers = supData?.data?.data?.content ?? [];

  const createM = useMutation({
    mutationFn: () => purchaseApi.create({ supplierId: Number(form.supplierId), purchaseDate: form.purchaseDate, remarks: form.remarks, items: items.filter(i => i.materialId && i.quantity && i.unitRate).map(i => ({ materialId: Number(i.materialId), quantity: Number(i.quantity), unitRate: Number(i.unitRate) })) }),
    onSuccess: () => { toast.success('Purchase created'); qc.invalidateQueries({ queryKey: ['purchases'] }); setShowCreate(false); setItems([{ materialId: '', quantity: '', unitRate: '' }]); setForm({ supplierId: '', purchaseDate: new Date().toISOString().split('T')[0], remarks: '' }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const payM = useMutation({
    mutationFn: () => purchaseApi.recordPayment(payPur!.id, { paymentDate: payForm.paymentDate, amount: Number(payForm.amount), paymentMode: payForm.paymentMode as 'CASH'|'BANK', remarks: payForm.remarks }),
    onSuccess: () => { toast.success('Payment recorded'); qc.invalidateQueries({ queryKey: ['purchases'] }); setPayPur(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const addItem = () => setItems(p => [...p, { materialId: '', quantity: '', unitRate: '' }]);
  const updateItem = (i: number, f: string, v: string) => setItems(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const columns: Column<Purchase>[] = [
    { key: 'ref',  header: 'Reference', render: (p) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{p.purchaseReference}</span> },
    { key: 'sup',  header: 'Supplier',  accessor: 'supplierName' },
    { key: 'date', header: 'Date',      render: (p) => formatDate(p.purchaseDate) },
    { key: 'tot',  header: 'Total',     render: (p) => formatCurrency(p.totalAmount) },
    { key: 'paid', header: 'Paid',      render: (p) => <span className="text-emerald-600">{formatCurrency(p.paidAmount)}</span> },
    { key: 'out',  header: 'Outstanding', render: (p) => p.outstandingAmount > 0 ? <span className="text-red-500 font-semibold">{formatCurrency(p.outstandingAmount)}</span> : <span className="text-gray-400">—</span> },
    { key: 'stat', header: 'Status',    render: (p) => <Badge variant={statusBadge(p.paymentStatus)}>{p.paymentStatus}</Badge> },
    { key: 'act',  header: 'Actions',   render: (p) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<Eye size={13}/>} onClick={() => setViewPur(p)}>View</Button>
        {p.paymentStatus !== 'PAID' && <Button size="sm" variant="ghost" icon={<CreditCard size={13}/>} onClick={() => { setPayPur(p); setPayForm({ paymentDate: new Date().toISOString().split('T')[0], amount: String(p.outstandingAmount), paymentMode: 'CASH', remarks: '' }); }}>Pay</Button>}
      </div>
    )},
  ];

  const matOpts = materials.map((m: any) => ({ value: String(m.id), label: `${m.name} (${m.unit})` }));
  const supOpts = suppliers.map((s: any) => ({ value: String(s.id), label: `${s.supplierCode} — ${s.name}` }));

  return (
    <div>
      <PageHeader title="Purchases" subtitle="Purchase orders and supplier payments" icon={<ShoppingCart size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>New Purchase</Button>} />
      <div className="flex gap-2 mb-4">
        {['','UNPAID','PARTIAL','PAID'].map(s => <button key={s} onClick={() => { setStatusFilter(s); goToPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===s?'bg-brand-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{s||'All'}</button>)}
      </div>
      <DataTable columns={columns} data={purchases} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={p => p.id} emptyMessage="No purchases found" />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Purchase Order" size="2xl"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={createM.isPending} onClick={() => createM.mutate()}>Create Purchase</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier *" value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} options={supOpts} placeholder="Select supplier" />
            <Input label="Date *" type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items *</label><Button size="sm" variant="outline" icon={<Plus size={13}/>} onClick={addItem}>Add Item</Button></div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5"><Select label="" value={item.materialId} onChange={e => updateItem(i, 'materialId', e.target.value)} options={matOpts} placeholder="Select material" /></div>
                <div className="col-span-3"><Input label="" type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" /></div>
                <div className="col-span-3"><Input label="" type="number" step="0.01" value={item.unitRate} onChange={e => updateItem(i, 'unitRate', e.target.value)} placeholder="Rate ₹" /></div>
                <div className="col-span-1">{items.length > 1 && <Button size="sm" variant="danger" onClick={() => setItems(p => p.filter((_,idx) => idx !== i))}>✕</Button>}</div>
              </div>
            ))}
          </div>
          <Input label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={!!payPur} onClose={() => setPayPur(null)} title={`Record Payment — ${payPur?.purchaseReference}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setPayPur(null)}>Cancel</Button><Button loading={payM.isPending} icon={<CreditCard size={14}/>} onClick={() => payM.mutate()}>Record Payment</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between text-sm"><span className="text-gray-500">Outstanding</span><span className="font-bold text-red-500">{formatCurrency(payPur?.outstandingAmount??0)}</span></div>
          <Input label="Date *" type="date" value={payForm.paymentDate} onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} />
          <Input label="Amount (₹) *" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          <Select label="Mode *" value={payForm.paymentMode} onChange={e => setPayForm(f => ({ ...f, paymentMode: e.target.value }))} options={[{value:'CASH',label:'Cash'},{value:'BANK',label:'Bank Transfer'}]} />
          <Input label="Remarks" value={payForm.remarks} onChange={e => setPayForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={!!viewPur} onClose={() => setViewPur(null)} title={`Purchase — ${viewPur?.purchaseReference}`} size="lg" footer={<Button variant="outline" onClick={() => setViewPur(null)}>Close</Button>}>
        {viewPur && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400">Supplier</p><p className="font-medium">{viewPur.supplierName}</p></div>
            <div><p className="text-gray-400">Date</p><p className="font-medium">{formatDate(viewPur.purchaseDate)}</p></div>
            <div><p className="text-gray-400">Total</p><p className="font-bold">{formatCurrency(viewPur.totalAmount)}</p></div>
            <div><p className="text-gray-400">Status</p><Badge variant={statusBadge(viewPur.paymentStatus)}>{viewPur.paymentStatus}</Badge></div>
          </div>
          <p className="text-sm font-semibold border-t dark:border-gray-700 pt-3">Items</p>
          <DataTable columns={[{key:'mat',header:'Material',accessor:'materialName'},{key:'qty',header:'Qty',render:(i:any)=>i.quantity},{key:'rate',header:'Rate',render:(i:any)=>formatCurrency(i.unitRate)},{key:'total',header:'Total',render:(i:any)=>formatCurrency(i.totalAmount)}]} data={viewPur.items} rowKey={(i:any) => i.id} />
        </div>}
      </Modal>
    </div>
  );
}
