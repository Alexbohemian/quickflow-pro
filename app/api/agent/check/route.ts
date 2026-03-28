import { NextRequest } from "next/server";
import { runAgentCheck } from "@/lib/services/agent-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * AI Agent check endpoint.
 * In production, this would be triggered by Inngest cron every 15 minutes.
 * For MVP, it can be called manually or via a simple cron.
 *
 * Authorization: requires a secret header to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-agent-secret");

  if (
    process.env.AGENT_SECRET &&
    authHeader !== process.env.AGENT_SECRET
  ) {
    return apiError("UNAUTHORIZED", "Invalid agent secret", 401);
  }

  const result = await runAgentCheck();

  return apiSuccess(result);
}

// Also allow GET for manual testing in development
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return apiError("FORBIDDEN", "Only available in development", 403);
  }

  const result = await runAgentCheck();
  return apiSuccess(result);
}
