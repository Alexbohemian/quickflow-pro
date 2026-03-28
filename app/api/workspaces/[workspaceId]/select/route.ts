import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, unauthorized, forbidden } from "@/lib/api/response";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { workspaceId } = await params;

  // Verify user is a member
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });

  if (!membership) return forbidden("Not a member of this workspace");

  // Update session with selected workspace
  await prisma.session.updateMany({
    where: { userId: session.user.id },
    data: { workspaceId },
  });

  return apiSuccess({ workspaceId });
}
