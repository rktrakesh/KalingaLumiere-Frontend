import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface KPICardProps { title: string; value: string|number; subtitle?: string; icon?: ReactNode; trend?: 'up'|'down'|'neutral'; trendValue?: string; color?: 'blue'|'green'|'red'|'purple'|'orange'|'teal'; loading?: boolean; index?: number; }

const colors = {
  blue:   { icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  green:  { icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  red:    { icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
  orange: { icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' },
  teal:   { icon: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' },
};

export const KPICard = ({ title, value, subtitle, icon, color = 'blue', loading, index = 0 }: KPICardProps) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, duration: 0.3 }}
    className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 p-5 shadow-card">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 truncate">{title}</p>
        {loading ? <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>}
        {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
      </div>
      {icon && <div className={cn('rounded-xl p-2.5 ml-3 flex-shrink-0', colors[color].icon)}>{icon}</div>}
    </div>
  </motion.div>
);
