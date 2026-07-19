import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, TrendingDown, Package, Wallet, CreditCard, AlertTriangle, CheckCircle, UserX, Timer, FileText } from 'lucide-react';
import { dashboardApi } from '@/services/api/dashboard.api';
import { KPICard } from '@/components/common/KPICard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatNumber } from '@/utils/format';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-admin'], queryFn: () => dashboardApi.getAdmin(), refetchInterval: 60000 });
  const d = data?.data?.data;

  const financeData = d ? [
    { name: 'Revenue',  value: d.monthlyRevenue,  fill: '#6172f3' },
    { name: 'Expenses', value: d.monthlyExpenses,  fill: '#f04438' },
    { name: 'Profit',   value: d.monthlyProfit,    fill: '#10b981' },
  ] : [];

  const stockData = [
    ...(d?.rawMaterialStock?.slice(0,5).map(s => ({ name: s.materialName.slice(0,10), stock: Number(s.currentStock) })) ?? []),
    ...(d?.finishedGoodsStock?.slice(0,3).map(s => ({ name: s.materialName.slice(0,10), stock: Number(s.currentStock) })) ?? []),
  ];

  const COLORS = ['#6172f3','#f04438','#10b981','#f59e0b','#8b5cf6'];

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <CardSkeleton key={i} />)}</div></div>;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} icon={<TrendingUp size={20} />} />
      {d && (d.pendingOvertimeApprovals > 0 || d.pendingLoanApprovals > 0 || d.pendingLeaveApprovals > 0 || d.pendingCheckouts > 0) && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-wrap gap-3 items-center">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Actions:</span>
          {d.pendingOvertimeApprovals > 0 && <Badge variant="warning">{d.pendingOvertimeApprovals} Overtime</Badge>}
          {d.pendingLoanApprovals > 0 && <Badge variant="warning">{d.pendingLoanApprovals} Loan</Badge>}
          {d.pendingLeaveApprovals > 0 && <Badge variant="warning">{d.pendingLeaveApprovals} Leave</Badge>}
          {d.pendingCheckouts > 0 && <Badge variant="danger">{d.pendingCheckouts} Checkout Pending</Badge>}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KPICard title="Present Today"    value={d?.presentToday ?? 0}             icon={<CheckCircle size={18}/>} color="green"  index={0} />
        <KPICard title="Absent Today"     value={d?.absentToday ?? 0}              icon={<UserX size={18}/>}       color="red"    index={1} />
        <KPICard title="Pending OT"       value={d?.pendingOvertimeApprovals ?? 0} icon={<Timer size={18}/>}       color="orange" index={2} />
        <KPICard title="Loan Approvals"   value={d?.pendingLoanApprovals ?? 0}     icon={<CreditCard size={18}/>}  color="purple" index={3} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KPICard title="Monthly Revenue"  value={formatCurrency(d?.monthlyRevenue ?? 0)}  icon={<TrendingUp size={18}/>}   color="green"  index={4} />
        <KPICard title="Monthly Expenses" value={formatCurrency(d?.monthlyExpenses ?? 0)} icon={<TrendingDown size={18}/>} color="red"    index={5} />
        <KPICard title="Net Profit"       value={formatCurrency(d?.monthlyProfit ?? 0)}   icon={<TrendingUp size={18}/>}   color="teal"   index={6} />
        <KPICard title="Cash In Hand"     value={formatCurrency(d?.cashInHand ?? 0)}      icon={<Wallet size={18}/>}       color="blue"   index={7} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Bank Balance"         value={formatCurrency(d?.bankBalance ?? 0)}            icon={<Wallet size={18}/>}    color="blue"   index={8} />
        <KPICard title="Customer Outstanding" value={formatCurrency(d?.customerOutstanding ?? 0)}    icon={<Users size={18}/>}     color="purple" index={9} />
        <KPICard title="Supplier Outstanding" value={formatCurrency(d?.supplierOutstanding ?? 0)}    icon={<FileText size={18}/>}  color="orange" index={10} />
        <KPICard title="Loan Balance"         value={formatCurrency(d?.outstandingLoanBalance ?? 0)} icon={<CreditCard size={18}/>} color="red"   index={11} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2" padding="md">
          <CardHeader><CardTitle>Monthly Financial Overview</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={financeData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6,6,0,0]}>{financeData.map((e,i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card padding="md">
          <CardHeader><CardTitle>Stock Distribution</CardTitle></CardHeader>
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stockData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="stock" nameKey="name">
                  {stockData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatNumber(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No stock data</div>}
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card padding="md">
          <CardHeader><CardTitle>Raw Material Stock</CardTitle>{(d?.lowStockAlerts ?? 0) > 0 && <Badge variant="warning">{d?.lowStockAlerts} Low</Badge>}</CardHeader>
          {d?.rawMaterialStock?.slice(0,6).map((s,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="flex items-center gap-2"><Package size={13} className="text-gray-400" /><span className="text-sm text-gray-700 dark:text-gray-300">{s.materialName}</span></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(Number(s.currentStock))} {s.unit}</span>
            </div>
          )) ?? <p className="text-sm text-gray-400">No data</p>}
        </Card>
        <Card padding="md">
          <CardHeader><CardTitle>Finished Goods Stock</CardTitle></CardHeader>
          {d?.finishedGoodsStock?.slice(0,6).map((s,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="flex items-center gap-2"><Package size={13} className="text-blue-400" /><span className="text-sm text-gray-700 dark:text-gray-300">{s.materialName}</span></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(Number(s.currentStock))} {s.unit}</span>
            </div>
          )) ?? <p className="text-sm text-gray-400">No data</p>}
        </Card>
      </div>
    </div>
  );
}
