import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });
  if (!proposal) return notFound("Proposal not found");

  const weeks = await prisma.proposalTimelineWeek.findMany({
    where: { proposalId: params.proposalId },
    include: {
      tasks: { orderBy: { position: "asc" }, include: { dependsOn: { select: { id: true, taskCode: true } } } },
    },
    orderBy: { position: "asc" },
  });

  return apiSuccess(weeks);
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

  if (body.action === "addWeek") {
    const count = await prisma.proposalTimelineWeek.count({
      where: { proposalId: params.proposalId },
    });

    const week = await prisma.proposalTimelineWeek.create({
      data: {
        proposalId: params.proposalId,
        weekNumber: count + 1,
        position: count,
      },
      include: { tasks: true },
    });

    return apiSuccess(week, 201);
  }

  if (body.action === "addTask" && body.weekId) {
    const taskCount = await prisma.proposalTimelineTask.count({
      where: { weekId: body.weekId },
    });

    const task = await prisma.proposalTimelineTask.create({
      data: {
        weekId: body.weekId,
        taskCode: `T${taskCount + 1}`,
        title: body.title || `Task ${taskCount + 1}`,
        description: body.description || "",
        assignedTo: body.assignedTo,
        durationDays: body.durationDays || 1,
        dayStart: body.dayStart || 1,
        dependsOnId: body.dependsOnId,
        position: taskCount,
      },
    });

    return apiSuccess(task, 201);
  }

  if (body.action === "updateTask" && body.taskId) {
    const task = await prisma.proposalTimelineTask.update({
      where: { id: body.taskId },
      data: {
        title: body.title,
        description: body.description,
        assignedTo: body.assignedTo,
        durationDays: body.durationDays,
        dayStart: body.dayStart,
        dependsOnId: body.dependsOnId,
      },
    });

    return apiSuccess(task);
  }

  if (body.action === "deleteTask" && body.taskId) {
    await prisma.proposalTimelineTask.delete({ where: { id: body.taskId } });
    return apiSuccess({ message: "Task deleted" });
  }

  if (body.action === "deleteWeek" && body.weekId) {
    await prisma.proposalTimelineWeek.delete({ where: { id: body.weekId } });
    return apiSuccess({ message: "Week deleted" });
  }

  return apiSuccess({ message: "No action" });
}

export const GET = withAuth(["OWNER", "ADMIN", "PM"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
