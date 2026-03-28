import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { createClientSchema } from "@/lib/validators/projects";
import { apiSuccess, notFound, validationError } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const client = await prisma.client.findFirst({
    where: { id: params.clientId, workspaceId: ctx.workspaceId },
    include: {
      contacts: true,
      projects: { select: { id: true, name: true, status: true, type: true } },
      proposals: { select: { id: true, title: true, status: true, type: true } },
    },
  });

  if (!client) return notFound("Client not found");
  return apiSuccess(client);
}

async function handlePut(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.client.findFirst({
    where: { id: params.clientId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Client not found");

  const body = await request.json();
  const parsed = createClientSchema.partial().safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const client = await prisma.client.update({
    where: { id: params.clientId },
    data: parsed.data,
    include: { contacts: true },
  });

  return apiSuccess(client);
}

async function handleDelete(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.client.findFirst({
    where: { id: params.clientId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Client not found");

  await prisma.client.update({
    where: { id: params.clientId },
    data: { isActive: false },
  });

  return apiSuccess({ message: "Client deactivated" });
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "FINANCE"], handleGet);
export const PUT = withAuth(["OWNER", "ADMIN", "PM"], handlePut);
export const DELETE = withAuth(["OWNER", "ADMIN"], handleDelete);
