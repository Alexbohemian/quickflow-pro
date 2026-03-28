import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, notFound, apiError } from "@/lib/api/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { signerName, signerEmail } = await request.json();

  if (!signerName) {
    return apiError("INVALID_INPUT", "Signer name is required", 400);
  }

  const proposal = await prisma.proposal.findUnique({
    where: { shareToken: token },
  });

  if (!proposal) return notFound("Proposal not found");

  if (proposal.expiresAt && proposal.expiresAt < new Date()) {
    return apiError("EXPIRED", "This proposal has expired", 410);
  }

  if (proposal.status === "APPROVED") {
    return apiError("ALREADY_APPROVED", "This proposal has already been approved", 400);
  }

  // Get client IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  await prisma.$transaction([
    prisma.proposalSignature.create({
      data: {
        proposalId: proposal.id,
        signerName,
        signerEmail: signerEmail || "",
        signerRole: "client",
        signatureData: signerName, // Type-to-sign
        ipAddress: ip,
      },
    }),
    prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: "APPROVED",
        signedAt: new Date(),
      },
    }),
  ]);

  return apiSuccess({ message: "Proposal approved and signed" });
}
