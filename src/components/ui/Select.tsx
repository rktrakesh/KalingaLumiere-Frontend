import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; placeholder?: string; }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, placeholder, className, id, ...props }, ref) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select ref={ref} id={selectId} className={cn('w-full rounded-lg border bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white shadow-sm py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent', error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
