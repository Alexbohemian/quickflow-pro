import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess } from "@/lib/api/response";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // TODO: Send email via SendGrid with reset link
    // For now, log the token in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset token for ${email}: ${token}`);
    }
  }

  return apiSuccess({ message: "If an account exists, a reset email has been sent" });
}
