import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, unauthorized, apiError } from "@/lib/api/response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { token } = await params;

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return apiError("NOT_FOUND", "Invitation not found", 404);
  }

  if (invitation.acceptedAt) {
    return apiError("ALREADY_ACCEPTED", "This invitation has already been accepted", 400);
  }

  if (invitation.expiresAt < new Date()) {
    return apiError("EXPIRED", "This invitation has expired", 400);
  }

  if (invitation.email !== session.user.email) {
    return apiError("EMAIL_MISMATCH", "This invitation was sent to a different email", 403);
  }

  // Create membership and mark invitation as accepted
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        userId: session.user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return apiSuccess({ workspaceId: invitation.workspaceId });
}
