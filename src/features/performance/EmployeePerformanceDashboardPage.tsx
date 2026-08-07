import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Wallet, Users, UserCheck, UserX, ShoppingBag, Repeat, UserPlus, Award, Trophy } from "lucide-react";
import { performanceApi } from "@/services/api/performance.api";
import { KPICard } from "@/components/common/KPICard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatNumber } from "@/utils/format";

export default function EmployeePerformanceDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["performance-me"],
    queryFn: () => performanceApi.getMyDashboard(),
    refetchInterval: 60000,
  });
  const d = data?.data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const achievementPct = d?.achievementPct ?? 0;
  const achievementColor = achievementPct >= 100 ? "#22C55E" : achievementPct >= 90 ? "#FFD76A" : "#f04438";

  return (
    <div>
      <PageHeader title="Performance Dashboard" subtitle={d ? new Date(d.periodYear, d.periodMonth - 1).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : ""} icon={<TrendingUp size={20} />} />

      {d && (
        <Card padding="md" className="mb-5 border-l-4" style={{ borderLeftColor: achievementColor }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <path d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                  <path d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" fill="none" stroke={achievementColor} strokeWidth="3" strokeDasharray={`${Math.min(achievementPct, 150)} 150`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-sm font-bold text-gray-900 dark:text-white">{achievementPct.toFixed(0)}%</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target Achievement</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{d.recommendationLabel}</p>
                {d.recommendationSuggestion && <p className="text-xs text-gray-500 mt-0.5">{d.recommendationSuggestion}</p>}
              </div>
            </div>
            {achievementPct >= 200 && (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 text-amber-700 dark:text-amber-400">
                <Trophy size={14} /> <span className="text-xs font-semibold">Outstanding Performer</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KPICard title="Monthly Target" value={formatCurrency(d?.monthlyTarget ?? 0)} icon={<Target size={18} />} color="blue" index={0} />
        <KPICard title="Monthly Sales" value={formatCurrency(d?.monthlySales ?? 0)} icon={<TrendingUp size={18} />} color="green" index={1} />
        <KPICard title="Incentive Earned" value={formatCurrency(d?.incentiveEarned ?? 0)} icon={<Award size={18} />} color="purple" index={2} />
        <KPICard title="Collection Pending" value={formatCurrency(d?.collectionPending ?? 0)} icon={<Wallet size={18} />} color="orange" index={3} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <KPICard title="Assigned Customers" value={formatNumber(d?.assignedCustomers ?? 0)} icon={<Users size={18} />} color="blue" index={4} />
        <KPICard title="Active Customers" value={formatNumber(d?.activeCustomers ?? 0)} icon={<UserCheck size={18} />} color="green" index={5} />
        <KPICard title="Inactive Customers" value={formatNumber(d?.inactiveCustomers ?? 0)} icon={<UserX size={18} />} color="red" index={6} />
        <KPICard title="Orders This Month" value={formatNumber(d?.ordersThisMonth ?? 0)} icon={<ShoppingBag size={18} />} color="teal" index={7} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="Avg Order Value" value={formatCurrency(d?.averageOrderValue ?? 0)} icon={<ShoppingBag size={18} />} color="blue" index={8} />
        <KPICard title="Largest Order" value={formatCurrency(d?.largestOrder ?? 0)} icon={<Trophy size={18} />} color="purple" index={9} />
        <KPICard title="New Customers" value={formatNumber(d?.newCustomers ?? 0)} icon={<UserPlus size={18} />} color="green" index={10} />
        <KPICard title="Repeat Customers" value={formatNumber(d?.repeatCustomers ?? 0)} icon={<Repeat size={18} />} color="teal" index={11} />
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>How Your Incentive Is Calculated</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Incentive is earned on sales above your monthly target, at the percentage set by the incentive slab your current achievement falls into. Selling further past your target keeps earning at the higher slab — there's no cap on how much more you can earn once you're past 100%.
        </p>
      </Card>
    </div>
  );
}
