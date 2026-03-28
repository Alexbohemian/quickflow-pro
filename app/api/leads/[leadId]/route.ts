import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { updateLeadStageSchema } from "@/lib/validators/projects";
import { apiSuccess, notFound, validationError } from "@/lib/api/response";

async function handlePatch(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.lead.findFirst({
    where: { id: params.leadId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Lead not found");

  const body = await request.json();
  const parsed = updateLeadStageSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const lead = await prisma.lead.update({
    where: { id: params.leadId },
    data: parsed.data,
  });

  return apiSuccess(lead);
}

async function handleDelete(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const existing = await prisma.lead.findFirst({
    where: { id: params.leadId, workspaceId: ctx.workspaceId },
  });

  if (!existing) return notFound("Lead not found");

  await prisma.lead.delete({ where: { id: params.leadId } });

  return apiSuccess({ message: "Lead deleted" });
}

export const PATCH = withAuth(["OWNER", "ADMIN", "PM"], handlePatch);
export const DELETE = withAuth(["OWNER", "ADMIN", "PM"], handleDelete);
