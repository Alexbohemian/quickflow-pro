"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function ProjectInvoicesPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ["project-invoices", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const invoices = data?.data || [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-12 w-12" />}
        title="No invoices for this project"
        description="Create an invoice from the main Invoices page."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-mono font-medium">{inv.number}</TableCell>
            <TableCell className="font-medium">{formatCurrency(inv.total)}</TableCell>
            <TableCell>
              <Badge variant={inv.status === "PAID" ? "success" : "warning"}>
                {inv.status}
              </Badge>
            </TableCell>
            <TableCell className="text-[var(--muted-foreground)]">
              {formatDate(inv.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
