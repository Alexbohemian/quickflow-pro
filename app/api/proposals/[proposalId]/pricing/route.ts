import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { pricingItemSchema } from "@/lib/validators/proposals";
import { apiSuccess, notFound, validationError } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });
  if (!proposal) return notFound("Proposal not found");

  const items = await prisma.proposalPricingItem.findMany({
    where: { proposalId: params.proposalId },
    orderBy: { position: "asc" },
  });

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice * (i.taxRate / 100),
    0
  );

  return apiSuccess({ items, subtotal, taxTotal, total: subtotal + taxTotal });
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });
  if (!proposal) return notFound("Proposal not found");

  const body = await request.json();

  if (body.action === "add") {
    const parsed = pricingItemSchema.safeParse(body.item);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return validationError(fieldErrors);
    }

    const count = await prisma.proposalPricingItem.count({
      where: { proposalId: params.proposalId },
    });

    const item = await prisma.proposalPricingItem.create({
      data: {
        ...parsed.data,
        proposalId: params.proposalId,
        position: count,
      },
    });

    return apiSuccess(item, 201);
  }

  if (body.action === "update" && body.itemId) {
    const item = await prisma.proposalPricingItem.update({
      where: { id: body.itemId },
      data: {
        description: body.description,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        taxRate: body.taxRate,
      },
    });

    return apiSuccess(item);
  }

  if (body.action === "delete" && body.itemId) {
    await prisma.proposalPricingItem.delete({ where: { id: body.itemId } });
    return apiSuccess({ message: "Item deleted" });
  }

  return apiSuccess({ message: "No action" });
}

export const GET = withAuth(["OWNER", "ADMIN", "PM"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
