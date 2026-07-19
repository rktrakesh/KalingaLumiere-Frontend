import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{leftIcon}</div>}
        <input ref={ref} id={inputId} className={cn('w-full rounded-lg border bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent', error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600', leftIcon ? 'pl-10' : 'pl-3.5', rightIcon ? 'pr-10' : 'pr-3.5', 'py-2.5', className)} {...props} />
        {rightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">{rightIcon}</div>}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';
