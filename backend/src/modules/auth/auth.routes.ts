import { Router } from "express";
import { register, login } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import prisma from "../../utils/prisma";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, async (req, res) => {
  const authUser = (req as any).user;
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    user: {
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
    },
  });
});

// Admin-only route
router.get(
  "/admin",
  authenticate,
  requireRole(["admin"]),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;
