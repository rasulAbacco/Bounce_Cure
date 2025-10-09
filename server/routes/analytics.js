// server/routes/analytics.js
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const SENDGRID_API_KEY = process.env.SENDGRID_CMP_API_KEY;

if (!SENDGRID_API_KEY) {
  console.warn("SENDGRID_CMP_API_KEY not set - analytics will use database only");
}

// Simple in-memory cache for SendGrid API responses
const cache = new Map();

async function fetchWithCache(url, options, ttl = 600000) { // 10 minutes TTL
  if (cache.has(url)) {
    const cached = cache.get(url);
    if (Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Test Route
router.get("/", (req, res) => {
  res.json({ message: "Analytics route working" });
});

// SendGrid Summary with DB (User-Specific)
router.get("/sendgrid/summary", protect, async (req, res) => {
  const startDate = req.query.startDate || "2024-01-01";
  const endDate = req.query.endDate || new Date().toISOString().split("T")[0];

  try {
    // Get user-specific campaigns
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate + "T23:59:59.999Z"), // Include full end date
        },
      },
      include: {
        events: true, // Include events to count delivered
      },
    });

    let processed = 0; // Total attempted sends
    let delivered = 0; // Successfully delivered
    let opens = 0;
    let clicks = 0;
    let conversions = 0;

    for (const c of campaigns) {
      // ✅ Processed = total attempted sends (from sentCount)
      processed += c.sentCount || 0;
      
      // ✅ Delivered = count of "delivered" events
      const deliveredCount = c.events?.filter(e => e.type === "delivered").length || 0;
      delivered += deliveredCount;
      
      // ✅ Engagement metrics from campaign fields
      opens += c.openCount || 0;
      clicks += c.clickCount || 0;
      conversions += c.conversionCount || 0;
    }

    // ✅ Calculate rates based on DELIVERED count (not processed)
    const openRate = delivered > 0 ? Math.round((opens / delivered) * 100) : 0;
    const clickRate = delivered > 0 ? Math.round((clicks / delivered) * 100) : 0;
    const conversionRate = delivered > 0 ? Math.round((conversions / delivered) * 100) : 0;

    return res.json({
      source: "db",
      processed,
      delivered,
      opens,
      clicks,
      conversions,
      openRate,
      clickRate,
      conversionRate,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ error: "Analytics unavailable", details: error.message });
  }
});

// Get detailed stats per campaign
router.get("/sendgrid/campaigns", protect, async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = (page - 1) * limit;

  const startDate = req.query.startDate || "2024-01-01";
  const endDate = req.query.endDate || new Date().toISOString().split("T")[0];

  try {
    // ✅ Count total campaigns for pagination
    const totalCount = await prisma.campaign.count({
      where: { userId: req.user.id },
    });

    // ✅ Fetch paginated campaigns with events
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        events: true, // Include all events
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // ✅ Enrich campaigns with proper delivery count
    const enrichedCampaigns = campaigns.map((campaign) => {
      // ✅ sentCount = total attempted (already in DB)
      const sentCount = campaign.sentCount || 0;

      // ✅ deliveredCount = only "delivered" events
      const deliveredCount = campaign.events?.filter(e => e.type === "delivered").length || 0;

      // ✅ Get engagement metrics
      const openCount = campaign.openCount || 0;
      const clickCount = campaign.clickCount || 0;
      const conversionCount = campaign.conversionCount || 0;

      return {
        id: campaign.id,
        name: campaign.name || campaign.campaignName || "Untitled",
        sentCount,
        deliveredCount,
        openCount,
        clickCount,
        conversionCount,
        createdAt: campaign.createdAt,
        openRate: deliveredCount > 0 ? Math.round((openCount / deliveredCount) * 100) : 0,
        clickRate: deliveredCount > 0 ? Math.round((clickCount / deliveredCount) * 100) : 0,
        conversionRate: deliveredCount > 0 ? Math.round((conversionCount / deliveredCount) * 100) : 0,
      };
    });

    res.json({
      page,
      limit,
      total: totalCount,
      count: enrichedCampaigns.length,
      campaigns: enrichedCampaigns
    });
  } catch (err) {
    console.error("Error fetching campaign analytics:", err);
    res.status(500).json({ error: "Failed to fetch campaigns", details: err.message });
  }
});

export { router };