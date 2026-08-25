import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";





const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// Routes
app.use("/api", healthRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);

// 404 + centralized error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VedaConnect backend running on http://localhost:${PORT}`);
});
