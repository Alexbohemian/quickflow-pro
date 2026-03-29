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
 * Resolves workspace from the user's first membership (or cookie override).
 */
export function withAuth(allowedRoles: WorkspaceRole[], handler: RouteHandler) {
  return async (
    request: NextRequest,
    { params: paramsPromise }: { params: Promise<Record<string, string>> }
  ) => {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    // Get workspace from cookie or fall back to user's first membership
    const workspaceIdFromCookie = request.cookies.get("quickflow-workspace")?.value;

    let workspaceId: string | null = workspaceIdFromCookie || null;

    if (!workspaceId) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id },
        orderBy: { joinedAt: "asc" },
        select: { workspaceId: true },
      });
      workspaceId = membership?.workspaceId || null;
    }

    if (!workspaceId) {
      return unauthorized("No workspace found. Create or join a workspace first.");
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
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
        workspaceId,
        role: membership.role,
      },
      params
    );
  };
}
