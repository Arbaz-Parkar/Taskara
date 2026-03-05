const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@taskara.com";

const getOrCreateRole = async (name) => {
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const existing = roles.find((role) => role.name.toLowerCase() === name);
  if (existing) {
    return existing;
  }

  return prisma.role.create({
    data: { name },
    select: {
      id: true,
      name: true,
    },
  });
};

const run = async () => {
  const adminRole = await getOrCreateRole("admin");
  const userRole = await getOrCreateRole("user");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      roleId: true,
    },
  });

  let changed = 0;
  let alreadyCorrect = 0;

  for (const user of users) {
    const targetRoleId =
      user.email.toLowerCase() === ADMIN_EMAIL ? adminRole.id : userRole.id;

    if (user.roleId === targetRoleId) {
      alreadyCorrect += 1;
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        roleId: targetRoleId,
      },
    });

    changed += 1;
  }

  console.log("Role sync complete.");
  console.log(`Total users checked: ${users.length}`);
  console.log(`Updated users: ${changed}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Admin account policy: only ${ADMIN_EMAIL} is admin.`);
};

run()
  .catch((error) => {
    console.error("Role sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
