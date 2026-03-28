import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { inviteMemberSchema } from "@/lib/validators/auth";
import { apiSuccess, validationError, apiError } from "@/lib/api/response";

async function handlePost(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();
  const parsed = inviteMemberSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const { email, role } = parsed.data;

  // Check if already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: existingUser.id,
          workspaceId: ctx.workspaceId,
        },
      },
    });
    if (existingMember) {
      return apiError("ALREADY_MEMBER", "This user is already a member", 409);
    }
  }

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId: ctx.workspaceId,
      email,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return apiSuccess(invitation, 201);
}

export const POST = withAuth(["OWNER", "ADMIN"], handlePost);
