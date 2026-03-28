"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Plus, FileEdit } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ChangeOrder {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function ChangeOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { data: changeOrders = [], isLoading } = useQuery<ChangeOrder[]>({
    queryKey: ["change-orders", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/change-orders`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => router.push(`/projects/${projectId}/change-orders/new`)}>
          <Plus className="h-4 w-4" />
          New Change Order
        </Button>
      </div>

      {changeOrders.length === 0 ? (
        <EmptyState
          icon={<FileEdit className="h-12 w-12" />}
          title="No change orders"
          description="Change orders allow you to modify the project scope after signing."
        />
      ) : (
        <div className="space-y-3">
          {changeOrders.map((co) => (
            <Card key={co.id} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{co.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{formatDate(co.createdAt)}</p>
              </div>
              <Badge
                variant={
                  co.status === "APPROVED" ? "success"
                  : co.status === "REJECTED" ? "destructive"
                  : co.status === "PENDING_APPROVAL" ? "warning"
                  : "default"
                }
              >
                {co.status.replace("_", " ")}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
