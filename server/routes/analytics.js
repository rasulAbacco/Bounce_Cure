// // server/routes/analytics.js

// server/routes/analytics.js
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is required");
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

// ===== Test Route =====
router.get("/", (req, res) => {
  res.json({ message: "Analytics route working" });
});

// ===== SendGrid Summary with DB Fallback =====
router.get("/sendgrid/summary", protect, async (req, res) => {
  const startDate = req.query.startDate || "2024-01-01";
  const endDate = req.query.endDate || new Date().toISOString().split("T")[0];

  try {
    // Optional: fetch SendGrid data globally (no user filter possible)
    const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`;
    const data = await fetchWithCache(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // If you want to return SendGrid stats, be aware this is global across all users
    // You can choose to return this or skip this block

    return res.json({
      source: "sendgrid",
      // parse and sum metrics here (like you had)
      // but this is not user filtered
    });
  } catch (err) {
    console.error("SendGrid fetch failed or skipped, falling back to DB:", err);

    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          userId: req.user.id,  // **Filter by logged-in user**
        },
      });

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
  // Pagination query params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100); // max 100 per page
  const offset = (page - 1) * limit;

  // Date range filtering for stats (defaults)
  const startDate = req.query.startDate || "2024-01-01";
  const endDate = req.query.endDate || new Date().toISOString().split("T")[0];

  try {
    // Fetch paginated campaigns from database
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: req.user.id, // 👈 Filter by authenticated user
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });


    // Fetch SendGrid stats for date range
    const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`;
    let sendGridData = [];
    try {
      sendGridData = await fetchWithCache(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
    } catch (sgErr) {
      console.warn("SendGrid stats fetch failed, using DB only:", sgErr.message);
    }

    // Aggregate daily stats from SendGrid (sum all stat entries per day)
    const dailyStats = {};
    sendGridData.forEach((day) => {
      if (Array.isArray(day.stats)) {
        if (!dailyStats[day.date]) {
          dailyStats[day.date] = { delivered: 0, opens: 0, clicks: 0, uniqueOpens: 0 };
        }
        day.stats.forEach(stat => {
          const metrics = stat.metrics || {};
          dailyStats[day.date].delivered += metrics.delivered || 0;
          dailyStats[day.date].opens += metrics.opens || 0;
          dailyStats[day.date].clicks += metrics.clicks || 0;
          dailyStats[day.date].uniqueOpens += metrics.unique_opens || 0;
        });
      }
    });

    // Merge campaign data with SendGrid stats by matching createdAt date
    const enrichedCampaigns = campaigns.map((campaign) => {
      const campaignDate = campaign.createdAt
        ? new Date(campaign.createdAt).toISOString().split("T")[0]
        : null;

      let sgStats = dailyStats[campaignDate] || null;

      // If no exact match, approximate average stats if available
      if (!sgStats && Object.keys(dailyStats).length > 0) {
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

    res.json({
      page,
      limit,
      count: enrichedCampaigns.length,
      campaigns: enrichedCampaigns
    });
  } catch (err) {
    console.error("Error fetching campaign analytics:", err);

    // Fallback to DB only, paginated
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          userId: req.user.id,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
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

      res.json({
        page,
        limit,
        count: enrichedCampaigns.length,
        campaigns: enrichedCampaigns
      });
    } catch (dbErr) {
      console.error("DB fallback failed:", dbErr);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  }
});

export { router };


















// import express from "express";
// import fetch from "node-fetch";
// import { prisma } from "../prisma/prismaClient.js";

// const router = express.Router();
// const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY_MAIL || process.env.SENDGRID_API_KEY;

// // ===== Test Route =====
// router.get("/", (req, res) => {
//   res.json({ message: "Analytics route working" });
// });

// // ===== SendGrid Summary with DB Fallback =====
// router.get("/sendgrid/summary", async (req, res) => {
//   const today = new Date().toISOString().split("T")[0];
//   const startDate = "2024-01-01";

//   try {
//     // ===== Fetch from SendGrid =====
//     const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${today}&aggregated_by=day`;
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${SENDGRID_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       const errText = await response.text();
//       console.error("SendGrid API error:", errText);
//       throw new Error(`SendGrid API failed: ${response.status}`);
//     }

//     const data = await response.json();

//     // Initialize counters
//     let processed = 0;
//     let delivered = 0;
//     let opens = 0;
//     let clicks = 0;
//     let conversions = 0;

//     data.forEach((day) => {
//       if (day.stats && day.stats.length > 0) {
//         const metrics = day.stats[0].metrics;
//         processed += metrics.processed || 0;
//         delivered += metrics.delivered || 0;
//         opens += metrics.opens || 0;
//         clicks += metrics.clicks || 0;
//         conversions += metrics.unique_opens || 0;
//       }
//     });

//     return res.json({
//       source: "sendgrid",
//       processed,
//       delivered,
//       opens,
//       clicks,
//       conversions,
//       openRate: delivered > 0 ? Math.round((opens / delivered) * 100) : 0,
//       clickRate: delivered > 0 ? Math.round((clicks / delivered) * 100) : 0,
//       conversionRate: delivered > 0 ? Math.round((conversions / delivered) * 100) : 0,
//     });
//   } catch (err) {
//     console.error("SendGrid fetch failed, falling back to DB:", err);

//     try {
//       const campaigns = await prisma.campaign.findMany();

//       let processed = 0;
//       let delivered = 0;
//       let opens = 0;
//       let clicks = 0;
//       let conversions = 0;

//       campaigns.forEach((c) => {
//         processed += c.sentCount || 0;
//         delivered += c.sentCount || 0;
//         opens += c.openCount || 0;
//         clicks += c.clickCount || 0;
//         conversions += c.conversionCount || 0;
//       });

//       return res.json({
//         source: "db",
//         processed,
//         delivered,
//         opens,
//         clicks,
//         conversions,
//         openRate: delivered > 0 ? Math.round((opens / delivered) * 100) : 0,
//         clickRate: delivered > 0 ? Math.round((clicks / delivered) * 100) : 0,
//         conversionRate: delivered > 0 ? Math.round((conversions / delivered) * 100) : 0,
//       });
//     } catch (dbErr) {
//       console.error("DB fallback failed:", dbErr);
//       return res.status(500).json({ error: "Analytics unavailable" });
//     }
//   }
// });

// // ===== NEW: Get detailed stats per campaign from SendGrid =====
// router.get("/sendgrid/campaigns", async (req, res) => {
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const startDate = "2024-01-01";

//     // Fetch campaigns from database
//     const campaigns = await prisma.campaign.findMany({
//       orderBy: { createdAt: 'desc' }
//     });

//     // Fetch SendGrid stats
//     const url = `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${today}&aggregated_by=day`;
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${SENDGRID_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     });

//     let sendGridData = [];
//     if (response.ok) {
//       sendGridData = await response.json();
//     }

//     // Calculate stats per day from SendGrid
//     const dailyStats = {};
//     sendGridData.forEach((day) => {
//       if (day.stats && day.stats.length > 0) {
//         const metrics = day.stats[0].metrics;
//         dailyStats[day.date] = {
//           delivered: metrics.delivered || 0,
//           opens: metrics.opens || 0,
//           clicks: metrics.clicks || 0,
//           uniqueOpens: metrics.unique_opens || 0,
//         };
//       }
//     });

//     // Merge campaign data with SendGrid stats
//     const enrichedCampaigns = campaigns.map((campaign, index) => {
//       const campaignDate = campaign.createdAt 
//         ? new Date(campaign.createdAt).toISOString().split("T")[0]
//         : null;

//       let sgStats = dailyStats[campaignDate] || null;

//       // If no exact match, distribute stats evenly or use DB values
//       if (!sgStats && Object.keys(dailyStats).length > 0) {
//         // Use average stats if available
//         const totalDays = Object.keys(dailyStats).length;
//         const avgStats = Object.values(dailyStats).reduce((acc, day) => ({
//           delivered: acc.delivered + day.delivered,
//           opens: acc.opens + day.opens,
//           clicks: acc.clicks + day.clicks,
//           uniqueOpens: acc.uniqueOpens + day.uniqueOpens,
//         }), { delivered: 0, opens: 0, clicks: 0, uniqueOpens: 0 });

//         sgStats = {
//           delivered: Math.round(avgStats.delivered / totalDays / campaigns.length),
//           opens: Math.round(avgStats.opens / totalDays / campaigns.length),
//           clicks: Math.round(avgStats.clicks / totalDays / campaigns.length),
//           uniqueOpens: Math.round(avgStats.uniqueOpens / totalDays / campaigns.length),
//         };
//       }

//       const sentCount = campaign.sentCount || sgStats?.delivered || 0;
//       const openCount = campaign.openCount || sgStats?.opens || 0;
//       const clickCount = campaign.clickCount || sgStats?.clicks || 0;
//       const conversionCount = campaign.conversionCount || sgStats?.uniqueOpens || 0;

//       return {
//         id: campaign.id,
//         name: campaign.name || campaign.campaignName || "Untitled",
//         sentCount,
//         openCount,
//         clickCount,
//         conversionCount,
//         createdAt: campaign.createdAt,
//         openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
//         clickRate: sentCount > 0 ? Math.round((clickCount / sentCount) * 100) : 0,
//         conversionRate: sentCount > 0 ? Math.round((conversionCount / sentCount) * 100) : 0,
//       };
//     });

//     res.json(enrichedCampaigns);
//   } catch (err) {
//     console.error("Error fetching campaign analytics:", err);
    
//     // Fallback to DB only
//     try {
//       const campaigns = await prisma.campaign.findMany({
//         orderBy: { createdAt: 'desc' }
//       });

//       const enrichedCampaigns = campaigns.map((campaign) => {
//         const sentCount = campaign.sentCount || 0;
//         const openCount = campaign.openCount || 0;
//         const clickCount = campaign.clickCount || 0;
//         const conversionCount = campaign.conversionCount || 0;

//         return {
//           id: campaign.id,
//           name: campaign.name || campaign.campaignName || "Untitled",
//           sentCount,
//           openCount,
//           clickCount,
//           conversionCount,
//           createdAt: campaign.createdAt,
//           openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
//           clickRate: sentCount > 0 ? Math.round((clickCount / sentCount) * 100) : 0,
//           conversionRate: sentCount > 0 ? Math.round((conversionCount / sentCount) * 100) : 0,
//         };
//       });

//       res.json(enrichedCampaigns);
//     } catch (dbErr) {
//       console.error("DB fallback failed:", dbErr);
//       res.status(500).json({ error: "Failed to fetch campaigns" });
//     }
//   }
// });

// export { router };