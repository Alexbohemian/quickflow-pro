import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { createInvoiceSchema } from "@/lib/validators/projects";
import { apiSuccess, validationError } from "@/lib/api/response";

async function handleGet(
  request: NextRequest,
  ctx: AuthContext
) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where = {
    workspaceId: ctx.workspaceId,
    ...(status ? { status: status as never } : {}),
    ...(projectId ? { projectId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { lineItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return apiSuccess({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();
  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  // Generate invoice number
  const count = await prisma.invoice.count({
    where: { workspaceId: ctx.workspaceId },
  });
  const number = `INV-${String(count + 1).padStart(4, "0")}`;

  const { lineItems, ...rest } = parsed.data;

  const subtotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const taxTotal = lineItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice * (i.taxRate / 100),
    0
  );

  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      workspaceId: ctx.workspaceId,
      number,
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
      dueDate: rest.dueDate ? new Date(rest.dueDate) : undefined,
      lineItems: {
        create: lineItems.map((item, i) => ({
          ...item,
          position: i,
        })),
      },
    },
    include: { lineItems: true, project: { select: { id: true, name: true } } },
  });

  return apiSuccess(invoice, 201);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "FINANCE"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM", "FINANCE"], handlePost);
