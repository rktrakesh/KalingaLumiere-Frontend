import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> { hover?: boolean; glass?: boolean; padding?: 'none'|'sm'|'md'|'lg'; }

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, glass, padding = 'md', className, children, ...props }, ref) => (
    <div ref={ref}
      className={cn('erp-card rounded-lg border border-gray-200 dark:border-gray-700/60', glass ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm' : 'bg-white dark:bg-gray-800 shadow-card',
        hover && 'hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        { none: '', sm: 'p-3 sm:p-4', md: 'p-4 sm:p-5', lg: 'p-5 sm:p-6' }[padding], className)}
      {...props}>{children}</div>
  )
);
Card.displayName = 'Card';
export const CardHeader = ({ className, children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn('flex items-center justify-between mb-4', className)} {...p}>{children}</div>;
export const CardTitle  = ({ className, children, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('text-xs font-semibold uppercase tracking-[0.08em] text-gray-900 dark:text-white', className)} {...p}>{children}</h3>;
