import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@taskara.com";

const getEffectiveRoleName = (email: string) =>
  email.trim().toLowerCase() === ADMIN_EMAIL ? "admin" : "user";

const getOrCreateRoleByName = async (name: string) => {
  const existing = await prisma.role.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.role.create({
    data: {
      name,
    },
  });
};

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  const normalizedEmail = email.trim().toLowerCase();
  const effectiveRoleName = getEffectiveRoleName(normalizedEmail);
  const role = await getOrCreateRoleByName(effectiveRoleName);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: {
        connect: { id: role.id },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const effectiveRoleName = getEffectiveRoleName(user.email);

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: effectiveRoleName,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: effectiveRoleName,
    },
  };
};
