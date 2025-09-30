// server/routes/analytics.js
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY_MAIL || process.env.SENDGRID_API_KEY;

// ===== Test Route =====
router.get("/", (req, res) => {
  res.json({ message: "Analytics route working" });
});

// ===== SendGrid Summary with DB Fallback =====
router.get("/sendgrid/summary", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const startDate = "2024-01-01";

  try {
    // ===== Fetch from SendGrid =====
    const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${today}&aggregated_by=day`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("SendGrid API error:", errText);
      throw new Error(`SendGrid API failed: ${response.status}`);
    }

    const data = await response.json();

    // Initialize counters
    let processed = 0;
    let delivered = 0;
    let opens = 0;
    let clicks = 0;
    let conversions = 0;

    data.forEach((day) => {
      if (day.stats && day.stats.length > 0) {
        const metrics = day.stats[0].metrics;
        processed += metrics.processed || 0;
        delivered += metrics.delivered || 0;
        opens += metrics.opens || 0;
        clicks += metrics.clicks || 0;
        conversions += metrics.unique_opens || 0;
      }
    });

    return res.json({
      source: "sendgrid",
      processed,
      delivered,
      opens,
      clicks,
      conversions,
      openRate: delivered > 0 ? Math.round((opens / delivered) * 100) : 0,
      clickRate: delivered > 0 ? Math.round((clicks / delivered) * 100) : 0,
      conversionRate: delivered > 0 ? Math.round((conversions / delivered) * 100) : 0,
    });
  } catch (err) {
    console.error("SendGrid fetch failed, falling back to DB:", err);

    try {
      const campaigns = await prisma.campaign.findMany();

      let processed = 0;
      let delivered = 0;
      let opens = 0;
      let clicks = 0;
      let conversions = 0;

      campaigns.forEach((c) => {
        processed += c.sentCount || 0;
        delivered += c.sentCount || 0;
        opens += c.openCount || 0;
        clicks += c.clickCount || 0;
        conversions += c.conversionCount || 0;
      });

      return res.json({
        source: "db",
        processed,
        delivered,
        opens,
        clicks,
        conversions,
        openRate: delivered > 0 ? Math.round((opens / delivered) * 100) : 0,
        clickRate: delivered > 0 ? Math.round((clicks / delivered) * 100) : 0,
        conversionRate: delivered > 0 ? Math.round((conversions / delivered) * 100) : 0,
      });
    } catch (dbErr) {
      console.error("DB fallback failed:", dbErr);
      return res.status(500).json({ error: "Analytics unavailable" });
    }
  }
});

// ===== NEW: Get detailed stats per campaign from SendGrid =====
router.get("/sendgrid/campaigns", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startDate = "2024-01-01";

    // Fetch campaigns from database
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Fetch SendGrid stats
    const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${today}&aggregated_by=day`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    let sendGridData = [];
    if (response.ok) {
      sendGridData = await response.json();
    }

    // Calculate stats per day from SendGrid
    const dailyStats = {};
    sendGridData.forEach((day) => {
      if (day.stats && day.stats.length > 0) {
        const metrics = day.stats[0].metrics;
        dailyStats[day.date] = {
          delivered: metrics.delivered || 0,
          opens: metrics.opens || 0,
          clicks: metrics.clicks || 0,
          uniqueOpens: metrics.unique_opens || 0,
        };
      }
    });

    // Merge campaign data with SendGrid stats
    const enrichedCampaigns = campaigns.map((campaign, index) => {
      const campaignDate = campaign.createdAt 
        ? new Date(campaign.createdAt).toISOString().split("T")[0]
        : null;

      let sgStats = dailyStats[campaignDate] || null;

      // If no exact match, distribute stats evenly or use DB values
      if (!sgStats && Object.keys(dailyStats).length > 0) {
        // Use average stats if available
        const totalDays = Object.keys(dailyStats).length;
        const avgStats = Object.values(dailyStats).reduce((acc, day) => ({
          delivered: acc.delivered + day.delivered,
          opens: acc.opens + day.opens,
          clicks: acc.clicks + day.clicks,
          uniqueOpens: acc.uniqueOpens + day.uniqueOpens,
        }), { delivered: 0, opens: 0, clicks: 0, uniqueOpens: 0 });

        sgStats = {
          delivered: Math.round(avgStats.delivered / totalDays / campaigns.length),
          opens: Math.round(avgStats.opens / totalDays / campaigns.length),
          clicks: Math.round(avgStats.clicks / totalDays / campaigns.length),
          uniqueOpens: Math.round(avgStats.uniqueOpens / totalDays / campaigns.length),
        };
      }

      const sentCount = campaign.sentCount || sgStats?.delivered || 0;
      const openCount = campaign.openCount || sgStats?.opens || 0;
      const clickCount = campaign.clickCount || sgStats?.clicks || 0;
      const conversionCount = campaign.conversionCount || sgStats?.uniqueOpens || 0;

      return {
        id: campaign.id,
        name: campaign.name || campaign.campaignName || "Untitled",
        sentCount,
        openCount,
        clickCount,
        conversionCount,
        createdAt: campaign.createdAt,
        openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
        clickRate: sentCount > 0 ? Math.round((clickCount / sentCount) * 100) : 0,
        conversionRate: sentCount > 0 ? Math.round((conversionCount / sentCount) * 100) : 0,
      };
    });

    res.json(enrichedCampaigns);
  } catch (err) {
    console.error("Error fetching campaign analytics:", err);
    
    // Fallback to DB only
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
      });

      const enrichedCampaigns = campaigns.map((campaign) => {
        const sentCount = campaign.sentCount || 0;
        const openCount = campaign.openCount || 0;
        const clickCount = campaign.clickCount || 0;
        const conversionCount = campaign.conversionCount || 0;

        return {
          id: campaign.id,
          name: campaign.name || campaign.campaignName || "Untitled",
          sentCount,
          openCount,
          clickCount,
          conversionCount,
          createdAt: campaign.createdAt,
          openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
          clickRate: sentCount > 0 ? Math.round((clickCount / sentCount) * 100) : 0,
          conversionRate: sentCount > 0 ? Math.round((conversionCount / sentCount) * 100) : 0,
        };
      });

      res.json(enrichedCampaigns);
    } catch (dbErr) {
      console.error("DB fallback failed:", dbErr);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  }
});

export { router };