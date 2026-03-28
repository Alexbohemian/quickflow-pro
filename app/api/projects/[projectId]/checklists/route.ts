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

  const checklists = await prisma.projectChecklist.findMany({
    where: { projectId: params.projectId },
    include: { items: { orderBy: { position: "asc" } } },
  });

  // Auto-create default checklist if none exists
  if (checklists.length === 0) {
    const checklist = await prisma.projectChecklist.create({
      data: {
        projectId: params.projectId,
        name: "QA Checklist",
      },
      include: { items: true },
    });
    return apiSuccess([checklist]);
  }

  return apiSuccess(checklists);
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

  if (body.action === "addItem") {
    let checklist = await prisma.projectChecklist.findFirst({
      where: { projectId: params.projectId },
    });

    if (!checklist) {
      checklist = await prisma.projectChecklist.create({
        data: { projectId: params.projectId, name: "QA Checklist" },
      });
    }

    const count = await prisma.checklistItem.count({
      where: { checklistId: checklist.id },
    });

    const item = await prisma.checklistItem.create({
      data: {
        checklistId: checklist.id,
        text: body.text,
        position: count,
      },
    });

    return apiSuccess(item, 201);
  }

  if (body.action === "toggle" && body.itemId) {
    const item = await prisma.checklistItem.update({
      where: { id: body.itemId },
      data: {
        isChecked: body.isChecked,
        checkedAt: body.isChecked ? new Date() : null,
      },
    });
    return apiSuccess(item);
  }

  return apiSuccess({ message: "No action" });
}

export const GET = withAuth(["OWNER", "ADMIN", "PM", "TEAM_MEMBER"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM", "TEAM_MEMBER"], handlePost);
