import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

// ✅ JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ GET Dashboard Data
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const [campaignData, deviceData, hourlyEngagementData, notifications] =
      await Promise.all([
        prisma.campaign.findMany(),
        prisma.deviceStat.findMany(),
        prisma.hourlyEngagement.findMany(),
        prisma.notification.findMany()
      ]);

    res.json({
      campaignData,
      deviceData,
      hourlyEngagementData,
      notifications,
      user: req.user
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// ✅ POST Create Campaign
router.post("/campaigns", authMiddleware, async (req, res) => {
  try {
    const { name, date, status, open, click, bounce, revenue } = req.body;

    if (!name || !date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        date: new Date(date),
        status,
        open,
        click,
        bounce,
        revenue
      }
    });

    res.status(201).json({
      message: "✅ Campaign created successfully",
      campaign
    });
  } catch (err) {
    console.error("❌ Error creating campaign:", err);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

export default router;
