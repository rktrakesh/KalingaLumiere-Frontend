import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { reportsApi } from '@/services/api/reports.api';
import { PageHeader } from '@/components/common/PageHeader';
import { KPICard } from '@/components/common/KPICard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/common/DataTable';
import { formatCurrency, MONTHS, currentYear, currentMonth } from '@/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ReportsPage() {
  const [year, setYear]   = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());
  const [tab, setTab]     = useState<'pl'|'attendance'>('pl');

  const { data: plData, isLoading: plLoading } = useQuery({ queryKey: ['report-pl', year, month], queryFn: () => reportsApi.getProfitLoss(year, month), enabled: tab === 'pl' });
  const { data: attData, isLoading: attLoading } = useQuery({ queryKey: ['report-att', year, month], queryFn: () => reportsApi.getAttendance(year, month), enabled: tab === 'attendance' });

  const pl  = plData?.data?.data;
  const att = attData?.data?.data;
  const expChart = pl ? Object.entries(pl.expenseByCategory).map(([k,v]) => ({ name: k.replace(/_/g,' '), value: v })) : [];
  const COLORS = ['#6172f3','#f04438','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

  const yOpts = [currentYear()-1, currentYear()].map(y => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m,i) => ({ value: String(i+1), label: m }));

  const attCols: Column<any>[] = [
    { key: 'code',    header: 'Code',        render: (e) => <span className="font-mono text-xs">{e.employeeCode}</span> },
    { key: 'name',    header: 'Employee',    accessor: 'employeeName' },
    { key: 'present', header: 'Present',     render: (e) => <span className="font-semibold text-emerald-600">{e.presentDays}</span>, className: 'text-center' },
    { key: 'absent',  header: 'Absent',      render: (e) => <span className="font-semibold text-red-500">{e.absentDays}</span>, className: 'text-center' },
    { key: 'leave',   header: 'Paid Leave',  render: (e) => e.paidLeaveDays, className: 'text-center' },
    { key: 'hol',     header: 'Holidays',    render: (e) => e.holidayDays, className: 'text-center' },
    { key: 'hrs',     header: 'Worked (Hrs)',render: (e) => (e.totalWorkedMinutes/60).toFixed(1), className: 'text-center' },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Financial and operational analytics" icon={<FileText size={20}/>} />
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-gray-500">Period:</span>
        <div className="w-28"><Select label="" value={String(year)} onChange={e => setYear(Number(e.target.value))} options={yOpts} /></div>
        <div className="w-36"><Select label="" value={String(month)} onChange={e => setMonth(Number(e.target.value))} options={mOpts} /></div>
      </div>
      <div className="flex gap-2 mb-5">
        {(['pl','attendance'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab===t?'bg-brand-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            {t === 'pl' ? 'Profit & Loss' : 'Attendance'}
          </button>
        ))}
      </div>

      {tab === 'pl' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Revenue"  value={formatCurrency(pl?.totalRevenue ?? 0)}  icon={<TrendingUp size={18}/>}   color="green" index={0} loading={plLoading} />
            <KPICard title="Total Expenses" value={formatCurrency(pl?.totalExpenses ?? 0)} icon={<TrendingDown size={18}/>} color="red"   index={1} loading={plLoading} />
            <KPICard title="Gross Profit"   value={formatCurrency(pl?.grossProfit ?? 0)}   icon={<TrendingUp size={18}/>}   color="teal"  index={2} loading={plLoading} />
            <KPICard title="Net Profit"     value={formatCurrency(pl?.netProfit ?? 0)}      icon={<BarChart3 size={18}/>}    color={pl && pl.netProfit >= 0 ? 'teal' : 'red'} index={3} loading={plLoading} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="md">
              <CardHeader><CardTitle>Revenue vs Expenses</CardTitle></CardHeader>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{name:'Revenue',v:pl?.totalRevenue??0},{name:'Expenses',v:pl?.totalExpenses??0},{name:'Profit',v:pl?.netProfit??0}]} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{fontSize:12}} />
                  <YAxis tick={{fontSize:11}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v:number)=>formatCurrency(v)} contentStyle={{borderRadius:10,fontSize:12}} />
                  <Bar dataKey="v" radius={[6,6,0,0]} fill="#6172f3" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card padding="md">
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              {expChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={expChart} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                      {expChart.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v:number)=>formatCurrency(v)} contentStyle={{borderRadius:10,fontSize:12}} />
                    <Legend iconSize={10} wrapperStyle={{fontSize:11}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">{plLoading ? 'Loading…' : 'No expense data'}</div>}
            </Card>
          </div>
          {pl?.expenseByCategory && (
            <Card padding="md">
              <CardHeader><CardTitle>Expense by Category</CardTitle></CardHeader>
              <DataTable
                columns={[
                  {key:'cat',  header:'Category', render:(r:any) => <span className="text-sm font-medium">{r.category.replace(/_/g,' ')}</span>},
                  {key:'amt',  header:'Amount',   render:(r:any) => <span className="font-semibold">{formatCurrency(r.amount)}</span>},
                  {key:'pct',  header:'% of Total',render:(r:any) => pl.totalExpenses > 0 ? `${((r.amount/pl.totalExpenses)*100).toFixed(1)}%` : '—'},
                ]}
                data={Object.entries(pl.expenseByCategory).map(([k,v]) => ({ category: k, amount: v }))}
                rowKey={(r:any) => r.category}
              />
            </Card>
          )}
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard title="Total Employees" value={att?.totalEmployees ?? 0} icon={<FileText size={18}/>} color="blue" index={0} loading={attLoading} />
            <KPICard title="Avg Present Days" value={att?.employees?.length ? (att.employees.reduce((s:number,e:any)=>s+e.presentDays,0)/att.employees.length).toFixed(1) : 0} color="green" index={1} loading={attLoading} />
            <KPICard title="Avg Absent Days"  value={att?.employees?.length ? (att.employees.reduce((s:number,e:any)=>s+e.absentDays,0)/att.employees.length).toFixed(1) : 0} color="red" index={2} loading={attLoading} />
          </div>
          <Card padding="md">
            <CardHeader><CardTitle>Attendance Summary — {MONTHS[month-1]} {year}</CardTitle></CardHeader>
            <DataTable columns={attCols} data={att?.employees ?? []} loading={attLoading} rowKey={(e:any) => e.employeeId} emptyMessage="No attendance data" />
          </Card>
        </div>
      )}
    </div>
  );
}
