import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Info, Search } from "lucide-react";
import { settingsApi } from "@/services/api/settings.api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { AppSetting, SettingCategory } from "@/types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

interface SettingMeta {
  label: string;
  description: string;
  unit?: string;
  /** Fixed set of allowed values — renders as a dropdown instead of a free-text/number input. */
  options?: { value: string; label: string; description?: string }[];
}

interface CategoryMeta {
  label: string;
  description: string;
}

const CATEGORY_META: Record<SettingCategory, CategoryMeta> = {
  ORGANIZATION: { label: "Organization", description: "Company, factory, and statutory information" },
  EMPLOYEE_HR: { label: "Employee & HR", description: "Employee master-data defaults" },
  ATTENDANCE: { label: "Attendance", description: "Working-time and attendance rules" },
  LEAVE: { label: "Leave", description: "Leave allocation and settlement rules" },
  PAYROLL: { label: "Payroll", description: "Payroll calculation and processing rules" },
  PERFORMANCE_INCENTIVE: { label: "Performance & Incentive", description: "Sales performance and incentive rules" },
  INVENTORY: { label: "Inventory", description: "Inventory validation and alert rules" },
  NOTIFICATIONS: { label: "Notifications", description: "System notification preferences and reminders" },
  SECURITY_IAM: { label: "Security & IAM", description: "Authentication, password, and account-security rules" },
  FINANCE: { label: "Finance", description: "Loan and financial-control rules" },
  SYSTEM: { label: "System", description: "Cross-system operational settings" },
};

const CATEGORY_ORDER: SettingCategory[] = ["ORGANIZATION", "EMPLOYEE_HR", "ATTENDANCE", "LEAVE", "PAYROLL", "PERFORMANCE_INCENTIVE", "INVENTORY", "NOTIFICATIONS", "SECURITY_IAM", "FINANCE", "SYSTEM"];

const META: Record<string, SettingMeta> = {
  PAID_LEAVES_PER_MONTH: { label: "Paid Leaves Per Month", description: "Monthly paid leave entitlement per employee", unit: "days" },
  STANDARD_WORKING_HOURS: { label: "Standard Working Hours", description: "Daily working hours for salary calculation", unit: "hours" },
  STANDARD_WORKING_DAYS: { label: "Standard Working Days", description: "Monthly working days for hourly rate calculation", unit: "days" },
  OVERTIME_MULTIPLIER: { label: "Overtime Multiplier", description: "Pay multiplier for approved overtime (1.5 = time & half)", unit: "x" },
  LOAN_DEFAULT_INTEREST_RATE: { label: "Default Loan Interest Rate", description: "Default monthly interest rate for employee loans", unit: "%" },
  SALARY_PAYMENT_DAY: { label: "Salary Payment Day", description: "Day of next month when salary is disbursed", unit: "th" },
  LOW_STOCK_ALERT_ENABLED: { label: "Low Stock Alert", description: "Enable notifications when stock reaches reorder level" },
  MONTH_CLOSING_REQUIRES_PAYROLL: { label: "Month Closing Requires Payroll", description: "Block month closing until payroll has been generated" },

  // ── Payroll engine settings ──────────────────────────────────────────────
  WEEKLY_OFF_MULTIPLIER: { label: "Weekly Off Multiplier", description: "Pay multiplier when an employee works on a weekly-off day", unit: "x" },
  HOLIDAY_OT_MULTIPLIER: { label: "Holiday OT Multiplier", description: "Pay multiplier when an employee works on a work-allowed holiday", unit: "x" },
  LEAVE_CARRY_FORWARD_LIMIT: { label: "Leave Carry-Forward Limit", description: "Maximum unused paid-leave days that may roll into next month", unit: "days" },
  LEAVE_ENCASHMENT_ENABLED: { label: "Leave Encashment Enabled", description: "Master switch — must be on for the ENCASH policy below to actually pay out unused leave" },

  UNUSED_PAID_LEAVE_POLICY: {
    label: "Unused Paid Leave Policy",
    description: "What happens to an employee\u2019s unused paid leave at month end",
    options: [
      { value: "EXPIRE", label: "Expire", description: "Unused leave is lost — balance resets to zero" },
      { value: "ENCASH", label: "Encash", description: "Unused days are paid out as extra salary (days \u00d7 daily salary)" },
      { value: "CARRY_FORWARD", label: "Carry Forward", description: "Unused days roll into next month, up to the carry-forward limit" },
    ],
  },
  LEAVE_ALLOCATION_METHOD: {
    label: "Leave Allocation Method",
    description: "How the monthly leave quota is given to employees who join/leave mid-month",
    options: [
      { value: "MONTHLY_FIXED", label: "Monthly Fixed", description: "Everyone gets the full monthly quota regardless of join/exit date" },
      { value: "PRORATED", label: "Prorated", description: "Quota is scaled down based on active days in the month" },
    ],
  },
  PAYROLL_GENERATION_POLICY: {
    label: "Payroll Generation Policy",
    description: "When enabled, payroll can only be generated after the configured payroll period has ended. This prevents accidental generation of incomplete payroll.",
    options: [
      { value: "GENERATE_AFTER_PERIOD_END", label: "Generate Only After Payroll Period Ends (Recommended)", description: "Payroll generation is blocked until the period has fully ended" },
      { value: "ALLOW_DRAFT_GENERATION", label: "Allow Draft Payroll Generation", description: "Payroll may be generated at any time, starting in Draft status" },
    ],
  },
};

const DAY_LABELS: { iso: number; short: string; full: string }[] = [
  { iso: 1, short: "Mon", full: "Monday" },
  { iso: 2, short: "Tue", full: "Tuesday" },
  { iso: 3, short: "Wed", full: "Wednesday" },
  { iso: 4, short: "Thu", full: "Thursday" },
  { iso: 5, short: "Fri", full: "Friday" },
  { iso: 6, short: "Sat", full: "Saturday" },
  { iso: 7, short: "Sun", full: "Sunday" },
];

function parseWeeklyOffDays(csv: string): number[] {
  return csv
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 7);
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SettingCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.getAll() });
  const settings: AppSetting[] = data?.data?.data ?? [];
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchableSettings = settings.filter((setting) => {
    if (!normalizedSearch) return true;
    const meta = META[setting.settingKey];
    const category = CATEGORY_META[setting.settingCategory];
    return [setting.settingKey, meta?.label, setting.description, meta?.description, setting.settingCategory, category.label, category.description].some((value) => value?.toLowerCase().includes(normalizedSearch));
  });
  const categories = Array.from(new Set(searchableSettings.map((setting) => setting.settingCategory))).sort((left, right) => CATEGORY_ORDER.indexOf(left) - CATEGORY_ORDER.indexOf(right)) as SettingCategory[];
  const visibleCategory = activeCategory && categories.includes(activeCategory) ? activeCategory : categories[0];
  const visibleSettings = searchableSettings.filter((setting) => setting.settingCategory === visibleCategory);

  const updateM = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => settingsApi.update(key, value),
    onSuccess: (_, vars) => {
      toast.success("Setting updated — effective from next payroll cycle");
      qc.invalidateQueries({ queryKey: ["settings"] });
      setEditValues((prev) => {
        const n = { ...prev };
        delete n[vars.key];
        return n;
      });
      setSaving(null);
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Update failed");
      setSaving(null);
    },
  });

  const hasChange = (s: AppSetting) => editValues[s.settingKey] !== undefined && editValues[s.settingKey] !== s.settingValue;

  const save = (key: string, value: string) => {
    setSaving(key);
    updateM.mutate({ key, value });
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure business rules — changes apply from next payroll cycle" icon={<Settings size={20} />} />
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 mb-5">
        <Info size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Important:</strong> All setting changes take effect from the <strong>first day of the next month</strong>. A month that already has payroll generated keeps using the settings that were in effect when it was first calculated.
        </p>
      </div>
      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input label="" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search settings..." className="pl-9" />
      </div>
      {categories.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" role="tablist" aria-label="Settings categories">
            {categories.map((category) => {
              const active = category === visibleCategory;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(category)}
                  className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800")}
                >
                  {CATEGORY_META[category].label}
                </button>
              );
            })}
          </div>

          <section aria-label={`${CATEGORY_META[visibleCategory].label} settings`}>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{CATEGORY_META[visibleCategory].label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{CATEGORY_META[visibleCategory].description}</p>
            </div>
            <div className="space-y-3">
              {visibleSettings.map((setting) => {
                const meta = META[setting.settingKey];
                const currentVal = editValues[setting.settingKey] ?? setting.settingValue;
                const isBoolean = setting.settingValue === "true" || setting.settingValue === "false";
                const isWeeklyOffDays = setting.settingKey === "WEEKLY_OFF_DAYS";
                const selectedDays = isWeeklyOffDays ? parseWeeklyOffDays(currentVal) : [];

                return (
                  <Card key={setting.id} padding="md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta?.label ?? setting.settingKey.replace(/_/g, " ")}</p>
                          {meta?.unit && <span className="text-xs text-gray-400">({meta.unit})</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{meta?.description ?? setting.settingKey}</p>

                        <div className="flex items-center gap-3 flex-wrap">
                          {isWeeklyOffDays ? (
                            // ── Weekly-off day picker: CSV of ISO day-of-week numbers ──
                            <div className="flex gap-1.5">
                              {DAY_LABELS.map((d) => {
                                const active = selectedDays.includes(d.iso);
                                return (
                                  <button
                                    key={d.iso}
                                    type="button"
                                    title={d.full}
                                    onClick={() => {
                                      const next = active ? selectedDays.filter((x) => x !== d.iso) : [...selectedDays, d.iso];
                                      next.sort((a, b) => a - b);
                                      setEditValues((prev) => ({ ...prev, [setting.settingKey]: next.join(",") }));
                                    }}
                                    className={cn("w-11 h-9 rounded-lg text-xs font-semibold transition-all", active ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700")}
                                  >
                                    {d.short}
                                  </button>
                                );
                              })}
                            </div>
                          ) : meta?.options ? (
                            // ── Enum-style setting: fixed dropdown of allowed values ──
                            <div className="w-64">
                              <Select label="" value={currentVal} onChange={(e) => setEditValues((prev) => ({ ...prev, [setting.settingKey]: e.target.value }))} options={meta.options.map((o) => ({ value: o.value, label: o.label }))} />
                            </div>
                          ) : isBoolean ? (
                            <div className="flex gap-2">
                              {["true", "false"].map((v) => (
                                <button
                                  key={v}
                                  onClick={() => setEditValues((prev) => ({ ...prev, [setting.settingKey]: v }))}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${currentVal === v ? (v === "true" ? "bg-emerald-600 text-white" : "bg-red-500 text-white") : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                                >
                                  {v === "true" ? "Enabled" : "Disabled"}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="w-40">
                              <Input label="" type="number" value={currentVal} onChange={(e) => setEditValues((prev) => ({ ...prev, [setting.settingKey]: e.target.value }))} step={setting.settingKey.includes("MULTIPLIER") || setting.settingKey.includes("RATE") ? "0.01" : "1"} />
                            </div>
                          )}

                          {hasChange(setting) && (
                            <Button size="sm" icon={<Save size={13} />} loading={saving === setting.settingKey} onClick={() => save(setting.settingKey, editValues[setting.settingKey])}>
                              Save
                            </Button>
                          )}
                        </div>

                        {/* Helper text under the enum dropdown, describing the currently-selected option */}
                        {meta?.options && <p className="text-xs text-gray-400 mt-2">{meta.options.find((o) => o.value === currentVal)?.description}</p>}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 mb-0.5">Current</p>
                        <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                          {isWeeklyOffDays
                            ? parseWeeklyOffDays(setting.settingValue)
                                .map((iso) => DAY_LABELS.find((d) => d.iso === iso)?.short)
                                .join(", ")
                            : meta?.options
                              ? (meta.options.find((o) => o.value === setting.settingValue)?.label ?? setting.settingValue)
                              : setting.settingValue}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Effective: {formatDate(setting.effectiveFromDate)}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      )}
      {categories.length === 0 && (
        <Card padding="md">
          <p className="text-sm text-gray-500 dark:text-gray-400">No settings match “{searchQuery}”.</p>
        </Card>
      )}
    </div>
  );
}
