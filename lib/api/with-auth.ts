import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized, forbidden } from "@/lib/api/response";
import type { WorkspaceRole } from "@prisma/client";

export interface AuthContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

type RouteHandler = (
  request: NextRequest,
  context: AuthContext,
  params: Record<string, string>
) => Promise<Response>;

/**
 * Wraps an API route handler with authentication and RBAC checks.
 */
export function withAuth(allowedRoles: WorkspaceRole[], handler: RouteHandler) {
  return async (
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<Record<string, string>> }
  ) => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const dbSession = await prisma.session.findFirst({
      where: { userId: session.user.id },
      orderBy: { expires: "desc" },
    });

    if (!dbSession?.workspaceId) {
      return unauthorized("No workspace selected");
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: dbSession.workspaceId,
        },
      },
    });

    if (!membership) return forbidden("Not a member of this workspace");

    if (!allowedRoles.includes(membership.role)) {
      return forbidden("Insufficient permissions");
    }

    const params = await paramsPromise;

    return handler(
      request,
      {
        userId: session.user.id,
        workspaceId: dbSession.workspaceId,
        role: membership.role,
      },
      params
    );
  };
}
