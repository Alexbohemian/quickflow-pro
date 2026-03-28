import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { changeOrderSchema } from "@/lib/validators/projects";
import { apiSuccess, notFound, validationError } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const project = await prisma.project.findFirst({
    where: { id: params.projectId, workspaceId: ctx.workspaceId },
  });
  if (!project) return notFound("Project not found");

  const changeOrders = await prisma.changeOrder.findMany({
    where: { projectId: params.projectId },
    include: { pricing: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(changeOrders);
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const project = await prisma.project.findFirst({
    where: { id: params.projectId, workspaceId: ctx.workspaceId },
  });
  if (!project) return notFound("Project not found");

  const body = await request.json();
  const parsed = changeOrderSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const { pricing, ...rest } = parsed.data;

  const changeOrder = await prisma.changeOrder.create({
    data: {
      ...rest,
      projectId: params.projectId,
      pricing: pricing
        ? { create: pricing.map((item, i) => ({ ...item, position: i })) }
        : undefined,
    },
    include: { pricing: true },
  });

  return apiSuccess(changeOrder, 201);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "CLIENT"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
