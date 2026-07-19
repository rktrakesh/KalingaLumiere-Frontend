import { cn } from '@/utils/cn';
type BadgeVariant = 'success'|'warning'|'danger'|'info'|'neutral'|'purple';
interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string; }
const variants: Record<BadgeVariant,string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  danger:  'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400',
  info:    'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400',
  neutral: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400',
  purple:  'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400',
};
export const Badge = ({ variant = 'neutral', children, className }: BadgeProps) => (
  <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', variants[variant], className)}>{children}</span>
);
export const statusBadge = (status: string): BadgeVariant => {
  const map: Record<string,BadgeVariant> = {
    ACTIVE:'success', APPROVED:'success', PRESENT:'success', PAID:'success', COMPLETED:'success',
    PENDING:'warning', PARTIAL:'warning', IN_PROGRESS:'warning', PENDING_APPROVAL:'warning', PENDING_CHECKOUT:'warning',
    INACTIVE:'neutral', CLOSED:'neutral', GENERATED:'info', DRAFT:'info', PAID_LEAVE:'info',
    ABSENT:'danger', REJECTED:'danger', CANCELLED:'danger',
    HOLIDAY:'purple', REGENERATED:'warning', LOCKED:'neutral', MODIFIED:'warning',
  };
  return map[status] ?? 'neutral';
};
