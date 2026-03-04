import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import serviceRoutes from "./modules/services/service.routes";
import orderRoutes from "./modules/orders/order.routes";
import userRoutes from "./modules/users/user.routes";
import reviewRoutes from "./modules/reviews/review.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

export default app;
