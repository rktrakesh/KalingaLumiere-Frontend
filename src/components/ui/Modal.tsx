import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm'|'md'|'lg'|'xl'|'2xl'; footer?: React.ReactNode; }
const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
export const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
            className={cn('modal-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:rounded-lg', sizes[size])}>
            {title && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold uppercase tracking-wide text-gray-900 dark:text-white">{title}</h2>
                <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={18} /></button>
              </div>
            )}
            <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">{children}</div>
            {footer && <div className="modal-footer flex flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
