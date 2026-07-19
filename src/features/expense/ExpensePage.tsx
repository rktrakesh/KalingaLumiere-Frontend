import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Receipt, Plus, CheckCircle, XCircle } from 'lucide-react';
import { expenseApi } from '@/services/api/expense.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchFilter } from '@/components/common/SearchFilter';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { usePagination } from '@/hooks/usePagination';
import { Expense, ExpenseCategory } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

const schema = z.object({ expenseDate: z.string().min(1), amount: z.coerce.number().positive(), category: z.enum(['RAW_MATERIAL','SALARY','ELECTRICITY','RENT','TRANSPORT','PACKAGING','MAINTENANCE','MISCELLANEOUS']), remarks: z.string().optional() });
type FormData = z.infer<typeof schema>;

const CATS: { value: ExpenseCategory; label: string }[] = [
  {value:'RAW_MATERIAL',label:'Raw Material'},{value:'SALARY',label:'Salary'},{value:'ELECTRICITY',label:'Electricity'},
  {value:'RENT',label:'Rent'},{value:'TRANSPORT',label:'Transport'},{value:'PACKAGING',label:'Packaging'},
  {value:'MAINTENANCE',label:'Maintenance'},{value:'MISCELLANEOUS',label:'Miscellaneous'},
];

export default function ExpensePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { page, size, goToPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { category: 'MISCELLANEOUS' } });

  const { data, isLoading } = useQuery({ queryKey: ['expenses', page, size, statusFilter, catFilter], queryFn: () => expenseApi.getAll({ page, size, status: statusFilter as any || undefined, category: catFilter as any || undefined }) });
  const pageData = data?.data?.data;
  const expenses: Expense[] = pageData?.content ?? [];

  const createM  = useMutation({ mutationFn: (d: FormData) => expenseApi.create(d), onSuccess: () => { toast.success('Created'); qc.invalidateQueries({ queryKey: ['expenses'] }); setShowCreate(false); form.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const approveM = useMutation({ mutationFn: (id: number) => expenseApi.approve(id), onSuccess: () => { toast.success('Approved'); qc.invalidateQueries({ queryKey: ['expenses'] }); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const cancelM  = useMutation({ mutationFn: (id: number) => expenseApi.cancel(id), onSuccess: () => { toast.success('Cancelled'); qc.invalidateQueries({ queryKey: ['expenses'] }); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });

  const columns: Column<Expense>[] = [
    { key: 'ref',  header: 'Reference', render: (e) => <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{e.expenseReference}</span> },
    { key: 'date', header: 'Date',      render: (e) => formatDate(e.expenseDate) },
    { key: 'cat',  header: 'Category',  render: (e) => <Badge variant="info">{e.category.replace('_',' ')}</Badge> },
    { key: 'amt',  header: 'Amount',    render: (e) => <span className="font-semibold">{formatCurrency(e.amount)}</span> },
    { key: 'rem',  header: 'Remarks',   render: (e) => <span className="text-sm text-gray-500 truncate max-w-xs block">{e.remarks ?? '—'}</span> },
    { key: 'stat', header: 'Status',    render: (e) => <Badge variant={statusBadge(e.status)}>{e.status}</Badge> },
    { key: 'by',   header: 'By',        render: (e) => e.approvedBy ?? '—' },
    { key: 'act',  header: 'Actions',   render: (e) => e.status === 'DRAFT' ? (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={<CheckCircle size={13}/>} className="text-emerald-600 hover:bg-emerald-50" loading={approveM.isPending} onClick={() => approveM.mutate(e.id)}>Approve</Button>
        <Button size="sm" variant="ghost" icon={<XCircle size={13}/>} className="text-red-600 hover:bg-red-50" onClick={() => cancelM.mutate(e.id)}>Cancel</Button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track and approve operational expenses" icon={<Receipt size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>Add Expense</Button>} />
      <SearchFilter search="" onSearchChange={() => {}}
        filters={[
          {key:'status',label:'All Status',value:statusFilter,onChange:v=>{setStatusFilter(v);goToPage(0);},options:[{value:'DRAFT',label:'Draft'},{value:'APPROVED',label:'Approved'},{value:'CANCELLED',label:'Cancelled'}]},
          {key:'cat',label:'All Categories',value:catFilter,onChange:v=>{setCatFilter(v);goToPage(0);},options:CATS as {value:string;label:string}[]},
        ]} />
      <DataTable columns={columns} data={expenses} loading={isLoading} totalPages={pageData?.totalPages} currentPage={page} totalElements={pageData?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={e => e.id} emptyMessage="No expenses found" />
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Expense" size="sm"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={createM.isPending} onClick={form.handleSubmit(d => createM.mutate(d))}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Date *" type="date" error={form.formState.errors.expenseDate?.message} {...form.register('expenseDate')} />
          <Input label="Amount (₹) *" type="number" error={form.formState.errors.amount?.message} {...form.register('amount')} />
          <Select label="Category *" options={CATS as {value:string;label:string}[]} error={form.formState.errors.category?.message} {...form.register('category')} />
          <Textarea label="Remarks" {...form.register('remarks')} />
        </div>
      </Modal>
    </div>
  );
}
