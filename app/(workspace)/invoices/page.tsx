"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  dueDate: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "destructive"> = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  OVERDUE: "warning",
  CANCELLED: "destructive",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 0 },
  ]);

  const { data, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const validItems = lineItems.filter((i) => i.description.trim());
      if (validItems.length === 0) throw new Error("Add at least one line item");

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems: validItems }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setShowCreate(false);
      setLineItems([{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]);
      toast.success("Invoice created");
    },
    onError: (e) => toast.error(e.message),
  });

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as paid");
    },
  });

  const invoices = data?.data || [];
  const subtotalItems = lineItems.reduce(
    (s, i) => s + i.quantity * i.unitPrice * (1 + i.taxRate / 100),
    0
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-12 w-12" />}
          title="No invoices yet"
          description="Create your first invoice to bill a client"
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-medium">{inv.number}</TableCell>
                <TableCell>{inv.project?.name || "—"}</TableCell>
                <TableCell className="font-medium">{formatCurrency(inv.total)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                </TableCell>
                <TableCell className="text-[var(--muted-foreground)]">
                  {formatDate(inv.createdAt)}
                </TableCell>
                <TableCell>
                  {inv.status !== "PAID" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markPaidMutation.mutate(inv.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Invoice"
        size="xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center w-20">Qty</th>
                  <th className="py-2 text-right w-28">Price</th>
                  <th className="py-2 text-center w-20">Tax %</th>
                  <th className="py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-2">
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[i].description = e.target.value;
                          setLineItems(updated);
                        }}
                        placeholder="Service description"
                        className="h-8"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[i].quantity = parseFloat(e.target.value) || 0;
                          setLineItems(updated);
                        }}
                        className="h-8 text-center"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[i].unitPrice = parseFloat(e.target.value) || 0;
                          setLineItems(updated);
                        }}
                        className="h-8 text-right"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[i].taxRate = parseFloat(e.target.value) || 0;
                          setLineItems(updated);
                        }}
                        className="h-8 text-center"
                      />
                    </td>
                    <td className="py-2 pl-1">
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => setLineItems(lineItems.filter((_, j) => j !== i))}
                          className="rounded p-1 hover:bg-[var(--secondary)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add Line Item
          </Button>

          <div className="border-t border-[var(--border)] pt-4 text-right">
            <p className="text-lg font-bold">
              Total: {formatCurrency(subtotalItems)}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
