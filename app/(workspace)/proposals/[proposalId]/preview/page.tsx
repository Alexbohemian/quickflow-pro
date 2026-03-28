"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SignatureBlock } from "@/components/features/proposals/signature-block";
import { ArrowLeft, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProposalFull {
  id: string;
  title: string;
  type: string;
  status: string;
  client: { name: string } | null;
  sections: { id: string; title: string; type: string; content: unknown }[];
  pricing: { description: string; quantity: number; unitPrice: number; taxRate: number }[];
  timeline: { weekNumber: number; tasks: { taskCode: string; title: string; durationDays: number }[] }[];
  signatures: { signerName: string; signerRole: string; signedAt: string }[];
}

export default function ProposalPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;

  const { data: proposal, isLoading } = useQuery<ProposalFull>({
    queryKey: ["proposal", proposalId],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (!proposal) return null;

  const subtotal = proposal.pricing.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = proposal.pricing.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/proposals/${proposalId}/edit`)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Editor
        </Button>
        <Button onClick={() => router.push(`/proposals/${proposalId}/edit`)}>
          <Send className="h-4 w-4" />
          Send to Client
        </Button>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          {proposal.client && (
            <p className="mt-2 text-lg text-[var(--muted-foreground)]">
              Prepared for {proposal.client.name}
            </p>
          )}
          <Badge variant="outline" className="mt-2">
            {proposal.type === "BY_TIMELINE" ? "Timeline Project" : "By Hour"}
          </Badge>
        </div>

        {proposal.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="mb-4 border-b border-[var(--border)] pb-2 text-xl font-semibold">
              {section.title}
            </h2>

            {section.type === "RICH_TEXT" && (
              <div className="prose max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                {typeof section.content === "string"
                  ? section.content
                  : section.content
                    ? JSON.stringify(section.content)
                    : "No content yet."}
              </div>
            )}

            {section.type === "TIMELINE" && proposal.timeline.length > 0 && (
              <div className="space-y-4">
                {proposal.timeline.map((week) => (
                  <div key={week.weekNumber} className="rounded-lg border border-[var(--border)] p-4">
                    <h3 className="mb-2 font-semibold">Week {week.weekNumber}</h3>
                    <ul className="space-y-1">
                      {week.tasks.map((task) => (
                        <li key={task.taskCode} className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-xs font-bold text-[var(--primary)]">{task.taskCode}</span>
                          <span>{task.title}</span>
                          <Badge variant="outline" className="ml-auto">{task.durationDays}d</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {section.type === "PRICING" && proposal.pricing.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--muted)]">
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.pricing.map((item, i) => (
                      <tr key={i} className="border-t border-[var(--border)]">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--border)]">
                      <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(subtotal)}</td>
                    </tr>
                    <tr className="border-t border-[var(--border)]">
                      <td colSpan={3} className="px-4 py-2 text-right">Tax</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(taxTotal)}</td>
                    </tr>
                    <tr className="border-t-2 border-[var(--border)]">
                      <td colSpan={3} className="px-4 py-3 text-right text-lg font-bold">Total</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-[var(--primary)]">
                        {formatCurrency(subtotal + taxTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {section.type === "SIGNATURE" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <SignatureBlock label="Agency Signature" readOnly />
                <SignatureBlock label="Client Signature" readOnly />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
