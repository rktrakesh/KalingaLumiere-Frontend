import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
interface FilterOption { value: string; label: string; }
interface SearchFilterProps { search: string; onSearchChange: (v: string) => void; placeholder?: string; filters?: { key: string; label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }[]; actions?: React.ReactNode; }
export const SearchFilter = ({ search, onSearchChange, placeholder = 'Search…', filters, actions }: SearchFilterProps) => (
  <div className="erp-search-filter flex flex-col items-stretch gap-3 mb-4 sm:flex-row sm:flex-wrap sm:items-end">
    <div className="min-w-0 flex-1 sm:min-w-48"><Input value={search} onChange={e => onSearchChange(e.target.value)} placeholder={placeholder} leftIcon={<Search size={15} />} /></div>
    {filters?.map(f => <div key={f.key} className="w-full sm:w-auto sm:min-w-36"><Select label="" value={f.value} onChange={e => f.onChange(e.target.value)} options={f.options} placeholder={f.label} /></div>)}
    {actions}
  </div>
);
