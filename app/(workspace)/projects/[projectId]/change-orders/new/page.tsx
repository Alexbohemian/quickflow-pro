"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PricingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export default function NewChangeOrderPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState<PricingItem[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  const total = pricing.reduce(
    (s, i) => s + i.quantity * i.unitPrice * (1 + i.taxRate / 100),
    0
  );

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);

    const validPricing = pricing.filter((p) => p.description.trim());

    const res = await fetch(`/api/projects/${projectId}/change-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        pricing: validPricing.length > 0 ? validPricing : undefined,
      }),
    });

    if (res.ok) {
      toast.success("Change order created");
      router.push(`/projects/${projectId}/change-orders`);
    } else {
      toast.error("Failed to create change order");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push(`/projects/${projectId}/change-orders`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardTitle className="mb-6">New Change Order</CardTitle>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            label="Title"
            placeholder="E.g., Add contact form to homepage"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="Describe the changes needed..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Pricing</label>
            <div className="space-y-2">
              {pricing.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...pricing];
                      updated[i].description = e.target.value;
                      setPricing(updated);
                    }}
                    placeholder="Item description"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...pricing];
                      updated[i].quantity = parseFloat(e.target.value) || 0;
                      setPricing(updated);
                    }}
                    className="w-20 text-center"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const updated = [...pricing];
                      updated[i].unitPrice = parseFloat(e.target.value) || 0;
                      setPricing(updated);
                    }}
                    className="w-28 text-right"
                    placeholder="Price"
                  />
                  {pricing.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPricing(pricing.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() =>
                setPricing([...pricing, { description: "", quantity: 1, unitPrice: 0, taxRate: 0 }])
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
            {total > 0 && (
              <p className="mt-2 text-right font-bold">
                Total: {formatCurrency(total)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/change-orders`)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Create Change Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
