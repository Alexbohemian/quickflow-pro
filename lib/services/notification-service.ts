import { prisma } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      channel: "IN_APP",
    },
  });
}

export async function notifyProjectMembers(
  projectId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string,
  excludeUserId?: string
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { member: true } },
    },
  });

  if (!project) return;

  const notifications = project.members
    .filter((m) => m.member.userId !== excludeUserId)
    .map((m) => ({
      workspaceId: project.workspaceId,
      userId: m.member.userId,
      type,
      title,
      body,
      link,
      channel: "IN_APP" as const,
    }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}

export async function notifyWorkspaceAdmins(
  workspaceId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string
) {
  const admins = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      role: { in: ["OWNER", "ADMIN", "PM"] },
    },
  });

  const notifications = admins.map((m) => ({
    workspaceId,
    userId: m.userId,
    type,
    title,
    body,
    link,
    channel: "IN_APP" as const,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}
