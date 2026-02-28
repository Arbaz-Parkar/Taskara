import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  /*
   =============================
   ROLES
   =============================
  */

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  console.log("✅ Roles ensured");

  /*
   =============================
   ADMIN USER (YOU)
   =============================
  */

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@taskara.com" },
    update: {},
    create: {
      name: "Taskara Admin",
      email: "admin@taskara.com",
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log("✅ Admin user ready");

  /*
   =============================
   OPTIONAL: SAMPLE NORMAL USER
   (useful for testing marketplace)
   =============================
  */

  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "user@taskara.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@taskara.com",
      passwordHash: userPassword,
      roleId: userRole.id,
      isActive: true,
    },
  });

  console.log("✅ Demo user ready");

  console.log("🌱 Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });