import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createWorkspaceSchema } from "@/lib/validators/auth";
import {
  apiSuccess,
  unauthorized,
  validationError,
  apiError,
} from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const { name, slug } = parsed.data;

  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) {
    return apiError("SLUG_TAKEN", "This workspace URL is already taken", 409);
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
    include: { members: true },
  });

  // Set workspace in the user's session
  await prisma.session.updateMany({
    where: { userId: session.user.id },
    data: { workspaceId: workspace.id },
  });

  return apiSuccess(workspace, 201);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
            take: 5,
          },
          _count: { select: { members: true } },
        },
      },
    },
  });

  const workspaces = memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
    memberCount: m.workspace._count.members,
  }));

  return apiSuccess(workspaces);
}
