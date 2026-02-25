import { Router } from "express";
import { register, login } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, (req, res) => {
  res.json({ user: (req as any).user });
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
