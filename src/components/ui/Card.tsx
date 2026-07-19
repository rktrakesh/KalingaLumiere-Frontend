import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> { hover?: boolean; glass?: boolean; padding?: 'none'|'sm'|'md'|'lg'; }

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, glass, padding = 'md', className, children, ...props }, ref) => (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={cn('rounded-xl border border-gray-200 dark:border-gray-700/60', glass ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm' : 'bg-white dark:bg-gray-800 shadow-card',
        hover && 'hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }[padding], className)}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}>{children}</motion.div>
  )
);
Card.displayName = 'Card';
export const CardHeader = ({ className, children, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn('flex items-center justify-between mb-4', className)} {...p}>{children}</div>;
export const CardTitle  = ({ className, children, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('text-base font-semibold text-gray-900 dark:text-white', className)} {...p}>{children}</h3>;
