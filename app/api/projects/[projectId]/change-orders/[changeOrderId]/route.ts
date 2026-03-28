import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound, apiError } from "@/lib/api/response";

async function handlePatch(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const changeOrder = await prisma.changeOrder.findUnique({
    where: { id: params.changeOrderId },
    include: { project: { select: { workspaceId: true, id: true } } },
  });

  if (!changeOrder || changeOrder.project.workspaceId !== ctx.workspaceId) {
    return notFound("Change order not found");
  }

  const body = await request.json();

  // Send for approval
  if (body.action === "send") {
    if (changeOrder.status !== "DRAFT") {
      return apiError("INVALID_STATUS", "Only drafts can be sent", 400);
    }
    const updated = await prisma.changeOrder.update({
      where: { id: params.changeOrderId },
      data: { status: "PENDING_APPROVAL", sentAt: new Date() },
    });
    return apiSuccess(updated);
  }

  // Client approve
  if (body.action === "approve") {
    if (changeOrder.status !== "PENDING_APPROVAL") {
      return apiError("INVALID_STATUS", "Not pending approval", 400);
    }

    const updated = await prisma.changeOrder.update({
      where: { id: params.changeOrderId },
      data: { status: "APPROVED", respondedAt: new Date() },
      include: { pricing: true },
    });

    // Add pricing to next invoice cost (tracked in project)
    // TODO: Create timeline tasks from change order if applicable

    return apiSuccess(updated);
  }

  // Client reject
  if (body.action === "reject") {
    if (changeOrder.status !== "PENDING_APPROVAL") {
      return apiError("INVALID_STATUS", "Not pending approval", 400);
    }
    const updated = await prisma.changeOrder.update({
      where: { id: params.changeOrderId },
      data: { status: "REJECTED", respondedAt: new Date() },
    });
    return apiSuccess(updated);
  }

  return apiSuccess(changeOrder);
}

export const PATCH = withAuth(["OWNER", "ADMIN", "PM", "CLIENT"], handlePatch);
