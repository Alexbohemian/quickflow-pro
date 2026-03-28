import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { WorkspaceRole } from "@prisma/client";

interface WorkspaceContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

/**
 * Resolves the current user's workspace context from the session.
 * Returns null if unauthenticated or no workspace selected.
 */
export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Get the user's active session to find workspaceId
  const dbSession = await prisma.session.findFirst({
    where: { userId: session.user.id },
    orderBy: { expires: "desc" },
  });

  if (!dbSession?.workspaceId) return null;

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: dbSession.workspaceId,
      },
    },
  });

  if (!membership) return null;

  return {
    userId: session.user.id,
    workspaceId: dbSession.workspaceId,
    role: membership.role,
  };
}

/**
 * Checks if the user has one of the required roles.
 */
export function hasRole(
  userRole: WorkspaceRole,
  allowedRoles: WorkspaceRole[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Role hierarchy: OWNER > ADMIN > PM > FINANCE > TEAM_MEMBER > CLIENT
 */
const roleHierarchy: Record<WorkspaceRole, number> = {
  OWNER: 100,
  ADMIN: 90,
  PM: 70,
  FINANCE: 60,
  TEAM_MEMBER: 40,
  CLIENT: 10,
};

export function hasMinRole(
  userRole: WorkspaceRole,
  minRole: WorkspaceRole
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}
