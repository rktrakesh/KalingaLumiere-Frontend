import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Edit2 } from 'lucide-react';
import { supplierApi } from '@/services/api/supplier.api';
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
import { Supplier } from '@/types';
import { formatCurrency } from '@/utils/format';

const schema = z.object({ name: z.string().min(1), phone: z.string().optional(), address: z.string().optional(), materialsSupplied: z.string().optional() });
type FormData = z.infer<typeof schema>;

export default function SupplierPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const dSearch = useDebounce(search);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data, isLoading } = useQuery({ queryKey: ['suppliers', page, size, dSearch], queryFn: () => supplierApi.getAll({ page, size, search: dSearch || undefined }) });
  const pageData = data?.data?.data;
  const suppliers: Supplier[] = pageData?.content ?? [];

  const createM = useMutation({ mutationFn: (d: FormData) => supplierApi.create(d), onSuccess: () => { toast.success('Created'); qc.invalidateQueries({ queryKey: ['suppliers'] }); setShowCreate(false); form.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: number; data: FormData }) => supplierApi.update(id, data), onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['suppliers'] }); setEditItem(null); form.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });

  const openEdit = (s: Supplier) => { setEditItem(s); form.reset({ name: s.name, phone: s.phone ?? '', address: s.address ?? '', materialsSupplied: s.materialsSupplied ?? '' }); };
  const isEdit = !!editItem;

  const columns: Column<Supplier>[] = [
    { key: 'code', header: 'Code',      render: (s) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{s.supplierCode}</span> },
    { key: 'name', header: 'Name',      render: (s) => <p className="font-medium">{s.name}</p> },
    { key: 'phone',header: 'Phone',     render: (s) => s.phone ?? '—' },
    { key: 'mats', header: 'Materials', render: (s) => <span className="text-xs text-gray-500 truncate max-w-xs block">{s.materialsSupplied ?? '—'}</span> },
    { key: 'out',  header: 'Outstanding',render: (s) => s.outstandingPayable ? <span className="font-semibold text-red-500">{formatCurrency(s.outstandingPayable)}</span> : '—' },
    { key: 'act',  header: 'Actions',   render: (s) => <Button size="sm" variant="ghost" icon={<Edit2 size={13}/>} onClick={() => openEdit(s)}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Suppliers" subtitle={`${pageData?.totalElements ?? 0} suppliers`} icon={<Building2 size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => { setShowCreate(true); form.reset(); }}>Add Supplier</Button>} />
      <SearchFilter search={search} onSearchChange={v => { setSearch(v); goToPage(0); }} placeholder="Search suppliers…" />
      <DataTable columns={columns} data={suppliers} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={s => s.id} emptyMessage="No suppliers found" />
      <Modal isOpen={showCreate || isEdit} onClose={() => { setShowCreate(false); setEditItem(null); form.reset(); }} title={isEdit ? `Edit — ${editItem?.name}` : 'Add Supplier'} size="sm"
        footer={<><Button variant="outline" onClick={() => { setShowCreate(false); setEditItem(null); }}>Cancel</Button><Button loading={createM.isPending || updateM.isPending} onClick={form.handleSubmit(d => isEdit ? updateM.mutate({ id: editItem!.id, data: d }) : createM.mutate(d))}>{isEdit ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-4">
          <Input label="Name *" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label="Phone" {...form.register('phone')} />
          <Textarea label="Address" {...form.register('address')} />
          <Textarea label="Materials Supplied" placeholder="e.g. Bamboo Sticks, Charcoal" {...form.register('materialsSupplied')} />
        </div>
      </Modal>
    </div>
  );
}
