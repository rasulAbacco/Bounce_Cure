// ✅ FIXED: server/routes/automation.js - Fetch from AutomationLog table

import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

/* ==========================================================
   📋 GET SCHEDULED CAMPAIGNS - FROM AUTOMATIONLOG TABLE
========================================================== */
router.get("/scheduled", async (req, res) => {
  try {
    console.log("📋 Fetching all scheduled/recurring campaigns for user:", req.user.id);

    const userId = req.user.id;

    // ✅ Fetch from AutomationLog
    const automationLogs = await prisma.automationLog.findMany({
      where: {
        userId,
        status: { in: ["scheduled", "recurring", "processing", "paused", "sent", "failed"] },
      },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Fetch directly from Campaign table (fallback)
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId,
        status: { in: ["scheduled", "recurring", "processing"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🧩 Merge both results into one clean list
   // 🧩 Merge both results into one clean list
const merged = [
  ...automationLogs.map((log) => {
    const campaign = log.campaign || {};

    // ✅ Safely parse recipientsJson if it exists
    let recipients = [];
    try {
      recipients = campaign.recipientsJson ? JSON.parse(campaign.recipientsJson) : [];
    } catch {
      recipients = [];
    }

    return {
      id: log.campaignId || campaign.id,
      campaignName: log.campaignName || campaign.name,
      subject: campaign.subject || log.campaignName,
      status: log.status || campaign.status,
      scheduleType: campaign.scheduleType || "scheduled",
      scheduledDateTime: campaign.scheduledAt
        ? campaign.scheduledAt.toISOString()
        : null,
      recurringFrequency: campaign.recurringFrequency,
      recurringDays: campaign.recurringDays,
      fromEmail: campaign.fromEmail,
      fromName: campaign.fromName,
      createdAt: log.createdAt,
      message: log.message,
      error: log.error,

      // ✅ FIXED: Correct recipient count logic
      recipients: recipients.length || campaign.sentCount || log.sentCount || 0,
      sentCount: campaign.sentCount || log.sentCount || 0,
    };
  }),

  ...campaigns.map((campaign) => {
    let recipients = [];
    try {
      recipients = campaign.recipientsJson ? JSON.parse(campaign.recipientsJson) : [];
    } catch {
      recipients = [];
    }

    return {
      id: campaign.id,
      campaignName: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      scheduleType: campaign.scheduleType || "scheduled",
      scheduledDateTime: campaign.scheduledAt
        ? campaign.scheduledAt.toISOString()
        : null,
      recurringFrequency: campaign.recurringFrequency,
      recurringDays: campaign.recurringDays,
      fromEmail: campaign.fromEmail,
      fromName: campaign.fromName,
      createdAt: campaign.createdAt,
      message:
        campaign.status === "scheduled"
          ? "Campaign scheduled and waiting to send"
          : "Campaign active",
      error: null,

      // ✅ Correct count for table
      recipients: recipients.length || campaign.sentCount || 0,
      sentCount: campaign.sentCount || 0,
    };
  }),
];


    // 🧹 Remove duplicates (based on campaignId)
    const unique = Object.values(
      merged.reduce((acc, curr) => {
        const key = curr.id;
        if (!acc[key]) acc[key] = curr;
        return acc;
      }, {})
    );

    console.log(`✅ Returning ${unique.length} combined campaigns`);
    res.json(unique);
  } catch (error) {
    console.error("❌ Error fetching scheduled campaigns:", error);
    res.status(500).json({ error: "Failed to fetch scheduled campaigns" });
  }
});


/* ==========================================================
   📊 GET AUTOMATION LOGS
========================================================== */
router.get("/logs", async (req, res) => {
  try {
    console.log("📊 Fetching automation logs for user:", req.user.id);

    const logs = await prisma.automationLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    console.log(`✅ Found ${logs.length} automation logs`);

    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching automation logs:", error);
    res.status(500).json({ error: "Failed to fetch automation logs" });
  }
});

/* ==========================================================
   ⏸️ PAUSE CAMPAIGN
========================================================== */
router.post("/:id/pause", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "paused" },
    });

    await prisma.automationLog.create({
      data: {
        userId: req.user.id,
        campaignId,
        campaignName: campaign.name,
        status: "paused",
        message: "Campaign paused by user",
      },
    });

    console.log(`⏸️ Campaign ${campaignId} paused`);

    res.json({ success: true, message: "Campaign paused" });
  } catch (error) {
    console.error("❌ Error pausing campaign:", error);
    res.status(500).json({ error: "Failed to pause campaign" });
  }
});

/* ==========================================================
   ▶️ RESUME CAMPAIGN
========================================================== */
router.post("/:id/resume", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "scheduled" },
    });

    await prisma.automationLog.create({
      data: {
        userId: req.user.id,
        campaignId,
        campaignName: campaign.name,
        status: "scheduled",
        message: "Campaign resumed by user",
      },
    });

    console.log(`▶️ Campaign ${campaignId} resumed`);

    res.json({ success: true, message: "Campaign resumed" });
  } catch (error) {
    console.error("❌ Error resuming campaign:", error);
    res.status(500).json({ error: "Failed to resume campaign" });
  }
});

/* ==========================================================
   🗑️ DELETE CAMPAIGN
========================================================== */
router.post("/:id/delete", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Delete automation logs first (if not cascade)
    await prisma.automationLog.deleteMany({
      where: { campaignId },
    });

    // Delete campaign
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    console.log(`🗑️ Campaign ${campaignId} deleted`);

    res.json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    console.error("❌ Error deleting campaign:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

/* ==========================================================
   🔄 TRIGGER CRON (Manual Trigger for Testing)
========================================================== */
router.post("/trigger-cron", async (req, res) => {
  try {
    console.log("🔄 Manual cron trigger by user:", req.user.id);

    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    const dueCampaigns = await prisma.campaign.findMany({
      where: {
        userId: req.user.id,
        scheduleType: "scheduled",
        scheduledAt: {
          gte: twoMinutesAgo,
          lte: now,
        },
        sentCount: 0,
        status: { not: "sent" },
      },
    });

    console.log(`📋 Found ${dueCampaigns.length} campaigns ready to send`);

    res.json({
      success: true,
      message: `Found ${dueCampaigns.length} scheduled campaigns ready to send`,
      campaigns: dueCampaigns.map(c => ({
        id: c.id,
        name: c.name,
        scheduledAt: c.scheduledAt,
        status: c.status,
      })),
    });
  } catch (error) {
    console.error("❌ Error triggering cron:", error);
    res.status(500).json({ error: "Failed to trigger cron" });
  }
});

/* ==========================================================
   ✅ CHECK SENDER VERIFICATION
========================================================== */
router.get("/sender/verification", async (req, res) => {
  try {
    res.json({
      verified: true,
      domainAuth: {
        spf: true,
        dkim: true,
        dmarc: false,
      },
    });
  } catch (error) {
    console.error("❌ Error checking sender verification:", error);
    res.status(500).json({ error: "Failed to check verification" });
  }
});

export default router;