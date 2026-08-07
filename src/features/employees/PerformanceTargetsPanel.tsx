import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Trash2 } from "lucide-react";
import { performanceApi } from "@/services/api/performance.api";
import type { CreateSalesPolicyRequest, SalesPolicy } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import { useToast } from "@/hooks/useToast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { DataTable, type Column } from "@/components/common/DataTable";

interface Props {
  employeeId: number;
  employeeName: string;
}

interface SlabDraft {
  minAchievementPct: string;
  maxAchievementPct: string;
  incentivePct: string;
}

const localToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const emptySlab = (): SlabDraft => ({
  minAchievementPct: "",
  maxAchievementPct: "",
  incentivePct: "",
});

export function PerformanceTargetsPanel({ employeeId, employeeName }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(localToday());
  const [slabs, setSlabs] = useState<SlabDraft[]>([emptySlab()]);

  const historyQuery = useQuery({
    queryKey: ["sales-policy-history", employeeId],
    queryFn: () => performanceApi.getSalesPolicyHistory(employeeId),
  });
  const history = historyQuery.data?.data.data ?? [];
  const activePolicy = history.find((policy) => policy.status === "ACTIVE");

  const resetForm = () => {
    setMonthlyTarget(activePolicy ? String(activePolicy.monthlyTarget) : "");
    setEffectiveFrom(localToday());
    setSlabs(activePolicy?.slabs.length
      ? [...activePolicy.slabs]
          .sort((a, b) => a.slabOrder - b.slabOrder)
          .map((slab) => ({
            minAchievementPct: String(slab.minAchievementPct),
            maxAchievementPct: slab.maxAchievementPct == null ? "" : String(slab.maxAchievementPct),
            incentivePct: String(slab.incentivePct),
          }))
      : [emptySlab()]);
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (request: CreateSalesPolicyRequest) => performanceApi.createSalesPolicy(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-policy-history", employeeId] });
      setShowForm(false);
      toast.success(activePolicy ? "New target version created" : "Sales target created");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "The sales target could not be saved.")),
  });

  const save = () => {
    const target = Number(monthlyTarget);
    if (!Number.isFinite(target) || target <= 0) {
      toast.error("Monthly target must be greater than zero.");
      return;
    }
    if (!effectiveFrom) {
      toast.error("Effective date is required.");
      return;
    }

    const parsedSlabs = slabs.map((slab, index) => ({
      minAchievementPct: Number(slab.minAchievementPct),
      maxAchievementPct: slab.maxAchievementPct.trim() ? Number(slab.maxAchievementPct) : null,
      incentivePct: Number(slab.incentivePct),
      slabOrder: index + 1,
    }));
    const invalidSlab = parsedSlabs.some((slab) =>
      !Number.isFinite(slab.minAchievementPct)
      || !Number.isFinite(slab.incentivePct)
      || slab.minAchievementPct < 0
      || slab.incentivePct < 0
      || (slab.maxAchievementPct != null
        && (!Number.isFinite(slab.maxAchievementPct) || slab.maxAchievementPct < slab.minAchievementPct)));
    if (invalidSlab) {
      toast.error("Enter valid slab ranges and incentive percentages.");
      return;
    }

    createMutation.mutate({ employeeId, monthlyTarget: target, effectiveFrom, slabs: parsedSlabs });
  };

  const updateSlab = (index: number, field: keyof SlabDraft, value: string) => {
    setSlabs((current) => current.map((slab, slabIndex) =>
      slabIndex === index ? { ...slab, [field]: value } : slab));
  };

  const historyColumns: Column<SalesPolicy>[] = [
    { key: "version", header: "Version", render: (policy) => `v${policy.version}` },
    { key: "target", header: "Monthly Target", render: (policy) => <span className="font-semibold tabular-nums">{formatCurrency(policy.monthlyTarget)}</span>, className: "text-right", headerClassName: "text-right" },
    { key: "from", header: "Effective From", render: (policy) => formatDate(policy.effectiveFrom) },
    { key: "to", header: "Effective To", render: (policy) => policy.effectiveTo ? formatDate(policy.effectiveTo) : "Current" },
    { key: "slabs", header: "Slabs", render: (policy) => policy.slabs.length },
    { key: "status", header: "Status", render: (policy) => <Badge variant={policy.status === "ACTIVE" ? "success" : "neutral"}>{policy.status}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <Card padding="md">
        <CardHeader>
          <div>
            <CardTitle>Current Sales Target</CardTitle>
            <p className="mt-1 text-xs text-gray-500">Target and incentive policy used by the performance dashboard.</p>
          </div>
          <Button icon={<Target size={15} />} onClick={openForm}>
            {activePolicy ? "Create New Version" : "Set Sales Target"}
          </Button>
        </CardHeader>

        {activePolicy ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs text-gray-500">Monthly Target</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-gray-900 dark:text-white">{formatCurrency(activePolicy.monthlyTarget)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs text-gray-500">Effective From</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(activePolicy.effectiveFrom)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs text-gray-500">Policy Version</p>
                <div className="mt-1 flex items-center gap-2"><span className="text-sm font-semibold">v{activePolicy.version}</span><Badge variant="success">ACTIVE</Badge></div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Incentive Slabs</h4>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-900/50"><tr><th className="px-4 py-3 text-left">Achievement</th><th className="px-4 py-3 text-right">Incentive</th></tr></thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[...activePolicy.slabs].sort((a, b) => a.slabOrder - b.slabOrder).map((slab) => (
                      <tr key={slab.id ?? slab.slabOrder}><td className="px-4 py-3">{slab.minAchievementPct}% {slab.maxAchievementPct == null ? "and above" : `to ${slab.maxAchievementPct}%`}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{slab.incentivePct}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-700">
            <Target className="mx-auto text-gray-400" size={28} />
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No sales target configured</p>
            <p className="mt-1 text-xs text-gray-500">Set a monthly target and at least one incentive slab for {employeeName}.</p>
          </div>
        )}
      </Card>

      <Card padding="md">
        <CardHeader><CardTitle>Target History</CardTitle></CardHeader>
        <DataTable columns={historyColumns} data={history} loading={historyQuery.isLoading} rowKey={(policy) => policy.id} emptyMessage="No target history" />
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={activePolicy ? "Create New Sales Target Version" : "Set Sales Target"}
        size="2xl"
        footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={save}>Save Target</Button></>}
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Monthly Sales Target (₹) *" type="number" min="0.01" step="0.01" value={monthlyTarget} onChange={(event) => setMonthlyTarget(event.target.value)} />
            <Input label="Effective From *" type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white">Incentive Slabs</h4><p className="text-xs text-gray-500">Leave the maximum blank for the final unbounded slab.</p></div>
              <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setSlabs((current) => [...current, emptySlab()])}>Add Slab</Button>
            </div>
            <div className="mt-3 space-y-3">
              {slabs.map((slab, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                  <Input label="Minimum achievement % *" type="number" min="0" step="0.01" value={slab.minAchievementPct} onChange={(event) => updateSlab(index, "minAchievementPct", event.target.value)} />
                  <Input label="Maximum achievement %" type="number" min="0" step="0.01" value={slab.maxAchievementPct} onChange={(event) => updateSlab(index, "maxAchievementPct", event.target.value)} />
                  <Input label="Incentive % *" type="number" min="0" step="0.01" value={slab.incentivePct} onChange={(event) => updateSlab(index, "incentivePct", event.target.value)} />
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} disabled={slabs.length === 1} onClick={() => setSlabs((current) => current.filter((_, slabIndex) => slabIndex !== index))} aria-label={`Remove incentive slab ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
