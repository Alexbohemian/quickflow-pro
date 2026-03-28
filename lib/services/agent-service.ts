import { prisma } from "@/lib/db";
import { createNotification } from "./notification-service";

/**
 * AI Agent — Lite (MVP)
 * Runs as a cron job (Inngest or API route) every 15 minutes.
 * Checks all active projects for:
 * 1. Tasks due within 24 hours → remind assigned team member
 * 2. Expired tasks → notify PM + client + accrue penalty
 * 3. Daily penalty accumulation alerts
 */
export async function runAgentCheck() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Get all active projects with their tasks
  const activeProjects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: {
      timelineWeeks: {
        include: {
          tasks: {
            where: { status: { in: ["NOT_STARTED", "IN_PROGRESS"] } },
          },
        },
      },
      members: {
        include: { member: true },
      },
    },
  });

  const actions: string[] = [];

  for (const project of activeProjects) {
    const allTasks = project.timelineWeeks.flatMap((w) => w.tasks);

    for (const task of allTasks) {
      const taskEnd = task.currentEnd || task.originalEnd;

      // Task due within 24 hours
      if (taskEnd && taskEnd <= in24h && taskEnd > now && task.status !== "COMPLETED") {
        if (task.assignedTo) {
          // Find the user by name match (simplified)
          const member = project.members.find(
            (m) => m.member.userId === task.assignedTo
          );

          if (member) {
            await createNotification({
              workspaceId: project.workspaceId,
              userId: member.member.userId,
              type: "TASK_DUE",
              title: `Task ${task.taskCode} is due tomorrow`,
              body: `"${task.title}" in project "${project.name}" is due within 24 hours.`,
              link: `/projects/${project.id}/tasks/${task.id}`,
            });
            actions.push(`Reminder: ${task.taskCode} due soon`);
          }
        }
      }

      // Task expired
      if (taskEnd && taskEnd < now && !["COMPLETED", "EXPIRED"].includes(task.status)) {
        // Mark as expired
        await prisma.timelineTask.update({
          where: { id: task.id },
          data: { status: "EXPIRED" },
        });

        // Notify workspace admins
        const admins = project.members.filter((m) =>
          ["OWNER", "ADMIN", "PM"].includes(m.member.role)
        );

        for (const admin of admins) {
          await createNotification({
            workspaceId: project.workspaceId,
            userId: admin.member.userId,
            type: "TASK_EXPIRED",
            title: `Task ${task.taskCode} has expired`,
            body: `"${task.title}" in project "${project.name}" passed its deadline.`,
            link: `/projects/${project.id}/timeline`,
          });
        }

        // Accrue penalty
        if (project.penaltyPerDay && project.penaltyPerDay > 0) {
          const existing = await prisma.penaltyRecord.findFirst({
            where: { projectId: project.id, taskId: task.id },
          });

          if (existing) {
            await prisma.penaltyRecord.update({
              where: { id: existing.id },
              data: {
                daysAccrued: { increment: 1 },
                totalAmount: { increment: project.penaltyPerDay },
              },
            });
          } else {
            await prisma.penaltyRecord.create({
              data: {
                projectId: project.id,
                taskId: task.id,
                responsibleParty: "AGENCY",
                dailyRate: project.penaltyPerDay,
                daysAccrued: 1,
                totalAmount: project.penaltyPerDay,
              },
            });
          }
        }

        actions.push(`Expired: ${task.taskCode}`);
      }
    }
  }

  return {
    checkedProjects: activeProjects.length,
    actions,
    timestamp: now.toISOString(),
  };
}
