import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import serviceRoutes from "./modules/services/service.routes";
import orderRoutes from "./modules/orders/order.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);

export default app;
