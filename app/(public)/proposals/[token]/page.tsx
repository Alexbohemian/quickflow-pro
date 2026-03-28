"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SignatureBlock } from "@/components/features/proposals/signature-block";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PublicProposal {
  id: string;
  title: string;
  type: string;
  status: string;
  sections: { id: string; title: string; type: string; content: unknown }[];
  pricing: { description: string; quantity: number; unitPrice: number; taxRate: number }[];
  timeline: { weekNumber: number; tasks: { taskCode: string; title: string; durationDays: number }[] }[];
  signatures: { signerName: string; signerRole: string; signedAt: string }[];
  workspace: { name: string };
}

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;

  const { data: proposal, isLoading, error } = useQuery<PublicProposal>({
    queryKey: ["public-proposal", token],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/public/${token}`);
      if (!res.ok) throw new Error("Proposal not found");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (signerName: string) => {
      const res = await fetch(`/api/proposals/public/${token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => toast.success("Proposal approved and signed!"),
    onError: () => toast.error("Failed to approve proposal"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (error || !proposal) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold">Proposal Not Found</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          This proposal link may be invalid or expired.
        </p>
      </div>
    );
  }

  const subtotal = proposal.pricing.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = proposal.pricing.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const agencySig = proposal.signatures.find((s) => s.signerRole === "agency");
  const clientSig = proposal.signatures.find((s) => s.signerRole === "client");

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-sm">
      <div className="mb-2 text-sm text-[var(--muted-foreground)]">
        From {proposal.workspace.name}
      </div>
      <h1 className="mb-2 text-3xl font-bold">{proposal.title}</h1>
      <div className="mb-8 flex gap-2">
        <Badge>{proposal.status}</Badge>
        <Badge variant="outline">
          {proposal.type === "BY_TIMELINE" ? "Timeline" : "By Hour"}
        </Badge>
      </div>

      {proposal.sections.map((section) => (
        <div key={section.id} className="mb-8">
          <h2 className="mb-4 border-b border-[var(--border)] pb-2 text-xl font-semibold">
            {section.title}
          </h2>

          {section.type === "RICH_TEXT" && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {typeof section.content === "string" ? section.content : ""}
            </div>
          )}

          {section.type === "TIMELINE" && proposal.timeline.length > 0 && (
            <div className="space-y-3">
              {proposal.timeline.map((week) => (
                <div key={week.weekNumber} className="rounded-lg border border-[var(--border)] p-4">
                  <h3 className="mb-2 font-semibold">Week {week.weekNumber}</h3>
                  <ul className="space-y-1">
                    {week.tasks.map((t) => (
                      <li key={t.taskCode} className="flex gap-2 text-sm">
                        <span className="font-mono font-bold text-[var(--primary)]">{t.taskCode}</span>
                        <span>{t.title}</span>
                        <Badge variant="outline" className="ml-auto">{t.durationDays}d</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {section.type === "PRICING" && proposal.pricing.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.pricing.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 text-right font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)]">
                  <td colSpan={3} className="py-2 text-right font-bold">Total</td>
                  <td className="py-2 text-right font-bold text-[var(--primary)]">
                    {formatCurrency(subtotal + taxTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          {section.type === "SIGNATURE" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <SignatureBlock
                label="Agency Signature"
                signed={agencySig ? { name: agencySig.signerName, signedAt: agencySig.signedAt } : undefined}
                readOnly
              />
              <SignatureBlock
                label="Client Signature"
                signed={clientSig ? { name: clientSig.signerName, signedAt: clientSig.signedAt } : undefined}
                onSign={(name) => approveMutation.mutate(name)}
                readOnly={proposal.status === "APPROVED"}
              />
            </div>
          )}
        </div>
      ))}

      {proposal.status === "SENT" && (
        <div className="mt-8 flex gap-4 border-t border-[var(--border)] pt-6">
          <Button variant="outline" className="flex-1">
            Request Changes
          </Button>
          <Button className="flex-1" onClick={() => {
            const sigSection = document.querySelector('[data-section="signature"]');
            sigSection?.scrollIntoView({ behavior: "smooth" });
          }}>
            Approve &amp; Sign
          </Button>
        </div>
      )}
    </div>
  );
}
