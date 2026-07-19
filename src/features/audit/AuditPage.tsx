import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield } from 'lucide-react';
import { auditApi } from '@/services/api/audit.api';
import { DataTable, Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { AuditLog } from '@/types';
import { formatDateTime } from '@/utils/format';

const MODULES = [
  'EMPLOYEE','ATTENDANCE','LEAVE','OVERTIME','PAYROLL','LOAN',
  'EXPENSE','SUPPLIER','CUSTOMER','INVENTORY','PURCHASE',
  'PRODUCTION','SALES','CASHBOOK','MONTH_CLOSING','SETTINGS',
];

const ACTION_COLOR: Record<string, 'success'|'danger'|'warning'|'info'|'neutral'> = {
  CREATE: 'success', APPROVE: 'success', COMPLETE: 'success',
  DELETE: 'danger',  CANCEL: 'danger',   DEACTIVATE: 'danger', REJECT: 'danger',
  UPDATE: 'warning', CORRECT: 'warning', SALARY_CHANGE: 'warning', REGENERATE: 'warning',
  CLOSE:  'neutral', REOPEN:  'info',
};

export default function AuditPage() {
  const { page, size, goToPage } = usePagination(0, 20);
  const [moduleFilter, setModuleFilter] = useState('');
  const [userSearch,   setUserSearch]   = useState('');
  const [viewLog, setViewLog] = useState<AuditLog | null>(null);
  const dUser = useDebounce(userSearch);

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, size, moduleFilter, dUser],
    queryFn:  () => auditApi.search({ page, size, module: moduleFilter || undefined, username: dUser || undefined }),
  });

  const pageData = data?.data?.data;
  const logs: AuditLog[] = pageData?.content ?? [];

  const parseSafe = (val?: string | null) => {
    if (!val) return null;
    try { return JSON.stringify(JSON.parse(val), null, 2); }
    catch { return val; }
  };

  const columns: Column<AuditLog>[] = [
    { key: 'time',   header: 'Time',     render: (l) => <span className="text-xs text-gray-500">{formatDateTime(l.createdAt)}</span> },
    { key: 'user',   header: 'User',     render: (l) => <span className="font-medium text-sm">{l.username}</span> },
    { key: 'module', header: 'Module',   render: (l) => <Badge variant="info">{l.module}</Badge> },
    { key: 'action', header: 'Action',   render: (l) => <Badge variant={ACTION_COLOR[l.action] ?? 'neutral'}>{l.action.replace(/_/g,' ')}</Badge> },
    { key: 'entity', header: 'Entity',   render: (l) => l.entityType
        ? <span className="text-sm text-gray-600 dark:text-gray-300">{l.entityType} #{l.entityId}</span>
        : <span className="text-gray-400">—</span> },
    { key: 'diff',   header: 'Changes',  render: (l) => (l.oldValue || l.newValue)
        ? <button onClick={() => setViewLog(l)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View diff</button>
        : <span className="text-gray-400">—</span> },
  ];

  const moduleOptions = MODULES.map(m => ({ value: m, label: m.replace(/_/g,' ') }));

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Immutable trail of all sensitive changes" icon={<Shield size={20} />} />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input placeholder="Filter by username…" value={userSearch}
            onChange={e => { setUserSearch(e.target.value); goToPage(0); }}
            leftIcon={<Search size={14} />} />
        </div>
        <div className="w-44">
          <Select label="" value={moduleFilter}
            onChange={e => { setModuleFilter(e.target.value); goToPage(0); }}
            options={moduleOptions} placeholder="All Modules" />
        </div>
      </div>

      <DataTable columns={columns} data={logs} loading={isLoading}
        totalPages={pageData?.totalPages} currentPage={page}
        totalElements={pageData?.totalElements} pageSize={size}
        onPageChange={goToPage} rowKey={(l) => l.id}
        emptyMessage="No audit logs found for this filter"
      />

      <Modal isOpen={!!viewLog} onClose={() => setViewLog(null)} title="Change Details" size="lg"
        footer={<Button variant="outline" onClick={() => setViewLog(null)}>Close</Button>}
      >
        {viewLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm border-b dark:border-gray-700 pb-4">
              <div><p className="text-gray-400 text-xs">User</p><p className="font-medium">{viewLog.username}</p></div>
              <div><p className="text-gray-400 text-xs">Time</p><p className="font-medium">{formatDateTime(viewLog.createdAt)}</p></div>
              <div><p className="text-gray-400 text-xs">Module</p><Badge variant="info">{viewLog.module}</Badge></div>
              <div><p className="text-gray-400 text-xs">Action</p><Badge variant={ACTION_COLOR[viewLog.action] ?? 'neutral'}>{viewLog.action}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Before</p>
                <pre className="text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg p-3 overflow-auto max-h-64 border border-red-200 dark:border-red-800 whitespace-pre-wrap">
                  {parseSafe(viewLog.oldValue) ?? 'null'}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-500 mb-2 uppercase tracking-wide">After</p>
                <pre className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-lg p-3 overflow-auto max-h-64 border border-emerald-200 dark:border-emerald-800 whitespace-pre-wrap">
                  {parseSafe(viewLog.newValue) ?? 'null'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
