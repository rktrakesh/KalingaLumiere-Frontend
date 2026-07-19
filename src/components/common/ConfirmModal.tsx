import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
interface ConfirmModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title?: string; message?: string; confirmLabel?: string; variant?: 'danger'|'primary'; loading?: boolean; }
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmLabel = 'Confirm', variant = 'danger', loading }: ConfirmModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={<><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button></>}>
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0"><AlertTriangle size={20} className="text-red-600 dark:text-red-400" /></div>
      <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3><p className="text-sm text-gray-500 mt-1">{message}</p></div>
    </div>
  </Modal>
);
