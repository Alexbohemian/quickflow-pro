import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { createLeadSchema } from "@/lib/validators/projects";
import { apiSuccess, validationError } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext
) {
  const leads = await prisma.lead.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: [{ stage: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    include: { client: { select: { id: true, name: true } } },
  });

  return apiSuccess(leads);
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();
  const parsed = createLeadSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      workspaceId: ctx.workspaceId,
    },
  });

  return apiSuccess(lead, 201);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
