import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound, apiError } from "@/lib/api/response";

async function handlePost(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
    include: {
      client: true,
      sections: true,
      pricing: true,
      timeline: { include: { tasks: true } },
    },
  });

  if (!proposal) return notFound("Proposal not found");

  if (proposal.status !== "DRAFT") {
    return apiError("ALREADY_SENT", "This proposal has already been sent", 400);
  }

  const body = await request.json();
  const clientEmail = body.email || proposal.client?.email;

  if (!clientEmail) {
    return apiError("NO_EMAIL", "Client email is required to send the proposal", 400);
  }

  // Generate unique share token
  const shareToken = crypto.randomBytes(16).toString("hex");

  // Create immutable snapshot of the proposal
  const snapshot = {
    title: proposal.title,
    type: proposal.type,
    sections: proposal.sections,
    pricing: proposal.pricing,
    timeline: proposal.timeline,
    sentAt: new Date().toISOString(),
  };

  const updated = await prisma.proposal.update({
    where: { id: params.proposalId },
    data: {
      status: "SENT",
      shareToken,
      sentAt: new Date(),
      snapshotJson: snapshot,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // TODO: Send email via SendGrid with link /proposals/{shareToken}
  const proposalUrl = `${process.env.NEXTAUTH_URL}/proposals/${shareToken}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`Proposal sent to ${clientEmail}: ${proposalUrl}`);
  }

  return apiSuccess({
    ...updated,
    shareUrl: proposalUrl,
  });
}

export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
