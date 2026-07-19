import { ReactNode } from 'react';
import { motion } from 'framer-motion';
interface PageHeaderProps { title: string; subtitle?: string; actions?: ReactNode; icon?: ReactNode; }
export const PageHeader = ({ title, subtitle, actions, icon }: PageHeaderProps) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
    <div className="flex items-center gap-3">
      {icon && <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">{icon}</div>}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </motion.div>
);
