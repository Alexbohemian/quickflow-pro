import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const project = await prisma.project.findFirst({
    where: { id: params.projectId, workspaceId: ctx.workspaceId },
  });
  if (!project) return notFound("Project not found");

  const requests = await prisma.maintenanceRequest.findMany({
    where: { projectId: params.projectId },
    orderBy: { createdAt: "desc" },
    include: {
      timeRecords: { select: { hours: true } },
    },
  });

  return apiSuccess(
    requests.map((r) => ({
      ...r,
      totalHours: r.timeRecords.reduce((s, t) => s + t.hours, 0),
    }))
  );
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

  const maintenanceRequest = await prisma.maintenanceRequest.create({
    data: {
      projectId: params.projectId,
      title: body.title,
      description: body.description,
      assignedTo: body.assignedTo,
      priority: body.priority || "MEDIUM",
    },
  });

  return apiSuccess(maintenanceRequest, 201);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "TEAM_MEMBER", "CLIENT"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM", "CLIENT"], handlePost);
