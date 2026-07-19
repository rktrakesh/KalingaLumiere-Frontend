import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';
interface EmptyStateProps { icon?: ReactNode; title?: string; description?: string; action?: ReactNode; }
export const EmptyState = ({ icon = <FileX size={40} />, title = 'No records found', description = 'There are no items to display.', action }: EmptyStateProps) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-gray-300 dark:text-gray-600 mb-4">{icon}</div>
    <p className="text-base font-semibold text-gray-600 dark:text-gray-300">{title}</p>
    <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);
