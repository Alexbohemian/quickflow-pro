import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound } from "@/lib/api/response";
import { addBusinessDays } from "@/lib/utils";

async function handlePost(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const project = await prisma.project.findFirst({
    where: { id: params.projectId, workspaceId: ctx.workspaceId },
    include: {
      timelineWeeks: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: { dependsOn: true },
          },
        },
      },
    },
  });

  if (!project) return notFound("Project not found");

  const allTasks = project.timelineWeeks.flatMap((w) => w.tasks);
  let adjustmentsCount = 0;

  // Find expired tasks and cascade delays
  for (const task of allTasks) {
    const isExpiredOrOverdue = task.status === "EXPIRED" || (task.currentEnd && task.currentEnd < new Date() && !["COMPLETED", "EXPIRED"].includes(task.status));
    if (isExpiredOrOverdue) {
      // Mark as expired
      if (!["EXPIRED", "COMPLETED"].includes(task.status)) {
        await prisma.timelineTask.update({
          where: { id: task.id },
          data: { status: "EXPIRED" },
        });
      }

      // Find dependent tasks and push them forward
      const dependents = allTasks.filter((t) => t.dependsOnId === task.id);
      for (const dep of dependents) {
        if (dep.status === "COMPLETED") continue;

        const delayDays = 1; // Push by 1 business day per cascade run
        const newStart = dep.currentStart
          ? addBusinessDays(dep.currentStart, delayDays)
          : addBusinessDays(new Date(), delayDays);
        const newEnd = addBusinessDays(newStart, dep.durationDays);

        await prisma.timelineTask.update({
          where: { id: dep.id },
          data: {
            currentStart: newStart,
            currentEnd: newEnd,
          },
        });
        adjustmentsCount++;
      }

      // Create penalty record if project has penalty config
      if (project.penaltyPerDay && project.penaltyPerDay > 0) {
        const existingPenalty = await prisma.penaltyRecord.findFirst({
          where: { projectId: project.id, taskId: task.id },
        });

        if (existingPenalty) {
          await prisma.penaltyRecord.update({
            where: { id: existingPenalty.id },
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
    }
  }

  // Recalculate project end date
  const latestEnd = allTasks.reduce((latest, task) => {
    const end = task.currentEnd || task.originalEnd;
    return end && end > latest ? end : latest;
  }, new Date());

  await prisma.project.update({
    where: { id: project.id },
    data: { endDate: latestEnd },
  });

  return apiSuccess({
    message: `Timeline adjusted. ${adjustmentsCount} task(s) shifted.`,
    adjustmentsCount,
  });
}

export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
