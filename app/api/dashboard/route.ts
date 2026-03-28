import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext
) {
  const [
    activeProjects,
    openProposals,
    clientCount,
    pendingInvoices,
    recentTasks,
  ] = await Promise.all([
    prisma.project.count({
      where: { workspaceId: ctx.workspaceId, status: "ACTIVE" },
    }),
    prisma.proposal.count({
      where: {
        workspaceId: ctx.workspaceId,
        status: { in: ["DRAFT", "SENT", "VIEWED"] },
      },
    }),
    prisma.client.count({
      where: { workspaceId: ctx.workspaceId, isActive: true },
    }),
    prisma.invoice.count({
      where: {
        workspaceId: ctx.workspaceId,
        status: { in: ["DRAFT", "SENT", "OVERDUE"] },
      },
    }),
    prisma.timelineTask.findMany({
      where: {
        week: { project: { workspaceId: ctx.workspaceId, status: "ACTIVE" } },
        status: "IN_PROGRESS",
      },
      include: {
        week: {
          include: {
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { currentEnd: "asc" },
      take: 10,
    }),
  ]);

  return apiSuccess({
    stats: {
      activeProjects,
      openProposals,
      clientCount,
      pendingInvoices,
    },
    inProgressTasks: recentTasks.map((t) => ({
      id: t.id,
      taskCode: t.taskCode,
      title: t.title,
      status: t.status,
      projectId: t.week.project.id,
      projectName: t.week.project.name,
    })),
  });
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER"],
  handleGet
);
