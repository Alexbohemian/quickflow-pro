import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { apiSuccess, notFound, apiError } from "@/lib/api/response";

async function handlePost(
  _request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
    include: {
      timeline: { include: { tasks: true } },
      pricing: true,
      sections: { where: { type: "PENALTY" } },
    },
  });

  if (!proposal) return notFound("Proposal not found");

  if (proposal.status !== "APPROVED") {
    return apiError("NOT_APPROVED", "Only approved proposals can be converted to projects", 400);
  }

  // Check if already converted
  const existingProject = await prisma.project.findUnique({
    where: { proposalId: proposal.id },
  });

  if (existingProject) {
    return apiError("ALREADY_CONVERTED", "This proposal has already been converted", 400);
  }

  // Create project with timeline copied from proposal
  const project = await prisma.project.create({
    data: {
      workspaceId: ctx.workspaceId,
      proposalId: proposal.id,
      clientId: proposal.clientId,
      name: proposal.title,
      type: proposal.type,
      status: "PENDING_PAYMENT",
      byHourSub: proposal.byHourSub,
      hourlyRate: proposal.hourlyRate,
      monthlyHours: proposal.monthlyHours,
      penaltyPerDay: 0, // Will be set from penalty section
      timelineWeeks:
        proposal.type === "BY_TIMELINE"
          ? {
              create: proposal.timeline.map((week) => ({
                weekNumber: week.weekNumber,
                startDate: week.startDate || new Date(),
                endDate: week.endDate || new Date(),
                position: week.position,
                tasks: {
                  create: week.tasks.map((task) => ({
                    taskCode: task.taskCode,
                    title: task.title,
                    description: task.description,
                    assignedTo: task.assignedTo,
                    durationDays: task.durationDays,
                    dayStart: task.dayStart,
                    position: task.position,
                    status: "NOT_STARTED",
                  })),
                },
              })),
            }
          : undefined,
    },
    include: {
      timelineWeeks: { include: { tasks: true } },
    },
  });

  return apiSuccess(project, 201);
}

export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
