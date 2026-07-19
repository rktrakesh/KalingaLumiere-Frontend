import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCheck, Plus, Edit2, AlertTriangle } from 'lucide-react';
import { customerApi } from '@/services/api/customer.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilter } from '@/components/common/SearchFilter';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { Customer } from '@/types';
import { formatCurrency } from '@/utils/format';

const schema = z.object({ name: z.string().min(1), phone: z.string().optional(), address: z.string().optional(), gstNumber: z.string().optional(), creditDays: z.coerce.number().min(0).optional() });
type FormData = z.infer<typeof schema>;

export default function CustomerPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [showOut, setShowOut] = useState(false);
  const dSearch = useDebounce(search);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({ queryKey: ['customers', page, size, dSearch], queryFn: () => customerApi.getAll({ page, size, search: dSearch || undefined }) });
  const { data: outData } = useQuery({ queryKey: ['customers-outstanding'], queryFn: () => customerApi.getOutstanding(), enabled: showOut });
  const pageData = data?.data?.data;
  const customers: Customer[] = pageData?.content ?? [];
  const outstanding: Customer[] = outData?.data?.data ?? [];

  const createM = useMutation({ mutationFn: (d: FormData) => customerApi.create(d), onSuccess: () => { toast.success('Created'); qc.invalidateQueries({ queryKey: ['customers'] }); setShowCreate(false); form.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: number; data: FormData }) => customerApi.update(id, data), onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['customers'] }); setEditItem(null); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });

  const openEdit = (c: Customer) => { setEditItem(c); form.reset({ name: c.name, phone: c.phone ?? '', address: c.address ?? '', gstNumber: c.gstNumber ?? '', creditDays: c.creditDays }); };
  const isEdit = !!editItem;

  const columns: Column<Customer>[] = [
    { key: 'code',  header: 'Code',        render: (c) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{c.customerCode}</span> },
    { key: 'name',  header: 'Name',        render: (c) => <p className="font-medium">{c.name}</p> },
    { key: 'phone', header: 'Phone',       render: (c) => c.phone ?? '—' },
    { key: 'gst',   header: 'GST',         render: (c) => <span className="font-mono text-xs">{c.gstNumber ?? '—'}</span> },
    { key: 'credit',header: 'Credit Days', render: (c) => `${c.creditDays}d`, className: 'text-center' },
    { key: 'out',   header: 'Outstanding', render: (c) => c.outstandingReceivable && c.outstandingReceivable > 0 ? <span className="font-semibold text-amber-500">{formatCurrency(c.outstandingReceivable)}</span> : '—' },
    { key: 'act',   header: 'Actions',     render: (c) => <Button size="sm" variant="ghost" icon={<Edit2 size={13}/>} onClick={() => openEdit(c)}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${pageData?.totalElements ?? 0} customers`} icon={<UserCheck size={20}/>}
        actions={<div className="flex gap-2"><Button variant="outline" icon={<AlertTriangle size={15}/>} onClick={() => setShowOut(true)}>Outstanding</Button><Button icon={<Plus size={15}/>} onClick={() => { setShowCreate(true); form.reset(); }}>Add Customer</Button></div>} />
      <SearchFilter search={search} onSearchChange={v => { setSearch(v); goToPage(0); }} placeholder="Search customers…" />
      <DataTable columns={columns} data={customers} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={c => c.id} emptyMessage="No customers found" />
      <Modal isOpen={showCreate || isEdit} onClose={() => { setShowCreate(false); setEditItem(null); form.reset(); }} title={isEdit ? `Edit — ${editItem?.name}` : 'Add Customer'} size="sm"
        footer={<><Button variant="outline" onClick={() => { setShowCreate(false); setEditItem(null); }}>Cancel</Button><Button loading={createM.isPending || updateM.isPending} onClick={form.handleSubmit(d => isEdit ? updateM.mutate({ id: editItem!.id, data: d }) : createM.mutate(d))}>{isEdit ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <Input label="Name *" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Phone" {...form.register('phone')} />
          <Input label="GST Number" {...form.register('gstNumber')} />
          <Input label="Credit Days" type="number" {...form.register('creditDays')} />
          <Textarea label="Address" {...form.register('address')} />
        </div>
      </Modal>
      <Modal isOpen={showOut} onClose={() => setShowOut(false)} title="Customer Outstanding" size="lg" footer={<Button variant="outline" onClick={() => setShowOut(false)}>Close</Button>}>
        <DataTable columns={[
          { key: 'code', header: 'Code',    render: (c: Customer) => <span className="font-mono text-xs">{c.customerCode}</span> },
          { key: 'name', header: 'Customer', accessor: 'name' as keyof Customer },
          { key: 'amt',  header: 'Outstanding', render: (c: Customer) => <span className="font-bold text-amber-500">{formatCurrency(c.outstandingReceivable ?? 0)}</span> },
        ]} data={outstanding} rowKey={(c: Customer) => c.id} emptyMessage="No outstanding balances" />
      </Modal>
    </div>
  );
}
