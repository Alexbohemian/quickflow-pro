import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { inviteMemberSchema } from "@/lib/validators/auth";
import {
  apiSuccess,
  unauthorized,
  forbidden,
  validationError,
  apiError,
} from "@/lib/api/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { workspaceId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId },
    },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return forbidden("Only admins can invite members");
  }

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
        userId_workspaceId: { userId: existingUser.id, workspaceId },
      },
    });
    if (existingMember) {
      return apiError("ALREADY_MEMBER", "This user is already a member", 409);
    }
  }

  // Check if already invited
  const existingInvite = await prisma.workspaceInvitation.findFirst({
    where: { workspaceId, email, acceptedAt: null },
  });
  if (existingInvite) {
    return apiError("ALREADY_INVITED", "An invitation is already pending for this email", 409);
  }

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // TODO: Send invitation email via SendGrid
  if (process.env.NODE_ENV === "development") {
    console.log(`Invitation for ${email}: /api/invitations/${invitation.token}/accept`);
  }

  return apiSuccess(invitation, 201);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { workspaceId } = await params;

  const invitations = await prisma.workspaceInvitation.findMany({
    where: { workspaceId, acceptedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(invitations);
}
