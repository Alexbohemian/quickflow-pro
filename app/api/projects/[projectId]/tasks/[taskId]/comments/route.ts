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
    include: { week: { include: { project: { select: { workspaceId: true } } } } },
  });

  if (!task || task.week.project.workspaceId !== ctx.workspaceId) {
    return notFound("Task not found");
  }

  const comments = await prisma.taskComment.findMany({
    where: { taskId: params.taskId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      mentions: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(comments);
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const task = await prisma.timelineTask.findUnique({
    where: { id: params.taskId },
    include: { week: { include: { project: { select: { workspaceId: true } } } } },
  });

  if (!task || task.week.project.workspaceId !== ctx.workspaceId) {
    return notFound("Task not found");
  }

  const body = await request.json();

  const comment = await prisma.taskComment.create({
    data: {
      taskId: params.taskId,
      userId: ctx.userId,
      content: body.content,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return apiSuccess(comment, 201);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER", "CLIENT"],
  handleGet
);
export const POST = withAuth(
  ["OWNER", "ADMIN", "PM", "TEAM_MEMBER", "CLIENT"],
  handlePost
);
