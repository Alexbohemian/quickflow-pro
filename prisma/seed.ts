import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("Password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@quickflow.com" },
    update: {},
    create: {
      email: "demo@quickflow.com",
      name: "Demo User",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "second-crew" },
    update: {},
    create: {
      name: "Second Crew",
      slug: "second-crew",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log(`Created user: ${user.email}`);
  console.log(`Created workspace: ${workspace.name} (${workspace.slug})`);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
