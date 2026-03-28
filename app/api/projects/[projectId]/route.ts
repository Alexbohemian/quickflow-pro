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
    include: {
      client: { select: { id: true, name: true, email: true } },
      proposal: { select: { id: true, title: true, snapshotJson: true } },
      members: {
        include: {
          member: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
      },
      timelineWeeks: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              penalties: true,
              _count: { select: { comments: true } },
            },
          },
        },
      },
      _count: { select: { invoices: true, changeOrders: true, files: true } },
    },
  });

  if (!project) return notFound("Project not found");
  return apiSuccess(project);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER", "CLIENT"],
  handleGet
);
