"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface PricingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface PricingData {
  items: PricingItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
}

interface PricingEditorProps {
  proposalId: string;
}

export function PricingEditor({ proposalId }: PricingEditorProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PricingData>({
    queryKey: ["proposal-pricing", proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}/pricing`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const pricingMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/proposals/${proposalId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["proposal-pricing", proposalId],
      });
    },
    onError: () => toast.error("Failed to update pricing"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-center font-medium w-24">Qty</th>
            <th className="px-4 py-3 text-right font-medium w-32">Unit Price</th>
            <th className="px-4 py-3 text-center font-medium w-24">Tax %</th>
            <th className="px-4 py-3 text-right font-medium w-32">Amount</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"
            >
              <td className="px-4 py-2">
                <input
                  defaultValue={item.description}
                  className="w-full bg-transparent outline-none"
                  onBlur={(e) =>
                    pricingMutation.mutate({
                      action: "update",
                      itemId: item.id,
                      description: e.target.value,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      taxRate: item.taxRate,
                    })
                  }
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  defaultValue={item.quantity}
                  className="w-full bg-transparent text-center outline-none"
                  onBlur={(e) =>
                    pricingMutation.mutate({
                      action: "update",
                      itemId: item.id,
                      description: item.description,
                      quantity: parseFloat(e.target.value) || 1,
                      unitPrice: item.unitPrice,
                      taxRate: item.taxRate,
                    })
                  }
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  defaultValue={item.unitPrice}
                  className="w-full bg-transparent text-right outline-none"
                  onBlur={(e) =>
                    pricingMutation.mutate({
                      action: "update",
                      itemId: item.id,
                      description: item.description,
                      quantity: item.quantity,
                      unitPrice: parseFloat(e.target.value) || 0,
                      taxRate: item.taxRate,
                    })
                  }
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  defaultValue={item.taxRate}
                  className="w-full bg-transparent text-center outline-none"
                  onBlur={(e) =>
                    pricingMutation.mutate({
                      action: "update",
                      itemId: item.id,
                      description: item.description,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </td>
              <td className="px-4 py-2 text-right font-medium">
                {formatCurrency(
                  item.quantity * item.unitPrice * (1 + item.taxRate / 100)
                )}
              </td>
              <td className="px-2 py-2">
                <button
                  onClick={() =>
                    pricingMutation.mutate({
                      action: "delete",
                      itemId: item.id,
                    })
                  }
                  className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--destructive)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-b border-[var(--border)]">
            <td colSpan={6} className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  pricingMutation.mutate({
                    action: "add",
                    item: {
                      description: "New item",
                      quantity: 1,
                      unitPrice: 0,
                      taxRate: 0,
                    },
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add Line Item
              </Button>
            </td>
          </tr>
          <tr className="border-b border-[var(--border)]">
            <td colSpan={4} className="px-4 py-2 text-right font-medium">
              Subtotal
            </td>
            <td className="px-4 py-2 text-right font-medium">
              {formatCurrency(data?.subtotal || 0)}
            </td>
            <td />
          </tr>
          <tr className="border-b border-[var(--border)]">
            <td colSpan={4} className="px-4 py-2 text-right text-[var(--muted-foreground)]">
              Tax
            </td>
            <td className="px-4 py-2 text-right text-[var(--muted-foreground)]">
              {formatCurrency(data?.taxTotal || 0)}
            </td>
            <td />
          </tr>
          <tr>
            <td colSpan={4} className="px-4 py-3 text-right text-lg font-bold">
              Total
            </td>
            <td className="px-4 py-3 text-right text-lg font-bold text-[var(--primary)]">
              {formatCurrency(data?.total || 0)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
