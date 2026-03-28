import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { proposalSectionSchema } from "@/lib/validators/proposals";
import { apiSuccess, notFound, validationError } from "@/lib/api/response";

async function handlePost(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });

  if (!proposal) return notFound("Proposal not found");

  const body = await request.json();
  const parsed = proposalSectionSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const section = await prisma.proposalSection.create({
    data: {
      ...parsed.data,
      proposalId: params.proposalId,
    },
  });

  return apiSuccess(section, 201);
}

async function handlePut(
  request: NextRequest,
  ctx: AuthContext,
  params: Record<string, string>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: params.proposalId, workspaceId: ctx.workspaceId },
  });

  if (!proposal) return notFound("Proposal not found");

  const body = await request.json();

  // Batch update sections (for reordering or content saves)
  if (Array.isArray(body.sections)) {
    const updates = body.sections.map(
      (s: { id: string; content?: string; position?: number; title?: string }) => {
        const data: Record<string, unknown> = {};
        if (s.content !== undefined) data.content = s.content;
        if (s.position !== undefined) data.position = s.position;
        if (s.title !== undefined) data.title = s.title;
        return prisma.proposalSection.update({
          where: { id: s.id },
          data,
        });
      }
    );

    await prisma.$transaction(updates);

    const sections = await prisma.proposalSection.findMany({
      where: { proposalId: params.proposalId },
      orderBy: { position: "asc" },
    });

    return apiSuccess(sections);
  }

  return apiSuccess({ message: "No updates" });
}

export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
export const PUT = withAuth(["OWNER", "ADMIN", "PM"], handlePut);
