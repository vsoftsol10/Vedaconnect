import { Router } from "express";
import { prisma } from "../config/prismaClient.js";

const router = Router();
const DB_TIMEOUT_MS = 15000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timed out.")), DB_TIMEOUT_MS);
    }),
  ]);

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

router.get("/health/db", async (req, res) => {
  try {
    // Lightweight raw query just to confirm Prisma can reach the DB
    await withTimeout(prisma.$queryRaw`SELECT 1`);
    res.json({ success: true, message: "Database connection OK (via Prisma)" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Could not reach the database via Prisma. Check DATABASE_URL in .env.",
      detail: err.message,
    });
  }
});

export default router;
