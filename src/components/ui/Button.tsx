import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300',
  outline:   'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
};
const sizes = { sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5', md: 'px-4 py-2 text-sm rounded-lg gap-2', lg: 'px-6 py-3 text-base rounded-xl gap-2.5' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => (
    <motion.button ref={ref} whileTap={{ scale: 0.97 }}
      className={cn('inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none', variants[variant], sizes[size], className)}
      disabled={disabled || loading} {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}>
      {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} /> : icon}
      {children}
    </motion.button>
  )
);
Button.displayName = 'Button';
