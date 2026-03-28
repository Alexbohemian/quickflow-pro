import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, type AuthContext } from "@/lib/api/with-auth";
import { aiIntakeSchema } from "@/lib/validators/proposals";
import { apiSuccess, validationError } from "@/lib/api/response";

function generateIntroduction(data: Record<string, unknown>): string {
  return `We are excited to present this proposal for ${data.projectName}.

This ${data.projectType} project is designed to help you achieve your goals${data.goals ? `: ${data.goals}` : ""}.

${data.audience ? `Target Audience: ${data.audience}\n` : ""}
Our team will deliver a comprehensive solution leveraging our expertise in ${(data.services as string[])?.join(", ") || "our core services"}.

${data.features ? `Key deliverables include: ${data.features}` : ""}`;
}

function generateScope(data: Record<string, unknown>): string {
  const services = (data.services as string[]) || [];
  let scope = "## Scope of Work\n\n";

  scope += "This project encompasses the following services:\n\n";
  services.forEach((service, i) => {
    scope += `${i + 1}. **${service}**\n`;
    switch (service) {
      case "UI/UX Design":
        scope += "   - Wireframing and prototyping\n   - Visual design mockups\n   - Design system creation\n\n";
        break;
      case "Frontend Development":
        scope += "   - Responsive web development\n   - Cross-browser compatibility\n   - Performance optimization\n\n";
        break;
      case "Backend Development":
        scope += "   - API development\n   - Database design\n   - Server configuration\n\n";
        break;
      case "SEO":
        scope += "   - On-page optimization\n   - Technical SEO audit\n   - Keyword research\n\n";
        break;
      default:
        scope += `   - Comprehensive ${service.toLowerCase()} services\n\n`;
    }
  });

  return scope;
}

function generatePenaltyTerms(): string {
  return `## Penalty Terms

Both parties agree to the following accountability measures:

**Agency Delays:** If the agency fails to deliver any task by its scheduled completion date, a penalty of the agreed daily rate will be charged per business day of delay.

**Client Delays:** If the client fails to provide required materials, feedback, or approvals by the scheduled date, the same daily penalty rate applies, and the project timeline will be automatically adjusted.

Penalties are tracked per task and reflected in the final invoice. Both parties can view real-time penalty accrual through the project dashboard.`;
}

async function handlePost(
  request: NextRequest,
  ctx: AuthContext
) {
  const body = await request.json();
  const parsed = aiIntakeSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = fieldErrors[key] || [];
      fieldErrors[key].push(issue.message);
    }
    return validationError(fieldErrors);
  }

  const data = parsed.data;

  // Check if workspace has AI configured
  const aiConfig = await prisma.integrationConfig.findFirst({
    where: {
      workspaceId: ctx.workspaceId,
      provider: { in: ["ANTHROPIC", "OPENAI", "GOOGLE_AI"] },
      isActive: true,
    },
  });

  // Generate content using templates (AI API call would go here when configured)
  const introContent = generateIntroduction(data as unknown as Record<string, unknown>);
  const scopeContent = generateScope(data as unknown as Record<string, unknown>);
  const penaltyContent = generatePenaltyTerms();

  const type = data.engagementModel;
  const sections =
    type === "BY_TIMELINE"
      ? [
          { title: "Introduction", type: "RICH_TEXT" as const, content: introContent, position: 0 },
          { title: "Scope", type: "RICH_TEXT" as const, content: scopeContent, position: 1 },
          { title: "Timeline", type: "TIMELINE" as const, content: undefined, position: 2 },
          { title: "Pricing & Fees", type: "PRICING" as const, content: undefined, position: 3 },
          { title: "Terms", type: "RICH_TEXT" as const, content: "Standard terms and conditions apply. Full payment schedule and project milestones are outlined in the Pricing & Payment Terms sections.", position: 4 },
          { title: "Penalties", type: "PENALTY" as const, content: penaltyContent, position: 5 },
          { title: "Payment Terms", type: "RICH_TEXT" as const, content: data.paymentTerms || "Payment terms to be discussed and agreed upon.", position: 6 },
          { title: "Approvals", type: "SIGNATURE" as const, content: undefined, position: 7 },
        ]
      : [
          { title: "Introduction", type: "RICH_TEXT" as const, content: introContent, position: 0 },
          { title: "Scope", type: "RICH_TEXT" as const, content: scopeContent, position: 1 },
          { title: "Hours Configuration", type: "BY_HOURS_CONFIG" as const, content: undefined, position: 2 },
          { title: "Pricing & Fees", type: "PRICING" as const, content: undefined, position: 3 },
          { title: "Terms", type: "RICH_TEXT" as const, content: "Standard terms and conditions apply.", position: 4 },
          { title: "Payment Terms", type: "RICH_TEXT" as const, content: data.paymentTerms || "Payment terms to be discussed.", position: 5 },
          { title: "Approvals", type: "SIGNATURE" as const, content: undefined, position: 6 },
        ];

  const proposal = await prisma.proposal.create({
    data: {
      title: data.projectName,
      type,
      clientId: data.clientId || undefined,
      workspaceId: ctx.workspaceId,
      sections: { create: sections },
    },
    include: {
      sections: { orderBy: { position: "asc" } },
    },
  });

  // If AI is configured, we'd enhance the content here
  if (aiConfig) {
    // TODO: Call LLM API to enhance Introduction, Scope, and generate timeline tasks
    // For MVP, the template-generated content is used
  }

  return apiSuccess(proposal, 201);
}

export const POST = withAuth(["OWNER", "ADMIN", "PM"], handlePost);
