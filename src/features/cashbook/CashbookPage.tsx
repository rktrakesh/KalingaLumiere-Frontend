import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, Banknote } from 'lucide-react';
import { cashbookApi } from '@/services/api/cashbook.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { KPICard } from '@/components/common/KPICard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { usePagination } from '@/hooks/usePagination';
import { CashbookTransaction } from '@/types';
import { formatCurrency, formatDateTime, MONTHS, currentYear, currentMonth } from '@/utils/format';

export default function CashbookPage() {
  const { page, size, goToPage } = usePagination(0, 20);
  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(currentMonth());

  const { data: sumData, isLoading: sumLoading } = useQuery({ queryKey: ['cashbook-summary', year, month], queryFn: () => cashbookApi.getSummary(year, month) });
  const { data: txData, isLoading: txLoading } = useQuery({ queryKey: ['cashbook-tx', page, size], queryFn: () => cashbookApi.getTransactions({ page, size }) });

  const summary = sumData?.data?.data;
  const txPage = txData?.data?.data;
  const transactions: CashbookTransaction[] = txPage?.content ?? [];

  const flowColor = (flow: string) => flow === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400';

  const typeVariant: Record<string, 'success'|'danger'|'info'|'warning'|'neutral'|'purple'> = {
    INCOME: 'success', CUSTOMER_PAYMENT: 'success',
    EXPENSE: 'danger', SUPPLIER_PAYMENT: 'danger', SALARY_PAYMENT: 'danger',
    LOAN_DISBURSEMENT: 'purple',
  };

  const columns: Column<CashbookTransaction>[] = [
    { key: 'dt',   header: 'Date/Time',    render: (t) => <span className="text-xs">{formatDateTime(t.createdDate)}</span> },
    { key: 'acct', header: 'Account',      accessor: 'accountName' },
    { key: 'type', header: 'Type',         render: (t) => <Badge variant={typeVariant[t.transactionType] ?? 'neutral'}>{t.transactionType.replace(/_/g,' ')}</Badge> },
    { key: 'flow', header: 'Flow',         render: (t) => <Badge variant={t.flowType==='CREDIT'?'success':'danger'}>{t.flowType}</Badge> },
    { key: 'amt',  header: 'Amount',       render: (t) => <span className={`font-semibold ${flowColor(t.flowType)}`}>{t.flowType==='DEBIT'?'−':'+'}{formatCurrency(t.amount)}</span> },
    { key: 'bal',  header: 'Balance After',render: (t) => <span className="font-medium">{formatCurrency(t.balanceAfter)}</span> },
    { key: 'desc', header: 'Description',  render: (t) => <span className="text-xs text-gray-500 truncate max-w-xs block">{t.description ?? '—'}</span> },
    { key: 'by',   header: 'By',           accessor: 'createdBy' },
  ];

  const yOpts = [currentYear()-1, currentYear()].map(y => ({ value: String(y), label: String(y) }));
  const mOpts = MONTHS.map((m,i) => ({ value: String(i+1), label: m }));

  return (
    <div>
      <PageHeader title="Cashbook" subtitle="Cash and bank transaction register" icon={<Wallet size={20}/>} />
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-gray-500">Period:</span>
        <div className="w-28"><Select label="" value={String(year)} onChange={e => setYear(Number(e.target.value))} options={yOpts} /></div>
        <div className="w-36"><Select label="" value={String(month)} onChange={e => setMonth(Number(e.target.value))} options={mOpts} /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KPICard title="Cash In Hand"    value={formatCurrency(summary?.cashInHand ?? 0)}    icon={<Banknote size={18}/>}    color="green"  index={0} loading={sumLoading} />
        <KPICard title="Bank Balance"    value={formatCurrency(summary?.bankBalance ?? 0)}    icon={<Wallet size={18}/>}      color="blue"   index={1} loading={sumLoading} />
        <KPICard title="Total Balance"   value={formatCurrency(summary?.totalBalance ?? 0)}   icon={<Wallet size={18}/>}      color="teal"   index={2} loading={sumLoading} />
        <KPICard title="Monthly Income"  value={formatCurrency(summary?.monthlyIncome ?? 0)}  icon={<TrendingUp size={18}/>}  color="green"  index={3} loading={sumLoading} />
        <KPICard title="Monthly Expense" value={formatCurrency(summary?.monthlyExpense ?? 0)} icon={<TrendingDown size={18}/>}color="red"    index={4} loading={sumLoading} />
        <KPICard title="Net Cash Flow"   value={formatCurrency(summary?.monthlyNet ?? 0)}     icon={<TrendingUp size={18}/>}  color={summary && summary.monthlyNet >= 0 ? 'teal' : 'red'} index={5} loading={sumLoading} />
      </div>
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700"><CardTitle>Transaction Register</CardTitle></CardHeader>
        <div className="p-4">
          <DataTable columns={columns} data={transactions} loading={txLoading} totalPages={txPage?.totalPages} currentPage={page} totalElements={txPage?.totalElements} pageSize={size} onPageChange={goToPage} rowKey={t => t.id} emptyMessage="No transactions found" />
        </div>
      </Card>
    </div>
  );
}
