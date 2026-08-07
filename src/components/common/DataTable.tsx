import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export interface Column<T> { key: string; header: string; accessor?: keyof T | ((row: T) => ReactNode); render?: (row: T) => ReactNode; className?: string; headerClassName?: string; }

interface DataTableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; totalPages?: number; currentPage?: number; totalElements?: number; onPageChange?: (p: number) => void; pageSize?: number; emptyMessage?: string; rowKey?: (row: T) => string | number; }

export function DataTable<T>({ columns, data, loading, totalPages = 1, currentPage = 0, totalElements, onPageChange, pageSize = 10, emptyMessage = 'No records found.', rowKey }: DataTableProps<T>) {
  const getCellValue = (row: T, col: Column<T>): ReactNode => {
    if (col.render) return col.render(row);
    if (col.accessor) { if (typeof col.accessor === 'function') return col.accessor(row) as ReactNode; return row[col.accessor] as ReactNode; }
    return null;
  };
  return (
    <div className="space-y-3">
      <div className="erp-table hidden overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 md:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>{columns.map(col => <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap', col.headerClassName)}>{col.header}</th>)}</tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/60">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-6"><TableSkeleton rows={5} cols={columns.length} /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">{emptyMessage}</td></tr>
            ) : data.map((row, idx) => (
              <tr key={rowKey ? rowKey(row) : idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-100">
                {columns.map(col => <td key={col.key} className={cn('px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap', col.className)}>{getCellValue(row, col)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <TableSkeleton rows={4} cols={2} />
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-400 dark:border-gray-700">{emptyMessage}</div>
        ) : data.map((row, idx) => (
          <div
            key={rowKey ? rowKey(row) : idx}
            className="erp-mobile-record divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white px-3 dark:divide-gray-700/60 dark:border-gray-700 dark:bg-gray-800"
          >
            {columns.map(col => (
              <div key={col.key} className="grid grid-cols-[minmax(6.5rem,0.42fr)_minmax(0,1fr)] items-start gap-3 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">{col.header}</span>
                <div className={cn('min-w-0 break-words text-right text-sm text-gray-700 dark:text-gray-300', col.className)}>{getCellValue(row, col)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-2 px-1 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalElements !== undefined ? `Showing ${currentPage * (pageSize||10) + 1}–${Math.min((currentPage+1)*(pageSize||10), totalElements)} of ${totalElements}` : `Page ${currentPage+1} of ${totalPages}`}
          </p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="sm" onClick={() => onPageChange?.(0)} disabled={currentPage===0}><ChevronsLeft size={14}/></Button>
            <Button variant="ghost" size="sm" onClick={() => onPageChange?.(currentPage-1)} disabled={currentPage===0}><ChevronLeft size={14}/></Button>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">{currentPage+1} / {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => onPageChange?.(currentPage+1)} disabled={currentPage>=totalPages-1}><ChevronRight size={14}/></Button>
            <Button variant="ghost" size="sm" onClick={() => onPageChange?.(totalPages-1)} disabled={currentPage>=totalPages-1}><ChevronsRight size={14}/></Button>
          </div>
        </div>
      )}
    </div>
  );
}
