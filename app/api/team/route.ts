import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess } from "@/lib/api/response";

async function handleGet(
  _request: NextRequest,
  ctx: AuthContext
) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return apiSuccess(members);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER"],
  handleGet
);
