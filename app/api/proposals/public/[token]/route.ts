import { prisma } from "@/lib/db";
import { apiSuccess, notFound, apiError } from "@/lib/api/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const proposal = await prisma.proposal.findUnique({
    where: { shareToken: token },
    include: {
      workspace: { select: { name: true } },
      sections: { orderBy: { position: "asc" } },
      pricing: { orderBy: { position: "asc" } },
      timeline: {
        orderBy: { position: "asc" },
        include: { tasks: { orderBy: { position: "asc" } } },
      },
      signatures: true,
    },
  });

  if (!proposal) return notFound("Proposal not found");

  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    return apiError("EXPIRED", "This proposal has expired", 410);
  }

  // Mark as viewed on first access
  if (proposal.status === "SENT" && !proposal.viewedAt) {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    });
  }

  return apiSuccess(proposal);
}
