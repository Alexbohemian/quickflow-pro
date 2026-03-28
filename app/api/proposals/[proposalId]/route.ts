import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
    include: {
      sections: { orderBy: { position: "asc" } },
      client: { select: { id: true, name: true, email: true } },
      timeline: {
        orderBy: { position: "asc" },
        include: { tasks: { orderBy: { position: "asc" } } },
      },
      pricing: { orderBy: { position: "asc" } },
      signatures: true,
    },
  });

  if (!proposal) return notFound("Proposal not found");
  return apiSuccess(proposal);
}

async function handlePut(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Proposal not found");

  const body = await request.json();

  const proposal = await prisma.proposal.update({
    where: { id: params.proposalId },
    data: {
      title: body.title,
      clientId: body.clientId,
      byHourSub: body.byHourSub,
      hourlyRate: body.hourlyRate,
      monthlyHours: body.monthlyHours,
    },
    include: {
      sections: { orderBy: { position: "asc" } },
      client: true,
    },
  });

  return apiSuccess(proposal);
}

async function handleDelete(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Proposal not found");

  await prisma.proposal.delete({ where: { id: params.proposalId } });

  return apiSuccess({ message: "Proposal deleted" });
}

export const GET = withAuth(["OWNER", "ADMIN", "PM"], handleGet);
export const PUT = withAuth(["OWNER", "ADMIN", "PM"], handlePut);
export const DELETE = withAuth(["OWNER", "ADMIN", "PM"], handleDelete);
