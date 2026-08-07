import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, CreditCard, FileText, Package, Timer, TrendingDown, TrendingUp, Users, UserX, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardApi } from "@/services/api/dashboard.api";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

type MetricTone = "gold" | "green" | "red" | "orange" | "neutral";

const metricTones: Record<MetricTone, string> = {
  gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  neutral: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
};

interface DashboardPanelProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

function DashboardPanel({ title, icon, children, className, action }: DashboardPanelProps) {
  return (
    <Card padding="none" className={cn("dashboard-panel overflow-hidden", className)}>
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-700/60">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-brand-500">{icon}</span>
          <h2 className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-700 dark:text-gray-200">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </Card>
  );
}

interface MetricTileProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: MetricTone;
  helper?: string;
}

function MetricTile({ label, value, icon, tone = "neutral", helper }: MetricTileProps) {
  return (
    <div className="dashboard-metric min-w-0 rounded-md border border-gray-200 p-2.5 dark:border-gray-700/60">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 truncate text-base font-bold tabular-nums text-gray-900 dark:text-white">{value}</p>
          {helper && <p className="mt-0.5 truncate text-[9px] text-gray-400">{helper}</p>}
        </div>
        <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md", metricTones[tone])}>{icon}</span>
      </div>
    </div>
  );
}

interface SnapshotRowProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: MetricTone;
}

function SnapshotRow({ label, value, icon, tone = "neutral" }: SnapshotRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-200 py-2 last:border-0 dark:border-gray-700/60">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded", metricTones[tone])}>{icon}</span>
        <span className="truncate text-[11px] text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="truncate text-right text-xs font-semibold tabular-nums text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <Skeleton className="h-44 md:col-span-1 xl:col-span-4" />
        <Skeleton className="h-44 md:col-span-1 xl:col-span-3" />
        <Skeleton className="h-44 md:col-span-2 xl:col-span-5" />
        <Skeleton className="h-64 md:col-span-2 xl:col-span-7" />
        <Skeleton className="h-64 md:col-span-2 xl:col-span-5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: () => dashboardApi.getAdmin(),
    refetchInterval: 60000,
  });
  const d = data?.data?.data;

  const financeData = d
    ? [
        { name: "Revenue", value: d.monthlyRevenue, fill: "#dca62f" },
        { name: "Expenses", value: d.monthlyExpenses, fill: "#ef4444" },
        { name: "Profit", value: d.monthlyProfit, fill: "#22c55e" },
      ]
    : [];

  const stockData = [
    ...(d?.rawMaterialStock?.slice(0, 5).map((stock) => ({ name: stock.materialName.slice(0, 10), stock: Number(stock.currentStock) })) ?? []),
    ...(d?.finishedGoodsStock?.slice(0, 3).map((stock) => ({ name: stock.materialName.slice(0, 10), stock: Number(stock.currentStock) })) ?? []),
  ];

  const stockColors = ["#dca62f", "#ef4444", "#22c55e", "#f59e0b", "#a3a3a3"];
  const hasPendingActions = Boolean(d && (d.pendingOvertimeApprovals > 0 || d.pendingLoanApprovals > 0 || d.pendingLeaveApprovals > 0 || d.pendingCheckouts > 0));

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="dashboard-page">
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} icon={<TrendingUp size={20} />} />

      {hasPendingActions && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <AlertTriangle size={15} className="flex-shrink-0 text-amber-500" />
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">Pending actions</span>
          {(d?.pendingOvertimeApprovals ?? 0) > 0 && <Badge variant="warning">{d?.pendingOvertimeApprovals} Overtime</Badge>}
          {(d?.pendingLoanApprovals ?? 0) > 0 && <Badge variant="warning">{d?.pendingLoanApprovals} Loan</Badge>}
          {(d?.pendingLeaveApprovals ?? 0) > 0 && <Badge variant="warning">{d?.pendingLeaveApprovals} Leave</Badge>}
          {(d?.pendingCheckouts ?? 0) > 0 && <Badge variant="danger">{d?.pendingCheckouts} Checkout</Badge>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <DashboardPanel title="Today's Brief" icon={<FileText size={14} />} className="xl:col-span-4">
          <div className="dashboard-metric-grid grid grid-cols-2 gap-2">
            <MetricTile label="Present Today" value={d?.presentToday ?? 0} icon={<CheckCircle size={14} />} tone="green" helper="Employees present" />
            <MetricTile label="Pending OT" value={d?.pendingOvertimeApprovals ?? 0} icon={<Timer size={14} />} tone="orange" helper="Awaiting approval" />
            <MetricTile label="Leave Requests" value={d?.pendingLeaveApprovals ?? 0} icon={<FileText size={14} />} tone="gold" helper="Awaiting review" />
            <MetricTile label="Low Stock" value={d?.lowStockAlerts ?? 0} icon={<Package size={14} />} tone="red" helper="Inventory alerts" />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Workforce Status" icon={<Users size={14} />} className="xl:col-span-3">
          <div className="dashboard-metric-grid grid grid-cols-2 gap-2">
            <MetricTile label="Present" value={d?.presentToday ?? 0} icon={<CheckCircle size={14} />} tone="green" />
            <MetricTile label="Absent" value={d?.absentToday ?? 0} icon={<UserX size={14} />} tone="red" />
            <div className="col-span-2">
              <MetricTile label="Checkout Pending" value={d?.pendingCheckouts ?? 0} icon={<Timer size={14} />} tone="orange" helper="Requires attendance correction" />
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Pending Approvals" icon={<AlertTriangle size={14} />} className="md:col-span-2 xl:col-span-5">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3 xl:grid-cols-1">
            <SnapshotRow label="Overtime requests" value={d?.pendingOvertimeApprovals ?? 0} icon={<Timer size={12} />} tone="orange" />
            <SnapshotRow label="Leave requests" value={d?.pendingLeaveApprovals ?? 0} icon={<FileText size={12} />} tone="gold" />
            <SnapshotRow label="Loan requests" value={d?.pendingLoanApprovals ?? 0} icon={<CreditCard size={12} />} tone="neutral" />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Monthly Financial Overview" icon={<TrendingUp size={14} />} className="md:col-span-2 xl:col-span-7">
          <div className="dashboard-finance-metrics grid grid-cols-1 gap-2 border-b border-gray-200 pb-3 dark:border-gray-700/60 sm:grid-cols-3">
            <MetricTile label="Revenue" value={formatCurrency(d?.monthlyRevenue ?? 0)} icon={<TrendingUp size={14} />} tone="green" />
            <MetricTile label="Expenses" value={formatCurrency(d?.monthlyExpenses ?? 0)} icon={<TrendingDown size={14} />} tone="red" />
            <MetricTile label="Net Profit" value={formatCurrency(d?.monthlyProfit ?? 0)} icon={<TrendingUp size={14} />} tone="gold" />
          </div>
          <div className="mt-2 h-44 sm:h-48">
            <ResponsiveContainer width="100%" height="100%" debounce={180}>
              <BarChart data={financeData} barSize={32} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.16)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#202425", border: "1px solid #4b4f50", borderRadius: 6, boxShadow: "0 12px 28px rgba(0,0,0,0.35)", fontSize: 11 }}
                  labelStyle={{ color: "#f3c65d", fontWeight: 600 }}
                  itemStyle={{ color: "#f5f5f4" }}
                  cursor={{ fill: "rgba(220,166,47,0.05)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {financeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Cash & Outstanding Snapshot" icon={<Wallet size={14} />} className="md:col-span-2 xl:col-span-5">
          <div className="grid gap-x-5 sm:grid-cols-2 xl:grid-cols-1">
            <SnapshotRow label="Cash in hand" value={formatCurrency(d?.cashInHand ?? 0)} icon={<Wallet size={12} />} tone="gold" />
            <SnapshotRow label="Bank balance" value={formatCurrency(d?.bankBalance ?? 0)} icon={<Wallet size={12} />} tone="green" />
            <SnapshotRow label="Customer outstanding" value={formatCurrency(d?.customerOutstanding ?? 0)} icon={<Users size={12} />} tone="orange" />
            <SnapshotRow label="Supplier outstanding" value={formatCurrency(d?.supplierOutstanding ?? 0)} icon={<FileText size={12} />} tone="red" />
            <SnapshotRow label="Outstanding loan" value={formatCurrency(d?.outstandingLoanBalance ?? 0)} icon={<CreditCard size={12} />} tone="neutral" />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Inventory Health" icon={<Package size={14} />} className="md:col-span-2 xl:col-span-8" action={(d?.lowStockAlerts ?? 0) > 0 ? <Badge variant="warning">{d?.lowStockAlerts} Low</Badge> : undefined}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-400">Raw materials</p>
              {d?.rawMaterialStock?.length ? (
                d.rawMaterialStock.slice(0, 6).map((stock) => <SnapshotRow key={`${stock.materialName}-${stock.unit}`} label={stock.materialName} value={`${formatNumber(Number(stock.currentStock))} ${stock.unit}`} icon={<Package size={11} />} />)
              ) : (
                <p className="py-8 text-center text-xs text-gray-400">No raw material data</p>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-400">Finished goods</p>
              {d?.finishedGoodsStock?.length ? (
                d.finishedGoodsStock.slice(0, 6).map((stock) => <SnapshotRow key={`${stock.materialName}-${stock.unit}`} label={stock.materialName} value={`${formatNumber(Number(stock.currentStock))} ${stock.unit}`} icon={<Package size={11} />} tone="gold" />)
              ) : (
                <p className="py-8 text-center text-xs text-gray-400">No finished goods data</p>
              )}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Stock Distribution" icon={<Package size={14} />} className="md:col-span-2 xl:col-span-4">
          {stockData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" debounce={180}>
                <PieChart>
                  <Pie data={stockData} cx="50%" cy="45%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="stock" nameKey="name" isAnimationActive={false}>
                    {stockData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={stockColors[index % stockColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ backgroundColor: "#202425", border: "1px solid #4b4f50", borderRadius: 6, boxShadow: "0 12px 28px rgba(0,0,0,0.35)", fontSize: 11 }}
                    labelStyle={{ color: "#f3c65d", fontWeight: 600 }}
                    itemStyle={{ color: "#f5f5f4" }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center text-xs text-gray-400">No stock data</div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
