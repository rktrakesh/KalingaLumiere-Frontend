import { ReactNode } from 'react';
interface PageHeaderProps { title: string; subtitle?: string; actions?: ReactNode; icon?: ReactNode; }
export const PageHeader = ({ title, subtitle, actions, icon }: PageHeaderProps) => (
  <div className="erp-page-header mb-5 flex flex-col items-stretch justify-between gap-3 sm:mb-6 sm:flex-row sm:items-start">
    <div className="flex items-center gap-3">
      {icon && <div className="p-2 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">{icon}</div>}
      <div>
        <h1 className="text-lg font-bold uppercase tracking-[0.06em] text-gray-900 dark:text-white sm:text-xl">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="erp-page-actions flex flex-wrap items-center gap-2 sm:flex-shrink-0">{actions}</div>}
  </div>
);
