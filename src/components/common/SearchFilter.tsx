import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
interface FilterOption { value: string; label: string; }
interface SearchFilterProps { search: string; onSearchChange: (v: string) => void; placeholder?: string; filters?: { key: string; label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }[]; actions?: React.ReactNode; }
export const SearchFilter = ({ search, onSearchChange, placeholder = 'Search…', filters, actions }: SearchFilterProps) => (
  <div className="flex flex-wrap items-end gap-3 mb-4">
    <div className="flex-1 min-w-48"><Input value={search} onChange={e => onSearchChange(e.target.value)} placeholder={placeholder} leftIcon={<Search size={15} />} /></div>
    {filters?.map(f => <div key={f.key} className="min-w-36"><Select label="" value={f.value} onChange={e => f.onChange(e.target.value)} options={f.options} placeholder={f.label} /></div>)}
    {actions}
  </div>
);
