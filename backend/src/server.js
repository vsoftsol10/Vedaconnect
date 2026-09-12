import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import hubRoutes from "./routes/hubRoutes.js";
import adminEventRoutes from "./routes/adminEventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import networkingRoutes from "./routes/networkingRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import meetingFeeRoutes from "./routes/meetingFeeRoutes.js";
import { scheduleMemberLifecycleJob } from "./jobs/memberLifecycleJob.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set([
  ...(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  process.env.FRONTEND_ORIGIN?.trim().replace(/\/$/, ""),
  "http://localhost:5173",
  "http://localhost:5174",
  "https://member.vedacraftscommunity.in",
]);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/networking", networkingRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/meeting-fee", meetingFeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/hubs", hubRoutes);
app.use("/api/admin/events", adminEventRoutes);

// 404 + centralized error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`VedaConnect backend running on http://localhost:${PORT}`);
});

scheduleMemberLifecycleJob();
