import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess } from "@/lib/api/response";

async function handleGet(
  request: NextRequest,
  ctx: AuthContext
) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where = {
    workspaceId: ctx.workspaceId,
    ...(status ? { status: status as never } : {}),
    ...(type ? { type: type as never } : {}),
  };

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { timelineWeeks: true, invoices: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return apiSuccess(projects);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER"],
  handleGet
);
