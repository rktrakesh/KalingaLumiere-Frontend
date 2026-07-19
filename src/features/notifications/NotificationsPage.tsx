import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/services/api/notifications.api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Notification } from '@/types';
import { formatDateTime } from '@/utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

const TYPE_COLORS: Record<string, string> = {
  PENDING_OT_APPROVAL:    'bg-amber-400',
  PENDING_LOAN_APPROVAL:  'bg-blue-400',
  PENDING_LEAVE_APPROVAL: 'bg-green-400',
  FORGOTTEN_CHECKOUT:     'bg-red-400',
  LOW_INVENTORY:          'bg-orange-400',
  PAYROLL_PENDING:        'bg-purple-400',
  MONTH_CLOSING_PENDING:  'bg-pink-400',
};

const TYPE_BADGE: Record<string, 'warning'|'info'|'success'|'danger'|'purple'|'neutral'> = {
  PENDING_OT_APPROVAL:    'warning',
  PENDING_LOAN_APPROVAL:  'info',
  PENDING_LEAVE_APPROVAL: 'success',
  FORGOTTEN_CHECKOUT:     'danger',
  LOW_INVENTORY:          'warning',
  PAYROLL_PENDING:        'purple',
  MONTH_CLOSING_PENDING:  'neutral',
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: () => notificationsApi.getAll(),
    refetchInterval: 30000,
  });

  const notifications: Notification[] = data?.data?.data ?? [];
  const unread = notifications.filter(n => n.status === 'UNREAD').length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-all'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      qc.invalidateQueries({ queryKey: ['notifications-all'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread · ${notifications.length} total`}
        icon={<Bell size={20} />}
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" icon={<CheckCheck size={14} />}
              loading={markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}>
              Mark All Read
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card padding="md" className="text-center py-16">
          <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">Approvals, alerts and system messages appear here</p>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n, idx) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all',
                  n.status === 'UNREAD'
                    ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                )}
              >
                <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', TYPE_COLORS[n.notificationType] ?? 'bg-gray-300')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{n.message}</p>
                    </div>
                    <Badge variant={TYPE_BADGE[n.notificationType] ?? 'neutral'} className="flex-shrink-0 text-[10px]">
                      {n.notificationType.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{formatDateTime(n.createdDate)}</p>
                    {n.status === 'UNREAD' && (
                      <button onClick={() => markReadMutation.mutate(n.id)}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
