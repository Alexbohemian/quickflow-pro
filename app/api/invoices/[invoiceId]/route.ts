import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, workspaceId: ctx.workspaceId },
    include: {
      lineItems: { orderBy: { position: "asc" } },
      project: { select: { id: true, name: true, status: true } },
      payments: true,
    },
  });

  if (!invoice) return notFound("Invoice not found");
  return apiSuccess(invoice);
}

async function handlePatch(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, workspaceId: ctx.workspaceId },
  });

  if (!invoice) return notFound("Invoice not found");

  const body = await request.json();

  // Mark as paid
  if (body.action === "markPaid") {
    const updated = await prisma.invoice.update({
      where: { id: params.invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // If invoice has a project in PENDING_PAYMENT, activate it
    if (invoice.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: invoice.projectId },
      });

      if (project?.status === "PENDING_PAYMENT") {
        await prisma.project.update({
          where: { id: invoice.projectId },
          data: { status: "ACTIVE", startDate: new Date() },
        });
      }
    }

    return apiSuccess(updated);
  }

  // Send invoice
  if (body.action === "send") {
    const shareToken =
      invoice.shareToken ||
      crypto.randomUUID();

    const updated = await prisma.invoice.update({
      where: { id: params.invoiceId },
      data: { status: "SENT", shareToken },
    });

    return apiSuccess(updated);
  }

  return apiSuccess(invoice);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "FINANCE"], handleGet);
export const PATCH = withAuth(["OWNER", "ADMIN", "PM", "FINANCE"], handlePatch);
