import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { createClientSchema } from "@/lib/validators/projects";
import { apiSuccess, validationError } from "@/lib/api/response";

async function handleGet(
  request: NextRequest,
  ctx: AuthContext
) {
  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("active");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where = {
    workspaceId: ctx.workspaceId,
    ...(isActive !== null ? { isActive: isActive !== "false" } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        _count: { select: { projects: true, proposals: true } },
        contacts: { where: { primary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return apiSuccess({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();
  const parsed = createClientSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      workspaceId: ctx.workspaceId,
      contacts: parsed.data.email
        ? {
            create: {
              name: parsed.data.name,
              email: parsed.data.email,
              phone: parsed.data.phone,
              primary: true,
            },
          }
        : undefined,
    },
    include: { contacts: true },
  });

  return apiSuccess(client, 201);
}

export const GET = withAuth(
  ["OWNER", "ADMIN", "PM", "FINANCE"],
  handleGet
);

export const POST = withAuth(
  ["OWNER", "ADMIN", "PM"],
  handlePost
);
