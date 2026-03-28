"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, FileText, Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ProposalStatus } from "@/types";

interface Proposal {
  id: string;
  title: string;
  type: string;
  status: ProposalStatus;
  client: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count: { sections: number };
}

const statusVariant: Record<string, "default" | "primary" | "success" | "warning" | "destructive"> = {
  DRAFT: "default",
  SENT: "primary",
  VIEWED: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  EXPIRED: "destructive",
};

export default function ProposalsPage() {
  const router = useRouter();
  const [showTypeModal, setShowTypeModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Proposal[] }>({
    queryKey: ["proposals"],
    queryFn: async () => {
      const res = await fetch("/api/proposals");
      if (!res.ok) throw new Error("Failed to fetch proposals");
      return res.json();
    },
  });

  async function createProposal(type: "BY_TIMELINE" | "BY_HOUR") {
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Proposal", type }),
    });

    if (res.ok) {
      const proposal = await res.json();
      router.push(`/proposals/${proposal.id}/edit`);
    }

    setShowTypeModal(false);
  }

  const proposals = data?.data || [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <Button onClick={() => setShowTypeModal(true)}>
          <Plus className="h-4 w-4" />
          New Proposal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No proposals yet"
          description="Create your first proposal to send to a client"
          action={
            <Button onClick={() => setShowTypeModal(true)}>
              <Plus className="h-4 w-4" />
              Create Proposal
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => router.push(`/proposals/${p.id}/edit`)}
              >
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.client?.name || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {p.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] || "default"}>
                    {p.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--muted-foreground)]">
                  {formatDate(p.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="New Proposal"
        size="lg"
      >
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Choose the type of proposal you want to create
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => createProposal("BY_TIMELINE")}
            className="rounded-xl border-2 border-[var(--border)] p-6 text-left transition-all hover:border-[var(--primary)] hover:shadow-md"
          >
            <Calendar className="mb-3 h-8 w-8 text-[var(--primary)]" />
            <h3 className="font-semibold">By Project Timeline</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Delivery project on specific time with weekly Gantt timeline
            </p>
          </button>
          <button
            onClick={() => createProposal("BY_HOUR")}
            className="rounded-xl border-2 border-[var(--border)] p-6 text-left transition-all hover:border-[var(--primary)] hover:shadow-md"
          >
            <Clock className="mb-3 h-8 w-8 text-[var(--primary)]" />
            <h3 className="font-semibold">By Hour — No Timeline</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Limited hours per month or open hours retainer engagement
            </p>
          </button>
        </div>
      </Modal>
    </div>
  );
}
