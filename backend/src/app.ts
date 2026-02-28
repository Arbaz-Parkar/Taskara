import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import serviceRoutes from "./modules/services/service.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

export default app;