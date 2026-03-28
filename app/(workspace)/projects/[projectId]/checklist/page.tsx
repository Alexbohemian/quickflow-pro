"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Check } from "lucide-react";


interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export default function ChecklistPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState("");

  const { data: checklists = [], isLoading } = useQuery<Checklist[]>({
    queryKey: ["checklists", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/checklists`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addItem = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/projects/${projectId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addItem", text }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", projectId] });
      setNewItem("");
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, isChecked }: { itemId: string; isChecked: boolean }) => {
      const res = await fetch(`/api/projects/${projectId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", itemId, isChecked }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists", projectId] });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  const allItems = checklists.flatMap((c) => c.items);
  const checked = allItems.filter((i) => i.isChecked).length;
  const progress = allItems.length > 0 ? Math.round((checked / allItems.length) * 100) : 0;

  return (
    <Card>
      <CardTitle className="mb-4">
        QA Checklist
        {allItems.length > 0 && (
          <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
            {checked}/{allItems.length} ({progress}%)
          </span>
        )}
      </CardTitle>

      {/* Progress bar */}
      {allItems.length > 0 && (
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className="h-full rounded-full bg-[var(--success)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-2">
        {allItems.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-[var(--muted)]"
          >
            <button
              onClick={() => toggleItem.mutate({ itemId: item.id, isChecked: !item.isChecked })}
              className={`flex h-5 w-5 items-center justify-center rounded border ${
                item.isChecked
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : "border-[var(--border)]"
              }`}
            >
              {item.isChecked && <Check className="h-3 w-3" />}
            </button>
            <span className={item.isChecked ? "text-[var(--muted-foreground)] line-through" : ""}>
              {item.text}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newItem.trim()) addItem.mutate(newItem.trim());
          }}
          placeholder="Add checklist item..."
          className="flex-1"
        />
        <Button
          onClick={() => { if (newItem.trim()) addItem.mutate(newItem.trim()); }}
          disabled={!newItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
