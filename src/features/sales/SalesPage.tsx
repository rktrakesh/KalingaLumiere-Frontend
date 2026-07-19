import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Plus, CreditCard, Eye } from 'lucide-react';
import { salesApi } from '@/services/api/sales.api';
import { inventoryApi } from '@/services/api/inventory.api';
import { customerApi } from '@/services/api/customer.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { Sale } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function SalesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [showCreate, setShowCreate] = useState(false);
  const [paySale, setPaySale] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState([{ materialId: '', quantityKg: '', unitRate: '' }]);
  const [form, setForm] = useState({ customerId: '', invoiceDate: new Date().toISOString().split('T')[0], remarks: '' });
  const [payForm, setPayForm] = useState({ paymentDate: new Date().toISOString().split('T')[0], amount: '', paymentMode: 'CASH', remarks: '' });

  const { data, isLoading } = useQuery({ queryKey: ['sales', page, size, statusFilter], queryFn: () => salesApi.getAll({ page, size, status: statusFilter as any || undefined }) });
  const { data: matData } = useQuery({ queryKey: ['materials'], queryFn: () => inventoryApi.getMaterials() });
  const { data: custData } = useQuery({ queryKey: ['customers-all'], queryFn: () => customerApi.getAll({ size: 100 }) });

  const pageData = data?.data?.data;
  const sales: Sale[] = pageData?.content ?? [];
  const fgMats = (matData?.data?.data ?? []).filter((m: any) => m.materialType === 'FINISHED_GOODS');
  const customers = custData?.data?.data?.content ?? [];

  const createM = useMutation({
    mutationFn: () => salesApi.create({ customerId: Number(form.customerId), invoiceDate: form.invoiceDate, remarks: form.remarks, items: items.filter(i => i.materialId && i.quantityKg && i.unitRate).map(i => ({ materialId: Number(i.materialId), quantityKg: Number(i.quantityKg), unitRate: Number(i.unitRate) })) }),
    onSuccess: () => { toast.success('Invoice created'); qc.invalidateQueries({ queryKey: ['sales'] }); setShowCreate(false); setItems([{ materialId: '', quantityKg: '', unitRate: '' }]); setForm({ customerId: '', invoiceDate: new Date().toISOString().split('T')[0], remarks: '' }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const payM = useMutation({
    mutationFn: () => salesApi.recordPayment(paySale!.id, { paymentDate: payForm.paymentDate, amount: Number(payForm.amount), paymentMode: payForm.paymentMode as 'CASH'|'BANK', remarks: payForm.remarks }),
    onSuccess: () => { toast.success('Payment recorded'); qc.invalidateQueries({ queryKey: ['sales'] }); setPaySale(null); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const totalAmt = items.reduce((s, i) => s + (Number(i.quantityKg) * Number(i.unitRate) || 0), 0);
  const updateItem = (i: number, f: string, v: string) => setItems(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const columns: Column<Sale>[] = [
    { key: 'ref',  header: 'Invoice',     render: (s) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{s.invoiceReference}</span> },
    { key: 'cust', header: 'Customer',    accessor: 'customerName' },
    { key: 'date', header: 'Date',        render: (s) => formatDate(s.invoiceDate) },
    { key: 'due',  header: 'Due',         render: (s) => formatDate(s.dueDate) },
    { key: 'tot',  header: 'Total',       render: (s) => formatCurrency(s.totalAmount) },
    { key: 'paid', header: 'Paid',        render: (s) => <span className="text-emerald-600">{formatCurrency(s.paidAmount)}</span> },
    { key: 'out',  header: 'Outstanding', render: (s) => s.outstandingAmount > 0 ? <span className="text-red-500 font-semibold">{formatCurrency(s.outstandingAmount)}</span> : <span className="text-gray-400">—</span> },
    { key: 'stat', header: 'Status',      render: (s) => <Badge variant={statusBadge(s.paymentStatus)}>{s.paymentStatus}</Badge> },
    { key: 'act',  header: 'Actions',     render: (s) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<Eye size={13}/>} onClick={() => setViewSale(s)}>View</Button>
        {s.paymentStatus !== 'PAID' && <Button size="sm" variant="ghost" icon={<CreditCard size={13}/>} onClick={() => { setPaySale(s); setPayForm({ paymentDate: new Date().toISOString().split('T')[0], amount: String(s.outstandingAmount), paymentMode: 'CASH', remarks: '' }); }}>Collect</Button>}
      </div>
    )},
  ];

  const matOpts = fgMats.map((m: any) => ({ value: String(m.id), label: `${m.name} (${m.currentStock ?? 0} ${m.unit})` }));
  const custOpts = customers.map((c: any) => ({ value: String(c.id), label: `${c.customerCode} — ${c.name}` }));

  return (
    <div>
      <PageHeader title="Sales" subtitle="Wholesale invoices and customer collections" icon={<ShoppingBag size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>New Invoice</Button>} />
      <div className="flex gap-2 mb-4">
        {['','UNPAID','PARTIAL','PAID'].map(s => <button key={s} onClick={() => { setStatusFilter(s); goToPage(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===s?'bg-brand-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{s||'All'}</button>)}
      </div>
      <DataTable columns={columns} data={sales} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={s => s.id} emptyMessage="No sales invoices found" />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Sales Invoice" size="2xl"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><div className="flex items-center gap-3"><span className="text-sm font-semibold">Total: {formatCurrency(totalAmt)}</span><Button loading={createM.isPending} onClick={() => createM.mutate()}>Create Invoice</Button></div></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Customer *" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} options={custOpts} placeholder="Select customer" />
            <Input label="Invoice Date *" type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items (Finished Goods) *</label><Button size="sm" variant="outline" icon={<Plus size={13}/>} onClick={() => setItems(p => [...p, { materialId: '', quantityKg: '', unitRate: '' }])}>Add Item</Button></div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5"><Select label="" value={item.materialId} onChange={e => updateItem(i, 'materialId', e.target.value)} options={matOpts} placeholder="Select material" /></div>
                <div className="col-span-3"><Input label="" type="number" step="0.001" value={item.quantityKg} onChange={e => updateItem(i, 'quantityKg', e.target.value)} placeholder="Qty (KG)" /></div>
                <div className="col-span-3"><Input label="" type="number" step="0.01" value={item.unitRate} onChange={e => updateItem(i, 'unitRate', e.target.value)} placeholder="Rate ₹/KG" /></div>
                <div className="col-span-1">{items.length > 1 && <Button size="sm" variant="danger" onClick={() => setItems(p => p.filter((_,idx) => idx !== i))}>✕</Button>}</div>
              </div>
            ))}
          </div>
          <Input label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={!!paySale} onClose={() => setPaySale(null)} title={`Collect Payment — ${paySale?.invoiceReference}`} size="sm"
        footer={<><Button variant="outline" onClick={() => setPaySale(null)}>Cancel</Button><Button loading={payM.isPending} icon={<CreditCard size={14}/>} onClick={() => payM.mutate()}>Record Payment</Button></>}>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex justify-between text-sm"><span className="text-gray-500">Outstanding</span><span className="font-bold text-amber-500">{formatCurrency(paySale?.outstandingAmount??0)}</span></div>
          <Input label="Date *" type="date" value={payForm.paymentDate} onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} />
          <Input label="Amount (₹) *" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          <Select label="Mode *" value={payForm.paymentMode} onChange={e => setPayForm(f => ({ ...f, paymentMode: e.target.value }))} options={[{value:'CASH',label:'Cash'},{value:'BANK',label:'Bank Transfer'}]} />
          <Input label="Remarks" value={payForm.remarks} onChange={e => setPayForm(f => ({ ...f, remarks: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={!!viewSale} onClose={() => setViewSale(null)} title={`Invoice — ${viewSale?.invoiceReference}`} size="lg" footer={<Button variant="outline" onClick={() => setViewSale(null)}>Close</Button>}>
        {viewSale && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-400">Customer</p><p className="font-medium">{viewSale.customerName}</p></div>
            <div><p className="text-gray-400">Invoice Date</p><p className="font-medium">{formatDate(viewSale.invoiceDate)}</p></div>
            <div><p className="text-gray-400">Total</p><p className="font-bold text-lg">{formatCurrency(viewSale.totalAmount)}</p></div>
            <div><p className="text-gray-400">Outstanding</p><p className="font-bold text-amber-500">{formatCurrency(viewSale.outstandingAmount)}</p></div>
          </div>
          <p className="text-sm font-semibold border-t dark:border-gray-700 pt-3">Line Items</p>
          <DataTable columns={[{key:'mat',header:'Material',accessor:'materialName'},{key:'qty',header:'Qty (KG)',render:(i:any)=>i.quantityKg},{key:'rate',header:'Rate/KG',render:(i:any)=>formatCurrency(i.unitRate)},{key:'tot',header:'Total',render:(i:any)=>formatCurrency(i.totalAmount)}]} data={viewSale.items} rowKey={(i:any) => i.id} />
        </div>}
      </Modal>
    </div>
  );
}
