import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const task = await prisma.timelineTask.findUnique({
    where: { id: params.taskId },
    include: {
      week: {
        include: {
          project: { select: { id: true, workspaceId: true, name: true } },
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          mentions: { include: { user: { select: { id: true, name: true } } } },
        },
      },
      penalties: true,
      dependsOn: { select: { id: true, taskCode: true, title: true } },
      dependents: { select: { id: true, taskCode: true, title: true } },
    },
  });

  if (!task) return notFound("Task not found");
  if (task.week.project.workspaceId !== ctx.workspaceId) {
    return notFound("Task not found");
  }

  return apiSuccess(task);
}

async function handlePatch(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const task = await prisma.timelineTask.findUnique({
    where: { id: params.taskId },
    include: { week: { include: { project: true } } },
  });

  if (!task || task.week.project.workspaceId !== ctx.workspaceId) {
    return notFound("Task not found");
  }

  const body = await request.json();

  const updated = await prisma.timelineTask.update({
    where: { id: params.taskId },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.status === "COMPLETED" ? { completedAt: new Date() } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
  });

  return apiSuccess(updated);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER", "CLIENT"],
  handleGet
);
export const PATCH = withAuth(
  ["OWNER", "ADMIN", "PM", "TEAM_MEMBER"],
  handlePatch
);
