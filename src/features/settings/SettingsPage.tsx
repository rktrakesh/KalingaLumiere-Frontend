import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Info } from 'lucide-react';
import { settingsApi } from '@/services/api/settings.api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { AppSetting } from '@/types';
import { formatDate } from '@/utils/format';

const META: Record<string, { label: string; description: string; unit?: string }> = {
  PAID_LEAVES_PER_MONTH:          { label: 'Paid Leaves Per Month',          description: 'Monthly paid leave entitlement per employee',                unit: 'days' },
  STANDARD_WORKING_HOURS:         { label: 'Standard Working Hours',          description: 'Daily working hours for salary calculation',                 unit: 'hours' },
  STANDARD_WORKING_DAYS:          { label: 'Standard Working Days',           description: 'Monthly working days for hourly rate calculation',           unit: 'days' },
  OVERTIME_MULTIPLIER:            { label: 'Overtime Multiplier',             description: 'Pay multiplier for approved overtime (1.5 = time & half)',   unit: 'x' },
  LOAN_DEFAULT_INTEREST_RATE:     { label: 'Default Loan Interest Rate',      description: 'Default monthly interest rate for employee loans',           unit: '%' },
  SALARY_PAYMENT_DAY:             { label: 'Salary Payment Day',              description: 'Day of next month when salary is disbursed',                 unit: 'th' },
  LOW_STOCK_ALERT_ENABLED:        { label: 'Low Stock Alert',                 description: 'Enable notifications when stock reaches reorder level' },
  MONTH_CLOSING_REQUIRES_PAYROLL: { label: 'Month Closing Requires Payroll',  description: 'Block month closing until payroll has been generated' },
};

export default function SettingsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.getAll() });
  const settings: AppSetting[] = data?.data?.data ?? [];

  const updateM = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => settingsApi.update(key, value),
    onSuccess: (_, vars) => {
      toast.success('Setting updated — effective from next payroll cycle');
      qc.invalidateQueries({ queryKey: ['settings'] });
      setEditValues(prev => { const n = { ...prev }; delete n[vars.key]; return n; });
      setSaving(null);
    },
    onError: (e: any) => { toast.error(e?.response?.data?.message ?? 'Update failed'); setSaving(null); },
  });

  const hasChange = (s: AppSetting) => editValues[s.settingKey] !== undefined && editValues[s.settingKey] !== s.settingValue;

  if (isLoading) return <div className="space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />)}</div>;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure business rules — changes apply from next payroll cycle" icon={<Settings size={20}/>} />
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 mb-5">
        <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300"><strong>Important:</strong> All setting changes take effect from the <strong>first day of the next month</strong>.</p>
      </div>
      <div className="space-y-3">
        {settings.map(setting => {
          const meta = META[setting.settingKey];
          const currentVal = editValues[setting.settingKey] ?? setting.settingValue;
          const isBoolean = setting.settingValue === 'true' || setting.settingValue === 'false';
          return (
            <Card key={setting.id} padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta?.label ?? setting.settingKey.replace(/_/g,' ')}</p>
                    {meta?.unit && <span className="text-xs text-gray-400">({meta.unit})</span>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{meta?.description ?? setting.settingKey}</p>
                  <div className="flex items-center gap-3">
                    {isBoolean ? (
                      <div className="flex gap-2">
                        {['true','false'].map(v => (
                          <button key={v} onClick={() => setEditValues(prev => ({ ...prev, [setting.settingKey]: v }))}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${currentVal===v ? (v==='true'?'bg-emerald-600 text-white':'bg-red-500 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            {v === 'true' ? 'Enabled' : 'Disabled'}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="w-40">
                        <Input label="" type="number" value={currentVal} onChange={e => setEditValues(prev => ({ ...prev, [setting.settingKey]: e.target.value }))}
                          step={setting.settingKey.includes('MULTIPLIER') || setting.settingKey.includes('RATE') ? '0.01' : '1'} />
                      </div>
                    )}
                    {hasChange(setting) && (
                      <Button size="sm" icon={<Save size={13}/>} loading={saving === setting.settingKey}
                        onClick={() => { setSaving(setting.settingKey); updateM.mutate({ key: setting.settingKey, value: editValues[setting.settingKey] }); }}>
                        Save
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 mb-0.5">Current</p>
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{setting.settingValue}</p>
                  <p className="text-xs text-gray-400 mt-1">Effective: {formatDate(setting.effectiveFromDate)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
