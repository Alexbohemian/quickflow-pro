import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess } from "@/lib/api/response";

async function handleGet(
  request: NextRequest,
  ctx: AuthContext
) {
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = {
    userId: ctx.userId,
    workspaceId: ctx.workspaceId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: ctx.userId, workspaceId: ctx.workspaceId, isRead: false },
    }),
  ]);

  return apiSuccess({ data, total, page, limit, unreadCount });
}

async function handlePatch(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();

  if (body.action === "markRead" && body.notificationId) {
    await prisma.notification.update({
      where: { id: body.notificationId },
      data: { isRead: true },
    });
    return apiSuccess({ message: "Marked as read" });
  }

  if (body.action === "markAllRead") {
    await prisma.notification.updateMany({
      where: { userId: ctx.userId, workspaceId: ctx.workspaceId, isRead: false },
      data: { isRead: true },
    });
    return apiSuccess({ message: "All marked as read" });
  }

  return apiSuccess({ message: "No action" });
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER", "CLIENT"],
  handleGet
);
export const PATCH = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE", "TEAM_MEMBER", "CLIENT"],
  handlePatch
);
