import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return apiError("INVALID_INPUT", "Token and password are required", 400);
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return apiError("INVALID_TOKEN", "This reset link is invalid or has expired", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { passwordHash },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  });

  return apiSuccess({ message: "Password has been reset" });
}
