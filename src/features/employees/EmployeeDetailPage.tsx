import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Phone, MapPin, Calendar, Briefcase, DollarSign } from 'lucide-react';
import { employeesApi } from '@/services/api/employees.api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, statusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/common/DataTable';
import { SalaryHistory } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const empId = Number(id);
  const { data: empData, isLoading } = useQuery({ queryKey: ['employee', empId], queryFn: () => employeesApi.getById(empId), enabled: !!empId });
  const { data: histData } = useQuery({ queryKey: ['emp-sal-hist', empId], queryFn: () => employeesApi.getSalaryHistory(empId), enabled: !!empId });
  const emp = empData?.data?.data;
  const history: SalaryHistory[] = histData?.data?.data ?? [];

  const histCols: Column<SalaryHistory>[] = [
    { key: 'sal',  header: 'Salary',        render: (h) => <span className="font-semibold">{formatCurrency(h.salary)}</span> },
    { key: 'eff',  header: 'Effective From', render: (h) => formatDate(h.effectiveFrom) },
    { key: 'rem',  header: 'Remarks',        render: (h) => h.remarks ?? '—' },
    { key: 'by',   header: 'Changed By',     accessor: 'createdBy' },
    { key: 'date', header: 'Date',           render: (h) => formatDate(h.createdDate) },
  ];

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-48 rounded-xl" /></div>;
  if (!emp) return <div className="text-center py-20 text-gray-400">Employee not found</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={15}/>} onClick={() => navigate('/employees')}>Back</Button>
        <div><h1 className="text-xl font-bold text-gray-900 dark:text-white">{emp.name}</h1><p className="text-sm text-gray-500">{emp.employeeCode}</p></div>
        <Badge variant={statusBadge(emp.status)} className="ml-2">{emp.status}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card padding="md" className="md:col-span-2">
          <CardHeader><CardTitle>Employee Information</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <User size={14}/>,       label: 'Full Name',     value: emp.name },
              { icon: <Briefcase size={14}/>,  label: 'Designation',   value: emp.designation ?? '—' },
              { icon: <Phone size={14}/>,      label: 'Phone',         value: emp.phone ?? '—' },
              { icon: <Calendar size={14}/>,   label: 'Joining Date',  value: formatDate(emp.joiningDate) },
              { icon: <MapPin size={14}/>,     label: 'Address',       value: emp.address ?? '—' },
              { icon: <DollarSign size={14}/>, label: 'Current Salary',value: formatCurrency(emp.currentSalary) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</div>
                <div><p className="text-xs text-gray-400 mb-0.5">{label}</p><p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="md">
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Code</span><span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">{emp.employeeCode}</span></div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500">Status</span><Badge variant={statusBadge(emp.status)}>{emp.status}</Badge></div>
            <div className="flex justify-between items-center py-2"><span className="text-sm text-gray-500">Salary History</span><span className="text-sm font-semibold">{history.length} records</span></div>
          </div>
        </Card>
      </div>
      <Card padding="md"><CardHeader><CardTitle>Salary History</CardTitle></CardHeader><DataTable columns={histCols} data={history} rowKey={h => h.id} emptyMessage="No salary history" /></Card>
    </div>
  );
}
