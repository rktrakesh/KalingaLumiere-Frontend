import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { holidayApi } from '@/services/api/holiday.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useToast } from '@/hooks/useToast';
import { Holiday } from '@/types';
import { formatDate, currentYear } from '@/utils/format';

const schema = z.object({ holidayDate: z.string().min(1), name: z.string().min(1), holidayType: z.enum(['FACTORY_HOLIDAY','NATIONAL_HOLIDAY']) });
type FormData = z.infer<typeof schema>;

export default function HolidayPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [year, setYear] = useState(currentYear());
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['holidays', year], queryFn: () => holidayApi.getByYear(year) });
  const holidays: Holiday[] = data?.data?.data ?? [];
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { holidayType: 'FACTORY_HOLIDAY' } });

  const createM = useMutation({ mutationFn: (d: FormData) => holidayApi.create(d), onSuccess: () => { toast.success('Holiday created'); qc.invalidateQueries({ queryKey: ['holidays'] }); setShowCreate(false); form.reset(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });
  const deleteM = useMutation({ mutationFn: (id: number) => holidayApi.delete(id), onSuccess: () => { toast.success('Removed'); qc.invalidateQueries({ queryKey: ['holidays'] }); setDeleteId(null); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed') });

  const columns: Column<Holiday>[] = [
    { key: 'date', header: 'Date', render: (h) => <span className="font-semibold">{formatDate(h.holidayDate)}</span> },
    { key: 'name', header: 'Holiday Name', accessor: 'name' },
    { key: 'type', header: 'Type', render: (h) => <Badge variant={h.holidayType === 'NATIONAL_HOLIDAY' ? 'info' : 'purple'}>{h.holidayType.replace('_',' ')}</Badge> },
    { key: 'act',  header: '', render: (h) => <Button size="sm" variant="ghost" icon={<Trash2 size={13}/>} className="text-red-600 hover:bg-red-50" onClick={() => setDeleteId(h.id)}>Delete</Button> },
  ];

  return (
    <div>
      <PageHeader title="Holidays" subtitle={`${holidays.length} holidays in ${year}`} icon={<Calendar size={20}/>}
        actions={<Button icon={<Plus size={15}/>} onClick={() => setShowCreate(true)}>Add Holiday</Button>} />
      <div className="flex items-center gap-2 mb-4">
        {[currentYear()-1, currentYear(), currentYear()+1].map(y => (
          <button key={y} onClick={() => setYear(y)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${year===y ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{y}</button>
        ))}
      </div>
      <DataTable columns={columns} data={holidays} loading={isLoading} rowKey={h => h.id} emptyMessage="No holidays configured" />
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Holiday" size="sm"
        footer={<><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button loading={createM.isPending} onClick={form.handleSubmit(d => createM.mutate(d))}>Add</Button></>}>
        <div className="space-y-4">
          <Input label="Date *" type="date" error={form.formState.errors.holidayDate?.message} {...form.register('holidayDate')} />
          <Input label="Name *" error={form.formState.errors.name?.message} placeholder="e.g. Diwali" {...form.register('name')} />
          <Select label="Type *" options={[{value:'FACTORY_HOLIDAY',label:'Factory Holiday'},{value:'NATIONAL_HOLIDAY',label:'National Holiday'}]} {...form.register('holidayType')} />
        </div>
      </Modal>
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteM.mutate(deleteId!)} title="Remove Holiday?" message="This will revert HOLIDAY attendance to ABSENT for all employees." confirmLabel="Remove" loading={deleteM.isPending} />
    </div>
  );
}
