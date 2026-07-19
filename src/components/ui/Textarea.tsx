import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, id, ...props }, ref) => {
  const tid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={tid} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <textarea ref={ref} id={tid} rows={3} className={cn('w-full rounded-lg border bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 shadow-sm px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent', error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600', className)} {...props} />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
