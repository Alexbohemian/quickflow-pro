import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { createProposalSchema } from "@/lib/validators/proposals";
import { apiSuccess, validationError } from "@/lib/api/response";

async function handleGet(
  request: NextRequest,
  ctx: AuthContext
) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where = {
    workspaceId: ctx.workspaceId,
    ...(status ? { status: status as never } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { sections: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.proposal.count({ where }),
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
  const parsed = createProposalSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const { type, byHourSub, hourlyRate, monthlyHours, ...rest } = parsed.data;

  // Create proposal with default sections based on type
  const defaultSections =
    type === "BY_TIMELINE"
      ? [
          { title: "Introduction", type: "RICH_TEXT" as const, position: 0 },
          { title: "Scope", type: "RICH_TEXT" as const, position: 1 },
          { title: "Timeline", type: "TIMELINE" as const, position: 2 },
          { title: "Pricing & Fees", type: "PRICING" as const, position: 3 },
          { title: "Terms", type: "RICH_TEXT" as const, position: 4 },
          { title: "Penalties", type: "PENALTY" as const, position: 5 },
          { title: "Payment Terms", type: "RICH_TEXT" as const, position: 6 },
          { title: "Approvals", type: "SIGNATURE" as const, position: 7 },
        ]
      : [
          { title: "Introduction", type: "RICH_TEXT" as const, position: 0 },
          { title: "Scope", type: "RICH_TEXT" as const, position: 1 },
          { title: "Hours Configuration", type: "BY_HOURS_CONFIG" as const, position: 2 },
          { title: "Pricing & Fees", type: "PRICING" as const, position: 3 },
          { title: "Terms", type: "RICH_TEXT" as const, position: 4 },
          { title: "Payment Terms", type: "RICH_TEXT" as const, position: 5 },
          { title: "Approvals", type: "SIGNATURE" as const, position: 6 },
        ];

  const proposal = await prisma.proposal.create({
    data: {
      ...rest,
      type,
      byHourSub,
      hourlyRate,
      monthlyHours,
      workspaceId: ctx.workspaceId,
      sections: {
        create: defaultSections,
      },
    },
    include: {
      sections: { orderBy: { position: "asc" } },
      client: { select: { id: true, name: true } },
    },
  });

  return apiSuccess(proposal, 201);
}

export const GET = withAuth(["OWNER", "ADMIN", "PM"], handleGet);
export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
